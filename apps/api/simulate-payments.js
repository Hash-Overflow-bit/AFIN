const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Simulating payment uploads for approved orders...');

  // 1. Find all orders for Mughal Steels that are AWAITING_PAYMENT
  const orders = await prisma.order.findMany({
    where: {
      bond: {
        name: {
          contains: 'Mughal Steels',
          mode: 'insensitive'
        }
      },
      status: 'AWAITING_PAYMENT'
    }
  });

  console.log(`Found ${orders.length} orders awaiting payment.`);

  if (orders.length === 0) {
    console.log('No orders are currently in AWAITING_PAYMENT status.');
    return;
  }

  let updatedCount = 0;

  for (const order of orders) {
    const amountDue = order.allocatedAmount || order.requestedAmount;

    // Delete any existing payments for this order to avoid conflicts
    await prisma.payment.deleteMany({
      where: { orderId: order.id }
    });

    // Create payment in transaction
    await prisma.$transaction([
      prisma.payment.create({
        data: {
          orderId: order.id,
          investorId: order.investorId,
          amount: amountDue,
          paymentMethod: 'BANK_TRANSFER',
          receiptFileName: `receipt-sim-${order.orderNumber}.pdf`,
          receiptFilePath: `uploads/receipts/receipt-sim-${order.orderNumber}.pdf`,
          status: 'PENDING_VERIFICATION'
        }
      }),
      prisma.order.update({
        where: { id: order.id },
        data: { status: 'PAYMENT_SUBMITTED' }
      })
    ]);

    console.log(`Submitted payment of ${amountDue} MZN for Order ${order.orderNumber}`);
    updatedCount++;
  }

  console.log(`Successfully simulated payments for ${updatedCount} orders!`);
}

main()
  .catch((e) => {
    console.error('Error running payment simulation:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
