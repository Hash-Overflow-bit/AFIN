import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async uploadReceipt(userId: string, orderId: string, file: Express.Multer.File) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.investorId !== userId) {
      throw new ForbiddenException('You do not own this order');
    }

    if (order.status !== 'AWAITING_PAYMENT' && order.status !== 'PAYMENT_REJECTED') {
      throw new BadRequestException(`Cannot upload receipt for order in status: ${order.status}`);
    }

    // Determine total amount due
    const amountDue = order.allocatedAmount || order.requestedAmount;

    // Run transaction: Create Payment and update Order status
    const result = await this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          orderId: order.id,
          investorId: userId,
          amount: amountDue,
          paymentMethod: 'BANK_TRANSFER',
          receiptFilePath: file.path,
          receiptFileName: file.filename,
          status: 'PENDING_VERIFICATION'
        }
      });

      await tx.order.update({
        where: { id: order.id },
        data: { status: 'PAYMENT_SUBMITTED' }
      });

      return payment;
    });

    return result;
  }

  async getMyPayments(userId: string) {
    return this.prisma.payment.findMany({
      where: { investorId: userId },
      include: {
        order: {
          include: {
            bond: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getAllPayments() {
    return this.prisma.payment.findMany({
      include: {
        investor: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        order: {
          include: {
            bond: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getPaymentFile(paymentId: string, user: any) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId }
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (user.role === 'INVESTOR' && payment.investorId !== user.id) {
      throw new ForbiddenException('You do not own this payment record');
    }

    return payment;
  }

  async verifyPayment(brokerId: string, paymentId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { order: true }
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status === 'VERIFIED') {
      throw new BadRequestException('Payment is already verified');
    }

    return this.prisma.$transaction(async (tx) => {
      const verifiedPayment = await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: 'VERIFIED',
          verifiedBy: brokerId,
          verifiedAt: new Date(),
          rejectionReason: null
        }
      });

      await tx.order.update({
        where: { id: payment.orderId },
        data: { status: 'PAYMENT_VERIFIED' }
      });

      return verifiedPayment;
    });
  }

  async rejectPayment(brokerId: string, paymentId: string, reason: string) {
    if (!reason) {
      throw new BadRequestException('Rejection reason is required');
    }

    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId }
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return this.prisma.$transaction(async (tx) => {
      const rejectedPayment = await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: 'REJECTED',
          verifiedBy: brokerId,
          verifiedAt: new Date(),
          rejectionReason: reason
        }
      });

      await tx.order.update({
        where: { id: payment.orderId },
        data: { 
          status: 'PAYMENT_REJECTED',
          rejectionReason: reason 
        }
      });

      return rejectedPayment;
    });
  }
}
