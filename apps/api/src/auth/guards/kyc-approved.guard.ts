import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class KycGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.id) {
      throw new ForbiddenException('Access Denied: Unauthenticated');
    }

    // Only apply KYC lock to INVESTOR
    if (user.role !== 'INVESTOR') {
      return true;
    }

    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: { kycStatus: true },
    });

    if (!dbUser || dbUser.kycStatus !== 'APPROVED') {
      throw new ForbiddenException('Access Denied: Your KYC application must be approved to access this resource.');
    }

    return true;
  }
}
