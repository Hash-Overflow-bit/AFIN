const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const userCount = await prisma.user.count({ where: { email: { startsWith: 'tester.investor.' } } });
  const orderCount = await prisma.order.count({ where: { orderNumber: { startsWith: 'ORD-2026-TEST-' } } });
  const paymentCount = await prisma.payment.count({ where: { receiptFileName: { startsWith: 'receipt-tester-' } } });
  
  console.log('--- Current DB State ---');
  console.log('Tester Users:', userCount);
  console.log('Tester Orders:', orderCount);
  console.log('Tester Payments:', paymentCount);

  // Group by order status
  const ordersGrouped = await prisma.order.groupBy({
    by: ['status'],
    where: { bond: { name: 'Mughal Steels' } },
    _count: true
  });
  console.log('Mughal Steels Orders by status:', ordersGrouped);
}

main().finally(() => prisma.$disconnect());
