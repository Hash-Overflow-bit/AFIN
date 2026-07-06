import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 1. Create Investor
  const investorEmail = 'investor@afin.com';
  let investor = await prisma.user.findUnique({ where: { email: investorEmail } });
  
  if (!investor) {
    investor = await prisma.user.create({
      data: {
        email: investorEmail,
        passwordHash,
        firstName: 'Bob',
        lastName: 'Investor',
        role: 'INVESTOR',
        status: 'ACTIVE',
        investorProfile: {
          create: { kycStatus: 'APPROVED' }
        }
      }
    });
  }

  // 2. Create Broker
  const brokerEmail = 'broker@afin.com';
  let broker = await prisma.user.findUnique({ where: { email: brokerEmail } });
  
  if (!broker) {
    broker = await prisma.user.create({
      data: {
        email: brokerEmail,
        passwordHash,
        firstName: 'Alice',
        lastName: 'Broker',
        role: 'BROKER',
        status: 'ACTIVE',
      }
    });
  }

  // 3. Create a Bond and allocate it to the investor
  const bond = await prisma.bond.create({
    data: {
      name: 'Mozambique Green Treasury 2029',
      isin: 'MZGREEN2029',
      couponRate: 14.5,
      yieldRate: 14.5,
      faceValue: 1000,
      minInvestment: 50000,
      issueDate: new Date(),
      maturityDate: new Date('2029-06-30'),
      status: 'ALLOCATED',
      createdBy: broker.id,
    }
  });

  // 4. Create Order
  const order = await prisma.order.create({
    data: {
      orderNumber: `ORD-2026-${Math.floor(Math.random() * 10000)}`,
      investorId: investor.id,
      bondId: bond.id,
      requestedAmount: 150000,
      allocatedAmount: 150000,
      unitsAllocated: 150,
      pricePerUnit: 1000,
      status: 'ALLOCATED',
      reviewedBy: broker.id,
      reviewedAt: new Date(),
    }
  });

  // 5. Create Portfolio Holding
  const holding = await prisma.portfolioHolding.create({
    data: {
      investorId: investor.id,
      bondId: bond.id,
      orderId: order.id,
      faceValueHeld: 150000,
      purchasePrice: 1000,
      unitsHeld: 150,
      status: 'ACTIVE',
    }
  });

  // 6. Create upcoming coupons
  await prisma.couponPayment.createMany({
    data: [
      {
        holdingId: holding.id,
        investorId: investor.id,
        bondId: bond.id,
        paymentDate: new Date('2026-12-30'),
        amount: 10875, // 150000 * 14.5% / 2
        status: 'SCHEDULED'
      },
      {
        holdingId: holding.id,
        investorId: investor.id,
        bondId: bond.id,
        paymentDate: new Date('2027-06-30'),
        amount: 10875,
        status: 'SCHEDULED'
      }
    ]
  });

  // 7. Activity Logs
  await prisma.activityLog.create({
    data: {
      userId: investor.id,
      action: 'Bond Allocated: Mozambique Green Treasury 2029',
    }
  });

  console.log('--- PORTFOLIO TEST DATA READY ---');
  console.log('Login: investor@afin.com');
  console.log('Password: Password123!');
  console.log('Go to: http://localhost:3000/portfolio');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
