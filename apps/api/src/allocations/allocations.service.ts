import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class AllocationsService {
  constructor(private readonly prisma: PrismaService) {}

  async previewAllocationForBond(bondId: string) {
    const bond = await this.prisma.bond.findUnique({
      where: { id: bondId },
    });

    if (!bond) throw new NotFoundException('Bond not found');

    const verifiedOrders = await this.prisma.order.findMany({
      where: {
        bondId: bond.id,
        status: 'PAYMENT_VERIFIED'
      },
      include: {
        investor: {
          select: { firstName: true, lastName: true, email: true }
        }
      }
    });

    const totalDemand = verifiedOrders.reduce((sum, order) => sum + Number(order.requestedAmount), 0);
    const totalSupply = Number(bond.totalIssuance || 0);
    const faceValue = Number(bond.faceValue || 1000);

    let ratio = 1;
    if (totalSupply > 0 && totalDemand > totalSupply) {
      ratio = totalSupply / totalDemand;
    }

    const projectedAllocations = verifiedOrders.map(order => {
      const requested = Number(order.requestedAmount);
      let allocatedAmount = requested;
      
      if (ratio < 1) {
        // Floor to the nearest multiple of faceValue
        const proportionalAmount = requested * ratio;
        const units = Math.floor(proportionalAmount / faceValue);
        allocatedAmount = units * faceValue;
      }

      const unitsAllocated = allocatedAmount / faceValue;

      return {
        orderId: order.id,
        investorId: order.investorId,
        investorName: `${order.investor.firstName} ${order.investor.lastName}`,
        requestedAmount: requested,
        allocatedAmount,
        unitsAllocated
      };
    });

    const totalAllocated = projectedAllocations.reduce((sum, alloc) => sum + alloc.allocatedAmount, 0);

    return {
      bondId: bond.id,
      bondName: bond.name,
      totalSupply,
      totalDemand,
      ratio,
      totalAllocated,
      projectedAllocations
    };
  }

  async runAllocationForBond(bondId: string, brokerId: string) {
    const bond = await this.prisma.bond.findUnique({
      where: { id: bondId },
    });

    if (!bond) {
      throw new NotFoundException('Bond not found');
    }

    if (bond.status === 'ALLOCATED' || bond.status === 'CLOSED' || bond.status === 'SETTLED') {
      throw new BadRequestException(`Bond is already in ${bond.status} state`);
    }

    const verifiedOrders = await this.prisma.order.findMany({
      where: {
        bondId: bond.id,
        status: 'PAYMENT_VERIFIED'
      }
    });

    if (verifiedOrders.length === 0) {
      throw new BadRequestException('No verified payments found for this bond. Cannot run allocation.');
    }

    const totalDemand = verifiedOrders.reduce((sum, order) => sum + Number(order.requestedAmount), 0);
    const totalSupply = Number(bond.totalIssuance || 0);
    const faceValue = Number(bond.faceValue || 1000);

    let ratio = 1;
    if (totalSupply > 0 && totalDemand > totalSupply) {
      ratio = totalSupply / totalDemand;
    }

    // Use a transaction to ensure everything is created atomically
    return this.prisma.$transaction(async (tx) => {
      
      // 1. Create Allocation record
      const allocationRecord = await tx.allocation.create({
        data: {
          bondId: bond.id,
          totalGovernmentAllocation: totalSupply,
          totalInvestorDemand: totalDemand,
          allocationRatio: ratio,
          status: 'COMPLETED',
          allocatedBy: brokerId
        }
      });

      const holdingsToCreate = [];
      const notificationsToCreate = [];
      let totalAllocatedFinal = 0;

      for (const order of verifiedOrders) {
        const requested = Number(order.requestedAmount);
        let allocatedAmount = requested;

        if (ratio < 1) {
          const proportionalAmount = requested * ratio;
          const units = Math.floor(proportionalAmount / faceValue);
          allocatedAmount = units * faceValue;
        }

        const unitsAllocated = allocatedAmount / faceValue;
        totalAllocatedFinal += allocatedAmount;

        // Update the order
        await tx.order.update({
          where: { id: order.id },
          data: { 
            status: 'ALLOCATED',
            allocatedAmount,
            unitsAllocated,
            pricePerUnit: faceValue
          }
        });

        // Add to holdings array
        holdingsToCreate.push({
          investorId: order.investorId,
          bondId: order.bondId,
          orderId: order.id,
          faceValueHeld: allocatedAmount,
          purchasePrice: faceValue,
          unitsHeld: unitsAllocated,
          status: 'ACTIVE'
        });

        // Add to notifications
        notificationsToCreate.push({
          userId: order.investorId,
          title: 'Bond Allocation Successful',
          message: `Your order for ${bond.name} has been allocated. You received ${unitsAllocated} units totaling ${allocatedAmount} MZN.`,
          type: 'ALLOCATION'
        });
      }

      // 2. Create Portfolio holdings and 3. Mock Coupons
      for (const holdingData of holdingsToCreate) {
        const holding = await tx.portfolioHolding.create({
          data: holdingData
        });

        const couponsToCreate = [];
        const baseDate = new Date();
        const couponRate = Number(bond.couponRate) / 100;
        
        let divisor = 2;
        let monthsToAdd = 6;
        if (bond.couponFrequency === 'ANNUAL') {
          divisor = 1;
          monthsToAdd = 12;
        } else if (bond.couponFrequency === 'QUARTERLY') {
          divisor = 4;
          monthsToAdd = 3;
        }

        const paymentAmount = (holdingData.faceValueHeld * couponRate) / divisor;

        for (let i = 1; i <= 4; i++) {
          const paymentDate = new Date(baseDate);
          paymentDate.setMonth(paymentDate.getMonth() + (monthsToAdd * i));
          
          couponsToCreate.push({
            holdingId: holding.id,
            investorId: holding.investorId,
            bondId: holding.bondId,
            paymentDate,
            amount: paymentAmount,
            status: 'SCHEDULED'
          });
        }

        await tx.couponPayment.createMany({
          data: couponsToCreate
        });
      }

      // 4. Update the Bond status to ALLOCATED
      const updatedBond = await tx.bond.update({
        where: { id: bond.id },
        data: { status: 'ALLOCATED' }
      });

      // 5. Send Notifications
      if (notificationsToCreate.length > 0) {
        await tx.notification.createMany({
          data: notificationsToCreate
        });
      }

      // Log Activity
      await tx.activityLog.create({
        data: {
          userId: brokerId,
          action: 'BOND_ALLOCATION_RAN',
          resourceType: 'Bond',
          resourceId: bond.id,
          details: { totalDemand, totalAllocatedFinal, ratio }
        }
      });

      return {
        message: `Successfully allocated bonds for ${verifiedOrders.length} investors.`,
        allocatedOrdersCount: verifiedOrders.length,
        totalAllocated: totalAllocatedFinal,
        allocationRatio: ratio,
        bond: updatedBond
      };
    }, {
      maxWait: 5000, // 5s max wait to connect to prisma
      timeout: 20000 // 20s timeout for the entire transaction to run
    });
  }
}
