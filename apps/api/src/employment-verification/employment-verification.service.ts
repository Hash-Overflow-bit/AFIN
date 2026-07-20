import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateEmploymentVerificationDto } from './dto/create-request.dto';
import { ReviewEmploymentVerificationDto } from './dto/review-request.dto';
import { QueueService } from '../queue/queue.service';

@Injectable()
export class EmploymentVerificationService {
  private readonly logger = new Logger(EmploymentVerificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly queueService: QueueService,
  ) {}

  async createRequest(investorId: string, dto: CreateEmploymentVerificationDto) {
    // Check if one already exists and is pending
    const existing = await this.prisma.employmentVerification.findFirst({
      where: {
        investorId,
        status: { in: ['REQUEST_SENT', 'PENDING_REVIEW', 'RESPONSE_RECEIVED'] }
      }
    });

    if (existing) {
      throw new BadRequestException('An employment verification request is already in progress.');
    }

    const verification = await this.prisma.employmentVerification.create({
      data: {
        investorId,
        employerName: dto.employerName,
        contactName: dto.contactName,
        employerEmail: dto.employerEmail,
        jobTitle: dto.jobTitle,
        department: dto.department,
        employeeId: dto.employeeId,
        status: 'REQUEST_SENT',
      },
    });

    // Also update the investor profile with these details
    await this.prisma.investorProfile.update({
      where: { userId: investorId },
      data: {
        employerName: dto.employerName,
        jobTitle: dto.jobTitle,
      }
    });

    // Log the action
    await this.prisma.verificationAuditLog.create({
      data: {
        verificationId: verification.id,
        action: 'REQUEST_SENT',
        notes: `Request sent to ${dto.employerEmail}`,
      }
    });

    // For MVP: Log the mock email link to the console
    const mockLink = `http://localhost:3000/en/verify-employment/${verification.token}`;
    this.logger.log(`\n\n[MVP MOCK EMAIL] Secure Employer Verification Link for ${dto.employerName}:\n=> ${mockLink}\n\n`);

    // In a real app we would queue the email here:
    // await this.queueService.sendEmployerVerificationEmail(verification.employerEmail, verification.token);

    return verification;
  }

  async getInvestorVerification(investorId: string) {
    return this.prisma.employmentVerification.findFirst({
      where: { investorId },
      orderBy: { createdAt: 'desc' },
      include: {
        auditLogs: { orderBy: { createdAt: 'desc' } }
      }
    });
  }

  // --- Public Employer Endpoints ---

  async getByToken(token: string) {
    const verification = await this.prisma.employmentVerification.findUnique({
      where: { token },
      include: {
        investor: {
          select: { firstName: true, lastName: true }
        }
      }
    });

    if (!verification) {
      throw new NotFoundException('Verification request not found or invalid token.');
    }

    return {
      id: verification.id,
      investorName: `${verification.investor.firstName} ${verification.investor.lastName}`,
      jobTitle: verification.jobTitle,
      status: verification.status
    };
  }

  async submitEmployerDocuments(token: string, file: Express.Multer.File) {
    const verification = await this.prisma.employmentVerification.findUnique({ where: { token } });
    if (!verification) throw new NotFoundException('Invalid token');
    if (verification.status !== 'REQUEST_SENT') {
      throw new BadRequestException('This verification request has already been processed or closed.');
    }

    // Usually we would upload 'file' to Supabase Storage here and get a path
    // For MVP, we will mock the path or just save the file metadata
    const mockPath = `employers/${verification.id}/${file.originalname}`;

    const updated = await this.prisma.employmentVerification.update({
      where: { id: verification.id },
      data: {
        status: 'PENDING_REVIEW',
        documentPath: mockPath,
        documentName: file.originalname,
      }
    });

    await this.prisma.verificationAuditLog.create({
      data: {
        verificationId: verification.id,
        action: 'DOCUMENT_UPLOADED',
        notes: `Employer uploaded file: ${file.originalname}`,
      }
    });

    return updated;
  }

  // --- Admin / Broker Endpoints ---

  async reviewVerification(id: string, reviewerId: string, dto: ReviewEmploymentVerificationDto) {
    const verification = await this.prisma.employmentVerification.findUnique({ where: { id } });
    if (!verification) throw new NotFoundException('Verification not found');

    const updated = await this.prisma.employmentVerification.update({
      where: { id },
      data: {
        status: dto.status,
        rejectionReason: dto.status === 'REJECTED' ? dto.notes : null,
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
      }
    });

    await this.prisma.verificationAuditLog.create({
      data: {
        verificationId: id,
        action: dto.status,
        actorId: reviewerId,
        notes: dto.notes || `Verification marked as ${dto.status}`,
      }
    });

    // If approved, update the investor profile
    if (dto.status === 'APPROVED') {
      await this.prisma.investorProfile.update({
        where: { userId: verification.investorId },
        data: {
          employerName: verification.employerName,
          jobTitle: verification.jobTitle,
        }
      });
    }

    return updated;
  }

  async getAdminAll() {
    return this.prisma.employmentVerification.findMany({
      include: {
        investor: { select: { firstName: true, lastName: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}
