import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const allCoupons = await prisma.couponPayment.findMany();
  console.log('Total Coupons:', allCoupons.length);
  const scheduledCoupons = await prisma.couponPayment.findMany({ where: { status: 'SCHEDULED' } });
  console.log('Scheduled Coupons:', scheduledCoupons.length);
  const paidCoupons = await prisma.couponPayment.findMany({ where: { status: 'PAID' } });
  console.log('Paid Coupons:', paidCoupons.length);
}

main().catch(console.error).finally(() => prisma.$disconnect());
