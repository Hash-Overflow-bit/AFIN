import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { QueueService } from '../queue/queue.service';

@Injectable()
export class PortfolioService implements OnModuleInit {
  private readonly logger = new Logger(PortfolioService.name);

  constructor(
    private prisma: PrismaService,
    private queueService: QueueService
  ) {}

  async onModuleInit() {
    // Register the worker to handle coupon processing
    await this.queueService.work('process-coupons', async (job) => {
      this.logger.log(`Processing mock coupons job: ${job.id}`);
      await this.processMockCoupons();
    });
  }

  async triggerMockCouponEngine() {
    const jobId = await this.queueService.send('process-coupons', {});
    this.logger.log(`Triggered mock coupon engine with job ID: ${jobId}`);
    return { message: 'Mock coupon engine triggered', jobId };
  }

  private async processMockCoupons() {
    // 1. Find the next batch of SCHEDULED coupons (for mock purposes, we just take up to 50 scheduled coupons)
    const coupons = await this.prisma.couponPayment.findMany({
      where: { status: 'SCHEDULED' },
      take: 50,
      orderBy: { paymentDate: 'asc' },
      include: { bond: true }
    });

    if (coupons.length === 0) {
      this.logger.log('No scheduled coupons found to process.');
      return;
    }

    this.logger.log(`Found ${coupons.length} coupons to process.`);

    // 2. Process each in a transaction
    for (const coupon of coupons) {
      await this.prisma.$transaction(async (tx) => {
        // Update coupon
        await tx.couponPayment.update({
          where: { id: coupon.id },
          data: {
            status: 'PAID',
            paidAt: new Date()
          }
        });

        // Create Notification
        await tx.notification.create({
          data: {
            userId: coupon.investorId,
            title: 'Coupon Payment Received',
            message: `You have received a coupon payment of ${Number(coupon.amount).toLocaleString()} MZN for ${coupon.bond.name}.`,
            type: 'PAYMENT'
          }
        });

        // Log Activity
        await tx.activityLog.create({
          data: {
            userId: coupon.investorId,
            action: 'COUPON_PAYMENT_RECEIVED',
            resourceType: 'CouponPayment',
            resourceId: coupon.id,
            details: { amount: Number(coupon.amount), bondId: coupon.bond.id }
          }
        });
      });
      this.logger.log(`Processed coupon ${coupon.id} for investor ${coupon.investorId}`);
    }
  }

  async getSummary(investorId: string) {
    const holdings = await this.prisma.portfolioHolding.findMany({
      where: { investorId, status: 'ACTIVE' },
      include: { bond: true },
    });

    let totalInvested = 0;
    let totalUnitsHeld = 0;
    let weightedYieldSum = 0;

    for (const holding of holdings) {
      const price = Number(holding.purchasePrice);
      const units = Number(holding.unitsHeld);
      const investment = price * units;
      
      const yieldRate = Number(holding.bond.yieldRate || holding.bond.couponRate);
      
      totalInvested += investment;
      totalUnitsHeld += units;
      weightedYieldSum += investment * yieldRate;
    }

    const averageYield = totalInvested > 0 ? weightedYieldSum / totalInvested : 0;

    return {
      totalInvested,
      totalUnitsHeld,
      averageYield,
      holdingsCount: holdings.length,
    };
  }

  async getHoldings(investorId: string) {
    return this.prisma.portfolioHolding.findMany({
      where: { investorId, status: 'ACTIVE' },
      include: { bond: true },
      orderBy: { acquiredAt: 'desc' },
    });
  }

  async getCoupons(investorId: string) {
    return this.prisma.couponPayment.findMany({
      where: { investorId },
      include: { bond: true },
      orderBy: { paymentDate: 'asc' },
    });
  }

  async getHistory(investorId: string) {
    return this.prisma.activityLog.findMany({
      where: { userId: investorId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}
