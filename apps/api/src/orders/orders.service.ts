import { Injectable, BadRequestException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(createOrderDto: CreateOrderDto, userId: string) {
    // 1. Check if user KYC is APPROVED
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.kycStatus !== 'APPROVED') {
      throw new BadRequestException('Investor must be KYC verified to place an order');
    }

    // 2. Check Bond status and details
    const bond = await this.prisma.bond.findUnique({
      where: { id: createOrderDto.bondId },
    });

    if (!bond) {
      throw new BadRequestException('Bond not found');
    }

    if (bond.status !== 'OPEN') {
      throw new BadRequestException('This bond is not currently open for investment');
    }

    if (bond.subscriptionDeadline && bond.subscriptionDeadline < new Date()) {
      throw new BadRequestException('Subscription deadline has passed');
    }

    // 3. Check Limits & Multiples
    const amount = Number(createOrderDto.requestedAmount);
    const minInv = Number(bond.minInvestment);
    const maxInv = bond.maxInvestment ? Number(bond.maxInvestment) : Infinity;
    const faceValue = Number(bond.faceValue);

    if (amount < minInv) {
      throw new BadRequestException(`Minimum investment is ${minInv}`);
    }

    if (amount > maxInv) {
      throw new BadRequestException(`Maximum investment is ${maxInv}`);
    }

    if (amount % faceValue !== 0) {
      throw new BadRequestException(`Investment must be a multiple of ${faceValue}`);
    }

    // 4. Duplicate Check
    const existingOrder = await this.prisma.order.findFirst({
      where: {
        investorId: userId,
        bondId: bond.id,
        status: 'PENDING_REVIEW'
      }
    });

    if (existingOrder) {
      throw new ConflictException('You already have a pending order for this bond. Please review it or wait for broker approval.');
    }

    // 5. Generate Order Number
    const count = await this.prisma.order.count();
    const orderNumber = `ORD-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;

    // 6. Save Order
    const order = await this.prisma.order.create({
      data: {
        orderNumber,
        investorId: userId,
        bondId: bond.id,
        requestedAmount: amount,
        status: 'PENDING_REVIEW',
      },
    });

    // Log Activity
    await this.prisma.activityLog.create({
      data: {
        userId,
        action: 'ORDER_SUBMITTED',
        resourceType: 'Order',
        resourceId: order.id,
        details: { bondId: bond.id, amount },
      }
    });

    return order;
  }

  async getMyOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { investorId: userId },
      include: {
        bond: {
          select: {
            name: true,
            couponRate: true,
            maturityDate: true,
            currency: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async cancelOrder(id: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new BadRequestException('Order not found');
    }

    if (order.investorId !== userId) {
      throw new ForbiddenException('Not your order');
    }

    if (order.status !== 'PENDING_REVIEW') {
      throw new BadRequestException('Only pending orders can be cancelled');
    }

    const cancelledOrder = await this.prisma.order.update({
      where: { id },
      data: { status: 'CANCELLED' }
    });

    // Log Activity
    await this.prisma.activityLog.create({
      data: {
        userId,
        action: 'ORDER_CANCELLED',
        resourceType: 'Order',
        resourceId: order.id,
      }
    });

    return cancelledOrder;
  }

  // --- BROKER METHODS ---

  async getAllOrders(filters?: { status?: string; bondId?: string }) {
    const where: any = {};
    if (filters?.status) where.status = filters.status;
    if (filters?.bondId) where.bondId = filters.bondId;

    return this.prisma.order.findMany({
      where,
      include: {
        investor: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          }
        },
        bond: {
          select: {
            name: true,
            currency: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async approveOrder(id: string, brokerId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) throw new BadRequestException('Order not found');
    if (order.status !== 'PENDING_REVIEW') throw new BadRequestException('Order is not in PENDING_REVIEW state');

    const approvedOrder = await this.prisma.order.update({
      where: { id },
      data: {
        status: 'AWAITING_PAYMENT',
        reviewedBy: brokerId,
        reviewedAt: new Date(),
      }
    });

    // Log Activity
    await this.prisma.activityLog.create({
      data: {
        userId: brokerId,
        action: 'ORDER_APPROVED',
        resourceType: 'Order',
        resourceId: order.id,
      }
    });

    return approvedOrder;
  }

  async rejectOrder(id: string, brokerId: string, reason: string) {
    if (!reason || reason.trim().length === 0) {
      throw new BadRequestException('Rejection reason is required');
    }

    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) throw new BadRequestException('Order not found');
    if (order.status !== 'PENDING_REVIEW') throw new BadRequestException('Order is not in PENDING_REVIEW state');

    const rejectedOrder = await this.prisma.order.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectionReason: reason,
        reviewedBy: brokerId,
        reviewedAt: new Date(),
      }
    });

    // Log Activity
    await this.prisma.activityLog.create({
      data: {
        userId: brokerId,
        action: 'ORDER_REJECTED',
        resourceType: 'Order',
        resourceId: order.id,
        details: { reason },
      }
    });

    return rejectedOrder;
  }
}
