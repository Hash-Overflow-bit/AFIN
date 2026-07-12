const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed script for 50 investors...');

  // 1. Find Mughal Steels bond
  const bond = await prisma.bond.findFirst({
    where: {
      name: {
        contains: 'Mughal Steels',
        mode: 'insensitive'
      }
    }
  });

  if (!bond) {
    throw new Error('Bond "Mughal Steels" not found. Please make sure you created it.');
  }

  console.log(`Found bond: ${bond.name} (${bond.id})`);
  console.log(`Face Value: ${bond.faceValue}, Min Investment: ${bond.minInvestment}`);

  // 2. Find a Broker to use for approvals/verifications
  const broker = await prisma.user.findFirst({
    where: {
      role: {
        in: ['BROKER', 'BROKER_MANAGER', 'ADMIN']
      }
    }
  });

  const brokerId = broker ? broker.id : null;
  console.log(`Using broker for auto-verifications: ${broker ? broker.email : 'None (will use null)'}`);

  // Pre-hashed password for 'Password123!'
  const passwordHash = '$2b$10$mRsabWGXQcXzL5NrA5T1JuFG1AA8vVw9cQy9qgHvWQQ/.6kL5ucFS';

  let createdUsersCount = 0;
  let createdOrdersCount = 0;

  for (let i = 1; i <= 50; i++) {
    const email = `tester.investor.${i}@afin.mz`;
    
    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          firstName: `Tester${i}`,
          lastName: 'Investor',
          role: 'INVESTOR',
          status: 'ACTIVE',
          investorProfile: {
            create: {
              kycStatus: 'APPROVED'
            }
          }
        }
      });
      createdUsersCount++;
    } else {
      // Ensure KYC is approved
      await prisma.investorProfile.upsert({
        where: { userId: user.id },
        update: { kycStatus: 'APPROVED' },
        create: { userId: user.id, kycStatus: 'APPROVED' }
      });
    }

    // Determine requestedAmount (must be multiple of faceValue and >= minInvestment)
    const minInv = Number(bond.minInvestment);
    const faceVal = Number(bond.faceValue);
    
    // Vary requested amount
    const requestedAmount = minInv + (i % 10) * faceVal;
    
    // Vary price per unit (between 99.0 and 101.0)
    const pricePerUnit = 99.0 + (i % 5) * 0.5;

    // Delete any existing orders for this user on this bond to prevent duplicates
    await prisma.order.deleteMany({
      where: {
        investorId: user.id,
        bondId: bond.id
      }
    });

    // Determine status and create order/payment
    let status = 'PENDING_REVIEW';
    if (i > 20 && i <= 35) {
      status = 'PAYMENT_SUBMITTED';
    } else if (i > 35) {
      status = 'PAYMENT_VERIFIED';
    }

    const orderNumber = `ORD-2026-TEST-${i.toString().padStart(4, '0')}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        investorId: user.id,
        bondId: bond.id,
        requestedAmount,
        pricePerUnit,
        status,
        reviewedBy: status !== 'PENDING_REVIEW' ? brokerId : null,
        reviewedAt: status !== 'PENDING_REVIEW' ? new Date() : null,
      }
    });

    createdOrdersCount++;

    // Create payment records if needed
    if (status === 'PAYMENT_SUBMITTED' || status === 'PAYMENT_VERIFIED') {
      const paymentStatus = status === 'PAYMENT_VERIFIED' ? 'VERIFIED' : 'PENDING_VERIFICATION';
      
      // Delete existing payments for this order
      await prisma.payment.deleteMany({
        where: { orderId: order.id }
      });

      await prisma.payment.create({
        data: {
          orderId: order.id,
          investorId: user.id,
          amount: requestedAmount,
          paymentMethod: 'BANK_TRANSFER',
          receiptFileName: `receipt-tester-${i}.pdf`,
          receiptFilePath: `uploads/receipts/receipt-tester-${i}.pdf`,
          status: paymentStatus,
          verifiedBy: paymentStatus === 'VERIFIED' ? brokerId : null,
          verifiedAt: paymentStatus === 'VERIFIED' ? new Date() : null,
        }
      });
    }
  }

  console.log(`Successfully completed!`);
  console.log(`Created/updated ${createdUsersCount} investor users.`);
  console.log(`Created ${createdOrdersCount} test orders for bond "${bond.name}".`);
  console.log(`  - 20 orders in status PENDING_REVIEW`);
  console.log(`  - 15 orders in status PAYMENT_SUBMITTED (with pending receipts)`);
  console.log(`  - 15 orders in status PAYMENT_VERIFIED (ready for Allocation Engine)`);
}

main()
  .catch((e) => {
    console.error('Error running seed script:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
