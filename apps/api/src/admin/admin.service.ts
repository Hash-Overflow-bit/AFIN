import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateUserAdminDto } from './dto/create-user-admin.dto';
import { UpdateUserAdminDto } from './dto/update-user-admin.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async listUsers(page = 1, limit = 10, search?: string, role?: string, status?: string) {
    const where: any = {};
    
    if (role) {
      where.role = role;
    }
    
    if (status) {
      where.status = status;
    }
    
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          status: true,
          companyName: true,
          licenseNumber: true,
          documents: {
            select: {
              id: true,
              documentType: true,
              fileName: true,
              filePath: true,
              status: true,
              uploadedAt: true,
            }
          },
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async createUser(dto: CreateUserAdminDto, adminId: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email address is already in use');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    return this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: dto.email,
          passwordHash,
          firstName: dto.firstName,
          lastName: dto.lastName,
          phone: dto.phone,
          role: dto.role,
          status: 'ACTIVE',
          companyName: dto.role === 'BROKER' ? dto.companyName : null,
          licenseNumber: dto.role === 'BROKER' ? dto.licenseNumber : null,
          ...(dto.role === 'INVESTOR' ? {
            investorProfile: {
              create: {
                kycStatus: 'PENDING',
              },
            },
          } : {}),
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          status: true,
          companyName: true,
          licenseNumber: true,
          createdAt: true,
        },
      });

      await tx.activityLog.create({
        data: {
          userId: adminId,
          action: 'ADMIN_USER_CREATED',
          resourceType: 'User',
          resourceId: newUser.id,
          details: { email: newUser.email, role: newUser.role },
        },
      });

      return newUser;
    });
  }

  async updateUser(id: string, dto: UpdateUserAdminDto, adminId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id },
        data: {
          ...(dto.email && { email: dto.email }),
          ...(dto.firstName && { firstName: dto.firstName }),
          ...(dto.lastName && { lastName: dto.lastName }),
          ...(dto.phone !== undefined && { phone: dto.phone }),
          ...(dto.role && { role: dto.role }),
          ...(dto.status && { status: dto.status }),
          ...(dto.companyName !== undefined && { companyName: dto.companyName }),
          ...(dto.licenseNumber !== undefined && { licenseNumber: dto.licenseNumber }),
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          status: true,
          companyName: true,
          licenseNumber: true,
        },
      });

      // Security measure: delete user's refresh tokens if status is set to SUSPENDED
      if (dto.status === 'SUSPENDED') {
        await tx.refreshToken.deleteMany({
          where: { userId: id },
        });
      }

      await tx.activityLog.create({
        data: {
          userId: adminId,
          action: 'ADMIN_USER_UPDATED',
          resourceType: 'User',
          resourceId: id,
          details: { changes: JSON.parse(JSON.stringify(dto)) },
        },
      });

      return updatedUser;
    });
  }

  async listActivityLogs(page = 1, limit = 20, userId?: string, action?: string) {
    const where: any = {};
    if (userId) {
      where.userId = userId;
    }
    if (action) {
      where.action = action;
    }

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      this.prisma.activityLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      this.prisma.activityLog.count({ where }),
    ]);

    return {
      logs,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async listSettings() {
    return this.prisma.systemSetting.findMany({
      orderBy: { key: 'asc' },
    });
  }

  async updateSetting(key: string, value: string, adminId: string) {
    return this.prisma.$transaction(async (tx) => {
      const setting = await tx.systemSetting.upsert({
        where: { key },
        update: { value, updatedAt: new Date() },
        create: {
          key,
          value,
          description: 'Created/Updated dynamically via admin panel',
        },
      });

      await tx.activityLog.create({
        data: {
          userId: adminId,
          action: 'ADMIN_SETTING_UPDATED',
          resourceType: 'SystemSetting',
          resourceId: setting.id,
          details: { key, value },
        },
      });

      return setting;
    });
  }
}
