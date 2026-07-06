import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL
    }
  }
});

async function run() {
  const coupons = await prisma.couponPayment.findMany();
  console.log('Total Coupons:', coupons.length);

  const holdings = await prisma.portfolioHolding.findMany({ include: { bond: true, investor: true } });
  console.log('Total Holdings:', holdings.length);

  if (holdings.length > 0 && coupons.length === 0) {
    console.log('Creating a mock coupon for the first holding...');
    const holding = holdings[0];
    const created = await prisma.couponPayment.create({
      data: {
        holdingId: holding.id,
        investorId: holding.investorId,
        bondId: holding.bondId,
        paymentDate: new Date('2023-01-01'), // past date
        amount: 50.00,
        status: 'SCHEDULED'
      }
    });
    console.log('Created Mock Coupon:', created);
  } else if (coupons.length > 0) {
    console.log('Updating all coupons to SCHEDULED and past date...');
    await prisma.couponPayment.updateMany({
      data: {
        status: 'SCHEDULED',
        paymentDate: new Date('2023-01-01')
      }
    });
    console.log('Coupons updated for testing.');
  }
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
