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
            },
          },
        },
      });

      if (!profile) {
        throw new NotFoundException('Investor profile not found');
      }

      return profile;
    } catch (e) {
      console.error('Error in getProfile:', e);
      throw e;
    }
  }

  async updateProfile(userId: string, dto: UpdateProfileDto, ipAddress?: string) {
    try {
      const currentProfile = await (this.prisma as any).investorProfile.findUnique({
        where: { userId },
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

      const isProfileComplete = Boolean(
        dateOfBirth &&
        nationality &&
        taxId &&
        addressLine1 &&
        city &&
        country
      );

      let newKycStatus = currentProfile.kycStatus;
      if (isProfileComplete && currentProfile.kycStatus === 'PENDING') {
        newKycStatus = 'PROFILE_COMPLETE';
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
          kycStatus: newKycStatus,
        },
      });

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

      return updatedProfile;
    } catch (e) {
      console.error('Error in updateProfile:', e);
      throw e;
    }
  }

  async uploadDocument(userId: string, file: Express.Multer.File, documentType?: string) {
    try {
      const profile = await (this.prisma as any).investorProfile.findUnique({
        where: { userId },
        select: { kycStatus: true },
      });

      if (profile && ['DOCUMENTS_SUBMITTED', 'APPROVED'].includes(profile.kycStatus)) {
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
      const profile = await (this.prisma as any).investorProfile.findUnique({
        where: { userId },
        include: { user: true },
      });

      if (!profile) {
        throw new NotFoundException('Investor profile not found');
      }

      if (!['PENDING', 'PROFILE_COMPLETE', 'REJECTED'].includes(profile.kycStatus)) {
        throw new BadRequestException(`Cannot submit KYC application when status is ${profile.kycStatus}`);
      }

      // Check if they uploaded all three required document types: IDENTITY, TAX_NUMBER, ADDRESS
      const docs = await (this.prisma as any).document.findMany({
        where: { userId },
      });

      const uploadedTypes = new Set(docs.map((d: any) => d.documentType));
      const requiredTypes = ['IDENTITY', 'TAX_NUMBER', 'ADDRESS'];
      const missingTypes = requiredTypes.filter(type => !uploadedTypes.has(type));

      if (missingTypes.length > 0) {
        throw new BadRequestException(
          `Missing required documents: ${missingTypes.map(t => t === 'IDENTITY' ? 'Proof of Identity' : t === 'TAX_NUMBER' ? 'Proof of Tax Number (NUIT)' : 'Proof of Address').join(', ')}`
        );
      }

      // Update KYC status to DOCUMENTS_SUBMITTED
      const updatedProfile = await (this.prisma as any).investorProfile.update({
        where: { userId },
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
            message: `Investor ${profile.user.firstName} ${profile.user.lastName} has submitted documents for KYC review.`,
            type: 'KYC_SUBMISSION',
          })),
        });
      }

      await (this.prisma as any).activityLog.create({
        data: {
          userId,
          action: 'KYC_SUBMITTED',
          resourceType: 'investor_profiles',
          resourceId: profile.id,
          details: JSON.stringify({ documentCount: docs.length }),
        },
      });

      return updatedProfile;
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

    // Role based check: if INVESTOR, can only view own documents
    if (requestUser.role === 'INVESTOR' && document.userId !== requestUser.id) {
      throw new NotFoundException('Document not found'); // Use NotFound instead of Forbidden to prevent enumeration
    }

    return document;
  }
  async getKycQueue() {
    return (this.prisma as any).investorProfile.findMany({
      where: {
        kycStatus: 'DOCUMENTS_SUBMITTED',
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            status: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  async getInvestors(statusFilter?: string) {
    const where: any = {};
    if (statusFilter) {
      where.kycStatus = statusFilter;
    }

    return (this.prisma as any).investorProfile.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            status: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getInvestorDetails(userId: string) {
    const profile = await (this.prisma as any).investorProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Investor not found');
    }

    const documents = await (this.prisma as any).document.findMany({
      where: { userId },
      orderBy: { uploadedAt: 'desc' },
    });

    return {
      profile,
      documents,
    };
  }

  async updateKycStatus(userId: string, status: string, reason?: string, brokerId?: string) {
    const profile = await (this.prisma as any).investorProfile.findUnique({ where: { userId } });
    if (!profile) {
      throw new NotFoundException('Investor profile not found');
    }

    const updatedProfile = await (this.prisma as any).investorProfile.update({
      where: { userId },
      data: {
        kycStatus: status,
        kycRejectionReason: reason || null,
        kycReviewedBy: brokerId || null,
        kycReviewedAt: new Date(),
      },
    });

    if (status === 'APPROVED') {
      await (this.prisma as any).user.update({
        where: { id: userId },
        data: { status: 'ACTIVE' },
      });
    }

    await (this.prisma as any).activityLog.create({
      data: {
        userId,
        action: `KYC_${status}`,
        resourceType: 'investor_profiles',
        resourceId: profile.id,
        details: JSON.stringify({ reason }),
      },
    });

    // Create Notification for Investor
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

    return updatedProfile;
  }
}
