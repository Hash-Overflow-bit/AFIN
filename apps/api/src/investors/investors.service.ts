import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class InvestorsService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    try {
      const profile = await (this.prisma as any).investorProfile.findUnique({
        where: { userId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
              status: true,
              kycStatus: true,
              kycRejectionReason: true,
            },
          },
        },
      });

      if (!profile) {
        // Return a mock profile structure if they are a broker, to avoid breaking the UI for now
        const user = await (this.prisma as any).user.findUnique({ where: { id: userId } });
        if (user && user.role === 'BROKER') {
           return { user, kycStatus: user.kycStatus };
        }
        throw new NotFoundException('Investor profile not found');
      }

      return { ...profile, kycStatus: profile.user.kycStatus };
    } catch (e) {
      console.error('Error in getProfile:', e);
      throw e;
    }
  }

  async updateProfile(userId: string, dto: UpdateProfileDto, ipAddress?: string) {
    try {
      const currentProfile = await (this.prisma as any).investorProfile.findUnique({
        where: { userId },
        include: { user: true }
      });

      if (!currentProfile) {
        throw new NotFoundException('Investor profile not found');
      }

      const dateOfBirth = dto.dateOfBirth ? new Date(dto.dateOfBirth) : currentProfile.dateOfBirth;
      const nationality = dto.nationality ?? currentProfile.nationality;
      const taxId = dto.taxId ?? currentProfile.taxId;
      const addressLine1 = dto.addressLine1 ?? currentProfile.addressLine1;
      const city = dto.city ?? currentProfile.city;
      const country = dto.country ?? currentProfile.country;
      const employerName = dto.employerName ?? currentProfile.employerName;
      const jobTitle = dto.jobTitle ?? currentProfile.jobTitle;
      const sourceOfFunds = dto.sourceOfFunds ?? currentProfile.sourceOfFunds;

      const isProfileComplete = Boolean(
        dateOfBirth &&
        nationality &&
        taxId &&
        addressLine1 &&
        city &&
        country &&
        employerName &&
        jobTitle &&
        sourceOfFunds
      );

      let newKycStatus = currentProfile.user.kycStatus;
      if (isProfileComplete && currentProfile.user.kycStatus === 'INCOMPLETE') {
        newKycStatus = 'PENDING';
      }

      const updatedProfile = await (this.prisma as any).investorProfile.update({
        where: { userId },
        data: {
          dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
          nationality: dto.nationality,
          taxId: dto.taxId,
          addressLine1: dto.addressLine1,
          addressLine2: dto.addressLine2,
          city: dto.city,
          country: dto.country,
          postalCode: dto.postalCode,
          employerName: dto.employerName,
          jobTitle: dto.jobTitle,
          sourceOfFunds: dto.sourceOfFunds,
        },
      });

      if (newKycStatus !== currentProfile.user.kycStatus) {
        await (this.prisma as any).user.update({
          where: { id: userId },
          data: { kycStatus: newKycStatus },
        });
      }

      await (this.prisma as any).activityLog.create({
        data: {
          userId,
          action: 'PROFILE_UPDATED',
          resourceType: 'investor_profiles',
          resourceId: updatedProfile.id,
          details: JSON.stringify({ fieldsUpdated: Object.keys(dto) }),
          ipAddress: ipAddress || null,
        },
      });

      return await this.getProfile(userId);
    } catch (e) {
      console.error('Error in updateProfile:', e);
      throw e;
    }
  }

  async uploadDocument(userId: string, file: Express.Multer.File, documentType?: string) {
    try {
      const user = await (this.prisma as any).user.findUnique({
        where: { id: userId },
        select: { kycStatus: true },
      });

      if (user && ['DOCUMENTS_SUBMITTED', 'APPROVED'].includes(user.kycStatus)) {
        throw new BadRequestException('Cannot upload documents while KYC is submitted for review or approved.');
      }

      const safeFileName = (file.originalname || 'document').replace(/[^a-zA-Z0-9.\-_]/g, '_');
      const document = await (this.prisma as any).document.create({
        data: {
          userId,
          documentType: documentType || 'IDENTITY',
          fileName: safeFileName,
          filePath: file.path,
          fileSize: file.size,
          mimeType: file.mimetype,
          status: 'UPLOADED',
        },
      });

      await (this.prisma as any).activityLog.create({
        data: {
          userId,
          action: 'DOCUMENT_UPLOADED',
          resourceType: 'documents',
          resourceId: document.id,
          details: JSON.stringify({ fileName: document.fileName, fileSize: document.fileSize, documentType: document.documentType }),
        },
      });

      return document;
    } catch (e) {
      console.error('Error in uploadDocument:', e);
      throw e;
    }
  }

  async submitKyc(userId: string) {
    try {
      const user = await (this.prisma as any).user.findUnique({
        where: { id: userId },
        include: { investorProfile: true },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (!['PENDING', 'PROFILE_COMPLETE', 'REJECTED', 'INCOMPLETE'].includes(user.kycStatus)) {
        throw new BadRequestException(`Cannot submit KYC application when status is ${user.kycStatus}`);
      }

      const docs = await (this.prisma as any).document.findMany({
        where: { userId },
      });

      const uploadedTypes = new Set(docs.map((d: any) => d.documentType));
      let requiredTypes: string[] = [];
      
      if (user.role === 'INVESTOR') {
         requiredTypes = ['IDENTITY', 'TAX_NUMBER', 'ADDRESS', 'PROOF_OF_INCOME'];
         
         const p = user.investorProfile;
         if (!p || !p.employerName || !p.jobTitle || !p.sourceOfFunds) {
           throw new BadRequestException('Employment and Source of Funds details must be provided before submitting KYC');
         }
      } else if (user.role === 'BROKER') {
         requiredTypes = ['BROKER_LICENSE', 'IDENTITY'];
      }

      const missingTypes = requiredTypes.filter(type => !uploadedTypes.has(type));

      if (missingTypes.length > 0) {
        throw new BadRequestException(
          `Missing required documents: ${missingTypes.join(', ')}`
        );
      }

      // Update KYC status to DOCUMENTS_SUBMITTED
      const updatedUser = await (this.prisma as any).user.update({
        where: { id: userId },
        data: { kycStatus: 'DOCUMENTS_SUBMITTED' },
      });

      // Create notification for all active brokers
      const brokers = await (this.prisma as any).user.findMany({
        where: { role: 'BROKER', status: 'ACTIVE' },
      });
      
      if (brokers.length > 0) {
        await (this.prisma as any).notification.createMany({
          data: brokers.map((broker: any) => ({
            userId: broker.id,
            title: 'New KYC Application',
            message: `${user.role === 'BROKER' ? 'Broker' : 'Investor'} ${user.firstName} ${user.lastName} has submitted documents for KYC review.`,
            type: 'KYC_SUBMISSION',
          })),
        });
      }

      await (this.prisma as any).activityLog.create({
        data: {
          userId,
          action: 'KYC_SUBMITTED',
          resourceType: 'users',
          resourceId: user.id,
          details: JSON.stringify({ documentCount: docs.length }),
        },
      });

      return updatedUser;
    } catch (e) {
      console.error('Error in submitKyc:', e);
      throw e;
    }
  }

  async getDocuments(userId: string) {
    return (this.prisma as any).document.findMany({
      where: { userId },
      orderBy: { uploadedAt: 'desc' },
    });
  }

  async getDocumentById(id: string, requestUser: any) {
    const document = await (this.prisma as any).document.findUnique({
      where: { id },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    if (requestUser.role === 'INVESTOR' && document.userId !== requestUser.id) {
      throw new NotFoundException('Document not found');
    }

    return document;
  }
  
  async getKycQueue() {
    const users = await (this.prisma as any).user.findMany({
      where: {
        kycStatus: 'DOCUMENTS_SUBMITTED',
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        kycStatus: true,
        createdAt: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Structure response so UI expecting investorProfile.user works seamlessly
    return users.map((user: any) => ({
      userId: user.id,
      kycStatus: user.kycStatus,
      user,
    }));
  }

  async getInvestors(statusFilter?: string) {
    const where: any = { role: 'INVESTOR' };
    if (statusFilter) {
      where.kycStatus = statusFilter;
    }

    const users = await (this.prisma as any).user.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        status: true,
        kycStatus: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return users.map((user: any) => ({
      userId: user.id,
      kycStatus: user.kycStatus,
      user,
    }));
  }

  async getInvestorDetails(userId: string) {
    const user = await (this.prisma as any).user.findUnique({
      where: { id: userId },
      include: {
        investorProfile: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const documents = await (this.prisma as any).document.findMany({
      where: { userId },
      orderBy: { uploadedAt: 'desc' },
    });

    return {
      profile: { ...(user.investorProfile || {}), kycStatus: user.kycStatus, user },
      documents,
    };
  }

  async updateKycStatus(userId: string, status: string, reason?: string, brokerId?: string) {
    const user = await (this.prisma as any).user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await (this.prisma as any).user.update({
      where: { id: userId },
      data: {
        kycStatus: status,
        kycRejectionReason: reason || null,
        kycReviewedBy: brokerId || null,
        kycReviewedAt: new Date(),
        ...(status === 'APPROVED' ? { status: 'ACTIVE' } : {})
      },
    });

    await (this.prisma as any).activityLog.create({
      data: {
        userId,
        action: `KYC_${status}`,
        resourceType: 'users',
        resourceId: user.id,
        details: JSON.stringify({ reason }),
      },
    });

    let title = 'KYC Status Update';
    let message = `Your KYC application has been updated to ${status}.`;
    
    if (status === 'APPROVED') {
      title = 'KYC Approved';
      message = 'Congratulations! Your identity verification is complete. You can now invest in bonds.';
    } else if (status === 'REJECTED') {
      title = 'KYC Action Required';
      message = `Your KYC application requires attention. Reason: ${reason || 'Please review your profile.'}`;
    }

    await (this.prisma as any).notification.create({
      data: {
        userId,
        title,
        message,
        type: `KYC_${status}`,
      },
    });

    // Mock return shape to prevent breaking UI
    return {
      userId: updatedUser.id,
      kycStatus: updatedUser.kycStatus,
      user: updatedUser,
    };
  }
}
