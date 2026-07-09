const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

// Helper to generate unique order numbers
let orderCounter = 10000;
function generateOrderNumber() {
  orderCounter++;
  return `ORD-${orderCounter}`;
}

async function main() {
  console.log('🌱 Start seeding...');

  // 1. Topological clean up to ensure idempotency
  console.log('Cleaning existing tables...');
  await prisma.refreshToken.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.activityLog.deleteMany({});
  await prisma.couponPayment.deleteMany({});
  await prisma.portfolioHolding.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.allocation.deleteMany({});
  await prisma.bond.deleteMany({});
  await prisma.document.deleteMany({});
  await prisma.investorProfile.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Generate secure passwords
  console.log('Hashing passwords...');
  const salt = await bcrypt.genSalt(10);
  const adminHash = await bcrypt.hash('AfiN#9xP@7zD!4qK', salt);
  const brokerHash = await bcrypt.hash('BrkR*2yM^8wB!5tX', salt);
  const investorHash = await bcrypt.hash('InvS%6hF$3vC#9nJ', salt);

  // 3. Seed Users (7 accounts)
  console.log('Seeding Users...');
  
  // 3a. Admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@afin.mz',
      firstName: 'System',
      lastName: 'Admin',
      passwordHash: adminHash,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  // 3b. Brokers (2)
  const brokerLead = await prisma.user.create({
    data: {
      email: 'operations@afin.mz',
      firstName: 'Amelia',
      lastName: 'Varela',
      passwordHash: brokerHash,
      role: 'BROKER',
      status: 'ACTIVE',
      companyName: 'Moza Banco fixed income dept',
    },
  });

  const brokerJunior = await prisma.user.create({
    data: {
      email: 'operations2@afin.mz',
      firstName: 'Duarte',
      lastName: 'Sanches',
      passwordHash: brokerHash,
      role: 'BROKER',
      status: 'ACTIVE',
      companyName: 'Moza Banco fixed income dept',
    },
  });

  // 3c. Investors (4)
  // Investor 1: Approved Demo
  const investorDemo = await prisma.user.create({
    data: {
      email: 'investor.demo@afin.mz',
      firstName: 'Mateus',
      lastName: 'Chilengue',
      passwordHash: investorHash,
      role: 'INVESTOR',
      status: 'ACTIVE',
      investorProfile: {
        create: {
          dateOfBirth: new Date('1988-04-12'),
          nationality: 'Mozambican',
          taxId: '228394019',
          addressLine1: 'Av. Julius Nyerere 1202',
          city: 'Maputo',
          country: 'Mozambique',
          postalCode: '1100',
          kycStatus: 'APPROVED',
          kycReviewedAt: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000),
        },
      },
    },
  });

  // Investor 2: Approved Alice
  const investorAlice = await prisma.user.create({
    data: {
      email: 'investor.alice@afin.mz',
      firstName: 'Alice',
      lastName: 'Tembe',
      passwordHash: investorHash,
      role: 'INVESTOR',
      status: 'ACTIVE',
      investorProfile: {
        create: {
          dateOfBirth: new Date('1992-09-24'),
          nationality: 'Mozambican',
          taxId: '310495810',
          addressLine1: 'Av. Mao Tse Tung 445',
          city: 'Maputo',
          country: 'Mozambique',
          postalCode: '1102',
          kycStatus: 'APPROVED',
          kycReviewedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        },
      },
    },
  });

  // Investor 3: Pending Bob (has 1 document uploaded)
  const investorBob = await prisma.user.create({
    data: {
      email: 'investor.bob@afin.mz',
      firstName: 'Bob',
      lastName: 'Macamo',
      passwordHash: investorHash,
      role: 'INVESTOR',
      status: 'ACTIVE',
      investorProfile: {
        create: {
          dateOfBirth: new Date('1985-11-03'),
          nationality: 'Mozambican',
          taxId: '109845722',
          addressLine1: 'Rua da Bagamoyo 89',
          city: 'Beira',
          country: 'Mozambique',
          postalCode: '2100',
          kycStatus: 'PENDING',
        },
      },
    },
  });

  // Uploaded document for Bob
  await prisma.document.create({
    data: {
      userId: investorBob.id,
      documentType: 'IDENTITY',
      fileName: 'bob_passport.pdf',
      filePath: '/uploads/documents/bob_passport.pdf',
      fileSize: 412000,
      status: 'PENDING',
      uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  });

  // Investor 4: Rejected Charlie
  const investorCharlie = await prisma.user.create({
    data: {
      email: 'investor.charlie@afin.mz',
      firstName: 'Charlie',
      lastName: 'Mabote',
      passwordHash: investorHash,
      role: 'INVESTOR',
      status: 'ACTIVE',
      investorProfile: {
        create: {
          dateOfBirth: new Date('1990-01-15'),
          nationality: 'Mozambican',
          taxId: '542019385',
          addressLine1: 'Av. de Trabalho 1120',
          city: 'Nampula',
          country: 'Mozambique',
          postalCode: '3100',
          kycStatus: 'REJECTED',
          kycRejectionReason: 'Blurred passport photo. Please upload a clear scan.',
          kycReviewedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        },
      },
    },
  });

  // Uploaded document for Charlie
  await prisma.document.create({
    data: {
      userId: investorCharlie.id,
      documentType: 'IDENTITY',
      fileName: 'charlie_id_bad.jpg',
      filePath: '/uploads/documents/charlie_id_bad.jpg',
      fileSize: 852000,
      status: 'REJECTED',
      uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
  });

  // 4. Seed Bonds (6 Bonds)
  console.log('Seeding Bonds...');
  
  // Bond 1: Draft state
  const bondDraft = await prisma.bond.create({
    data: {
      name: 'Treasury Bond 2026 Series A (OT-2026-A)',
      isin: 'MZOT2026A001',
      couponRate: 14.00,
      yieldRate: 14.50,
      couponFrequency: 'SEMI_ANNUAL',
      faceValue: 1000,
      minInvestment: 50000,
      maxInvestment: 5000000,
      totalIssuance: 50000000,
      status: 'DRAFT',
      createdBy: brokerLead.id,
      maturityDate: new Date(Date.now() + 365 * 3 * 24 * 60 * 60 * 1000),
    },
  });

  // Bond 2: Open state (Active subscription)
  const bondOpenInfra = await prisma.bond.create({
    data: {
      name: 'Mozambique Infrastructure Bond 2026 (OT-INFRA-01)',
      isin: 'MZINFRA20260',
      couponRate: 15.00,
      yieldRate: 15.00,
      couponFrequency: 'SEMI_ANNUAL',
      faceValue: 1000,
      minInvestment: 100000,
      maxInvestment: 10000000,
      totalIssuance: 100000000,
      status: 'OPEN',
      createdBy: brokerLead.id,
      subscriptionDeadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      maturityDate: new Date(Date.now() + 365 * 5 * 24 * 60 * 60 * 1000),
      issueDate: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000),
    },
  });

  // Bond 3: Open state (Closes soon)
  const bondOpenB = await prisma.bond.create({
    data: {
      name: 'Treasury Bond 2026 Series B (OT-2026-B)',
      isin: 'MZOT2026B009',
      couponRate: 13.50,
      yieldRate: 13.50,
      couponFrequency: 'SEMI_ANNUAL',
      faceValue: 1000,
      minInvestment: 50000,
      maxInvestment: 5000000,
      totalIssuance: 30000000,
      status: 'OPEN',
      createdBy: brokerLead.id,
      subscriptionDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      maturityDate: new Date(Date.now() + 365 * 2 * 24 * 60 * 60 * 1000),
      issueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    },
  });

  // Bond 4: Allocated state (12% Annual coupon, 4 years)
  const bondAllocatedEdu = await prisma.bond.create({
    data: {
      name: 'Education Development Bond 2026 (OT-EDU-02)',
      isin: 'MZEDU2026027',
      couponRate: 12.00,
      yieldRate: 12.00,
      couponFrequency: 'ANNUAL',
      faceValue: 1000,
      minInvestment: 20000,
      maxInvestment: 2000000,
      totalIssuance: 20000000,
      status: 'ALLOCATED',
      createdBy: brokerLead.id,
      subscriptionDeadline: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      maturityDate: new Date(Date.now() + 365 * 4 * 24 * 60 * 60 * 1000),
      issueDate: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
    },
  });

  // Bond 5: Allocated state (15.5% Semi-annual, 3 years)
  const bondAllocatedGreen = await prisma.bond.create({
    data: {
      name: 'Mozambique Green Energy Bond 2026 (OT-GREEN-01)',
      isin: 'MZGREEN20264',
      couponRate: 15.50,
      yieldRate: 16.00,
      couponFrequency: 'SEMI_ANNUAL',
      faceValue: 1000,
      minInvestment: 150000,
      maxInvestment: 15000000,
      totalIssuance: 30000000,
      status: 'ALLOCATED',
      createdBy: brokerLead.id,
      subscriptionDeadline: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      maturityDate: new Date(Date.now() + 365 * 3 * 24 * 60 * 60 * 1000),
      issueDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    },
  });

  // Bond 6: Allocated state (13% Annual coupon, 5 years)
  const bondAllocatedMuni = await prisma.bond.create({
    data: {
      name: 'Mozambique Municipal Development Bond (OT-MUNI-01)',
      isin: 'MZMUNI20268',
      couponRate: 13.00,
      yieldRate: 13.00,
      couponFrequency: 'ANNUAL',
      faceValue: 1000,
      minInvestment: 50000,
      maxInvestment: 5000000,
      totalIssuance: 10000000,
      status: 'ALLOCATED',
      createdBy: brokerLead.id,
      subscriptionDeadline: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      maturityDate: new Date(Date.now() + 365 * 5 * 24 * 60 * 60 * 1000),
      issueDate: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
    },
  });

  // 5. Seed Orders (14 Orders)
  console.log('Seeding Orders...');
  
  // 5a. Allocated Bond 5 Orders (Verified/Paid)
  const orderAllocated1 = await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      investorId: investorDemo.id,
      bondId: bondAllocatedGreen.id,
      requestedAmount: 1000000,
      allocatedAmount: 1000000,
      unitsAllocated: 1000,
      pricePerUnit: 1000,
      status: 'PAYMENT_VERIFIED',
      reviewedBy: brokerLead.id,
      reviewedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    },
  });

  const orderAllocated2 = await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      investorId: investorAlice.id,
      bondId: bondAllocatedGreen.id,
      requestedAmount: 2000000,
      allocatedAmount: 2000000,
      unitsAllocated: 2000,
      pricePerUnit: 1000,
      status: 'PAYMENT_VERIFIED',
      reviewedBy: brokerLead.id,
      reviewedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000),
    },
  });

  // 5b. Allocated Bond 4 Orders
  const orderAllocatedEdu1 = await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      investorId: investorDemo.id,
      bondId: bondAllocatedEdu.id,
      requestedAmount: 500000,
      allocatedAmount: 500000,
      unitsAllocated: 500,
      pricePerUnit: 1000,
      status: 'PAYMENT_VERIFIED',
      reviewedBy: brokerLead.id,
      reviewedAt: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000),
    },
  });

  const orderAllocatedEdu2 = await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      investorId: investorAlice.id,
      bondId: bondAllocatedEdu.id,
      requestedAmount: 800000,
      allocatedAmount: 800000,
      unitsAllocated: 800,
      pricePerUnit: 1000,
      status: 'PAYMENT_VERIFIED',
      reviewedBy: brokerLead.id,
      reviewedAt: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
    },
  });

  // 5c. Allocated Bond 6 Orders
  const orderAllocatedMuni1 = await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      investorId: investorDemo.id,
      bondId: bondAllocatedMuni.id,
      requestedAmount: 1000000,
      allocatedAmount: 1000000,
      unitsAllocated: 1000,
      pricePerUnit: 1000,
      status: 'PAYMENT_VERIFIED',
      reviewedBy: brokerLead.id,
      reviewedAt: new Date(Date.now() - 27 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000),
    },
  });

  const orderAllocatedMuni2 = await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      investorId: investorAlice.id,
      bondId: bondAllocatedMuni.id,
      requestedAmount: 1500000,
      allocatedAmount: 1500000,
      unitsAllocated: 1500,
      pricePerUnit: 1000,
      status: 'PAYMENT_VERIFIED',
      reviewedBy: brokerLead.id,
      reviewedAt: new Date(Date.now() - 27 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000),
    },
  });

  // 5d. Open Bond 3 Orders
  const orderAwaitingPay = await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      investorId: investorDemo.id,
      bondId: bondOpenB.id,
      requestedAmount: 100000,
      status: 'AWAITING_PAYMENT',
      reviewedBy: brokerJunior.id,
      reviewedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  });

  const orderRejected = await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      investorId: investorAlice.id,
      bondId: bondOpenB.id,
      requestedAmount: 300000,
      status: 'REJECTED',
      rejectionReason: 'Exceeds maximum allowable aggregate investor subscription limit for OT-2026-B.',
      reviewedBy: brokerLead.id,
      reviewedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  });

  const orderCancelled = await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      investorId: investorDemo.id,
      bondId: bondOpenB.id,
      requestedAmount: 250000,
      status: 'CANCELLED',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  });

  // 5e. Open Bond 2 Orders (Infrastructure)
  const orderOpenInfra1 = await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      investorId: investorDemo.id,
      bondId: bondOpenInfra.id,
      requestedAmount: 500000,
      status: 'PENDING_REVIEW',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  });

  const orderOpenInfra2 = await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      investorId: investorAlice.id,
      bondId: bondOpenInfra.id,
      requestedAmount: 1000000,
      status: 'PENDING_REVIEW',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  });

  const orderOpenInfra3 = await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      investorId: investorBob.id,
      bondId: bondOpenInfra.id,
      requestedAmount: 150000,
      status: 'PENDING_REVIEW',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  });

  // Extra helper orders
  const extraOrder1 = await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      investorId: investorDemo.id,
      bondId: bondOpenInfra.id,
      requestedAmount: 200000,
      status: 'CANCELLED',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    },
  });

  const extraOrder2 = await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      investorId: investorAlice.id,
      bondId: bondOpenInfra.id,
      requestedAmount: 600000,
      status: 'AWAITING_PAYMENT',
      reviewedBy: brokerLead.id,
      reviewedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    },
  });

  console.log('Seeded 14 orders successfully.');

  // 6. Seed Payments (10 Payments)
  console.log('Seeding Payments...');
  
  // verified payments for Bond 5
  await prisma.payment.create({
    data: { orderId: orderAllocated1.id, investorId: investorDemo.id, amount: 1000000, referenceNumber: 'REF-83940192', status: 'VERIFIED', verifiedBy: brokerLead.id, verifiedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000), createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) }
  });
  await prisma.payment.create({
    data: { orderId: orderAllocated2.id, investorId: investorAlice.id, amount: 2000000, referenceNumber: 'REF-10495819', status: 'VERIFIED', verifiedBy: brokerLead.id, verifiedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000), createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) }
  });

  // verified payments for Bond 4
  await prisma.payment.create({
    data: { orderId: orderAllocatedEdu1.id, investorId: investorDemo.id, amount: 500000, referenceNumber: 'REF-EDU-M1', status: 'VERIFIED', verifiedBy: brokerLead.id, verifiedAt: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000), createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) }
  });
  await prisma.payment.create({
    data: { orderId: orderAllocatedEdu2.id, investorId: investorAlice.id, amount: 800000, referenceNumber: 'REF-EDU-A1', status: 'VERIFIED', verifiedBy: brokerLead.id, verifiedAt: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000), createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) }
  });

  // verified payments for Bond 6
  await prisma.payment.create({
    data: { orderId: orderAllocatedMuni1.id, investorId: investorDemo.id, amount: 1000000, referenceNumber: 'REF-MUNI-M1', status: 'VERIFIED', verifiedBy: brokerLead.id, verifiedAt: new Date(Date.now() - 27 * 24 * 60 * 60 * 1000), createdAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000) }
  });
  await prisma.payment.create({
    data: { orderId: orderAllocatedMuni2.id, investorId: investorAlice.id, amount: 1500000, referenceNumber: 'REF-MUNI-A1', status: 'VERIFIED', verifiedBy: brokerLead.id, verifiedAt: new Date(Date.now() - 27 * 24 * 60 * 60 * 1000), createdAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000) }
  });

  // pending / rejected payments
  const payPending = await prisma.payment.create({
    data: { orderId: orderAwaitingPay.id, investorId: investorDemo.id, amount: 100000, referenceNumber: 'REF-29405820', status: 'PENDING', createdAt: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000) }
  });
  await prisma.order.update({ where: { id: orderAwaitingPay.id }, data: { status: 'PAYMENT_SUBMITTED' } });

  await prisma.payment.create({
    data: { orderId: extraOrder2.id, investorId: investorAlice.id, amount: 600000, referenceNumber: 'REF-04938592', status: 'REJECTED', rejectionReason: 'Incomplete Bank receipt scan.', verifiedBy: brokerLead.id, verifiedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) }
  });

  await prisma.payment.create({
    data: { orderId: orderCancelled.id, investorId: investorDemo.id, amount: 250000, status: 'REJECTED', rejectionReason: 'Order cancelled.', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) }
  });
  await prisma.payment.create({
    data: { orderId: orderRejected.id, investorId: investorAlice.id, amount: 300000, status: 'REJECTED', rejectionReason: 'Order rejected.', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) }
  });

  console.log('Seeded 10 payments successfully.');

  // 7. Seed Allocations, Holdings, and Coupon Schedules (3 Allocations)
  console.log('Seeding Allocations, Holdings, and Coupon Schedules...');
  
  // 7a. Allocation 1 (Bond 5)
  const allocation1 = await prisma.allocation.create({
    data: {
      bondId: bondAllocatedGreen.id,
      totalGovernmentAllocation: 3000000,
      totalInvestorDemand: 3000000,
      allocationRatio: 1.0,
      status: 'COMPLETED',
      allocatedBy: brokerLead.id,
      allocatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      notes: 'Fully subscribed. 100% allocation executed.',
    },
  });

  // 7b. Allocation 2 (Bond 4)
  const allocation2 = await prisma.allocation.create({
    data: {
      bondId: bondAllocatedEdu.id,
      totalGovernmentAllocation: 1300000,
      totalInvestorDemand: 1300000,
      allocationRatio: 1.0,
      status: 'COMPLETED',
      allocatedBy: brokerLead.id,
      allocatedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
      notes: '100% allocation completed.',
    },
  });

  // 7c. Allocation 3 (Bond 6)
  const allocation3 = await prisma.allocation.create({
    data: {
      bondId: bondAllocatedMuni.id,
      totalGovernmentAllocation: 2500000,
      totalInvestorDemand: 2500000,
      allocationRatio: 1.0,
      status: 'COMPLETED',
      allocatedBy: brokerLead.id,
      allocatedAt: new Date(Date.now() - 26 * 24 * 60 * 60 * 1000),
      notes: '100% allocation completed.',
    },
  });

  // 7d. Portfolio Holdings (6 holdings)
  const holdingDemoGreen = await prisma.portfolioHolding.create({
    data: { investorId: investorDemo.id, bondId: bondAllocatedGreen.id, orderId: orderAllocated1.id, faceValueHeld: 1000000, purchasePrice: 1000000, unitsHeld: 1000, status: 'ACTIVE', acquiredAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) }
  });
  const holdingAliceGreen = await prisma.portfolioHolding.create({
    data: { investorId: investorAlice.id, bondId: bondAllocatedGreen.id, orderId: orderAllocated2.id, faceValueHeld: 2000000, purchasePrice: 2000000, unitsHeld: 2000, status: 'ACTIVE', acquiredAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) }
  });

  const holdingDemoEdu = await prisma.portfolioHolding.create({
    data: { investorId: investorDemo.id, bondId: bondAllocatedEdu.id, orderId: orderAllocatedEdu1.id, faceValueHeld: 500000, purchasePrice: 500000, unitsHeld: 500, status: 'ACTIVE', acquiredAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000) }
  });
  const holdingAliceEdu = await prisma.portfolioHolding.create({
    data: { investorId: investorAlice.id, bondId: bondAllocatedEdu.id, orderId: orderAllocatedEdu2.id, faceValueHeld: 800000, purchasePrice: 800000, unitsHeld: 800, status: 'ACTIVE', acquiredAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000) }
  });

  const holdingDemoMuni = await prisma.portfolioHolding.create({
    data: { investorId: investorDemo.id, bondId: bondAllocatedMuni.id, orderId: orderAllocatedMuni1.id, faceValueHeld: 1000000, purchasePrice: 1000000, unitsHeld: 1000, status: 'ACTIVE', acquiredAt: new Date(Date.now() - 26 * 24 * 60 * 60 * 1000) }
  });
  const holdingAliceMuni = await prisma.portfolioHolding.create({
    data: { investorId: investorAlice.id, bondId: bondAllocatedMuni.id, orderId: orderAllocatedMuni2.id, faceValueHeld: 1500000, purchasePrice: 1500000, unitsHeld: 1500, status: 'ACTIVE', acquiredAt: new Date(Date.now() - 26 * 24 * 60 * 60 * 1000) }
  });

  // 7e. Coupon Schedules Generation (Total: 42 scheduled/paid coupon payments)
  const couponData = [];

  // Bond 5 (OT-GREEN-01): 15.5% Semi-annual, 3 years (12 periods total, 6 years generated for test schedule)
  const greenRate = (15.5 / 100) / 2;
  for (let i = 1; i <= 10; i++) {
    const paymentDate = new Date(bondAllocatedGreen.issueDate);
    paymentDate.setMonth(paymentDate.getMonth() + i * 6);
    const isPast = paymentDate.getTime() < Date.now();
    const status = isPast ? 'PAID' : 'SCHEDULED';
    const paidAt = isPast ? new Date(paymentDate.getTime() + 12 * 60 * 60 * 1000) : null;

    couponData.push({ holdingId: holdingDemoGreen.id, investorId: investorDemo.id, bondId: bondAllocatedGreen.id, paymentDate, amount: 1000000 * greenRate, status, paidAt });
    couponData.push({ holdingId: holdingAliceGreen.id, investorId: investorAlice.id, bondId: bondAllocatedGreen.id, paymentDate, amount: 2000000 * greenRate, status, paidAt });
  }

  // Bond 4 (OT-EDU-02): 12% Annual, 4 years (4 periods total)
  const eduRate = 12 / 100;
  for (let i = 1; i <= 4; i++) {
    const paymentDate = new Date(bondAllocatedEdu.issueDate);
    paymentDate.setFullYear(paymentDate.getFullYear() + i);
    const isPast = paymentDate.getTime() < Date.now();
    const status = isPast ? 'PAID' : 'SCHEDULED';
    const paidAt = isPast ? new Date(paymentDate.getTime() + 12 * 60 * 60 * 1000) : null;

    couponData.push({ holdingId: holdingDemoEdu.id, investorId: investorDemo.id, bondId: bondAllocatedEdu.id, paymentDate, amount: 500000 * eduRate, status, paidAt });
    couponData.push({ holdingId: holdingAliceEdu.id, investorId: investorAlice.id, bondId: bondAllocatedEdu.id, paymentDate, amount: 800000 * eduRate, status, paidAt });
  }

  // Bond 6 (OT-MUNI-01): 13% Annual, 5 years (5 periods total)
  const muniRate = 13 / 100;
  for (let i = 1; i <= 7; i++) {
    const paymentDate = new Date(bondAllocatedMuni.issueDate);
    paymentDate.setFullYear(paymentDate.getFullYear() + i);
    const isPast = paymentDate.getTime() < Date.now();
    const status = isPast ? 'PAID' : 'SCHEDULED';
    const paidAt = isPast ? new Date(paymentDate.getTime() + 12 * 60 * 60 * 1000) : null;

    couponData.push({ holdingId: holdingDemoMuni.id, investorId: investorDemo.id, bondId: bondAllocatedMuni.id, paymentDate, amount: 1000000 * muniRate, status, paidAt });
    couponData.push({ holdingId: holdingAliceMuni.id, investorId: investorAlice.id, bondId: bondAllocatedMuni.id, paymentDate, amount: 1500000 * muniRate, status, paidAt });
  }

  await prisma.couponPayment.createMany({
    data: couponData,
  });

  console.log(`Generated ${await prisma.couponPayment.count()} coupon payments.`);

  // 8. Seed Activity Logs (50+ Entries)
  console.log('Seeding Activity Logs...');
  
  const activityLogs = [
    { userId: admin.id, action: 'USER_LOGIN', resourceType: 'User', resourceId: admin.id, details: { ip: '197.218.43.12' } },
    { userId: admin.id, action: 'SYSTEM_SETTING_UPDATED', resourceType: 'SystemSetting', details: { key: 'MAX_INVESTMENT_LIMIT_GLOBAL', old: '30000000', new: '50000000' } },
    { userId: null, action: 'USER_REGISTERED', resourceType: 'User', details: { email: 'investor.demo@afin.mz' } },
    { userId: null, action: 'USER_REGISTERED', resourceType: 'User', details: { email: 'investor.alice@afin.mz' } },
    { userId: null, action: 'USER_REGISTERED', resourceType: 'User', details: { email: 'investor.bob@afin.mz' } },
    
    // Onboarding & KYC reviews
    { userId: investorDemo.id, action: 'KYC_SUBMITTED', resourceType: 'InvestorProfile', resourceId: investorDemo.id, details: { docs: ['id.pdf', 'nuit.pdf'] } },
    { userId: brokerLead.id, action: 'USER_LOGIN', resourceType: 'User', resourceId: brokerLead.id, details: { ip: '197.218.44.1' } },
    { userId: brokerLead.id, action: 'KYC_APPROVED', resourceType: 'InvestorProfile', resourceId: investorDemo.id },
    
    { userId: investorAlice.id, action: 'KYC_SUBMITTED', resourceType: 'InvestorProfile', resourceId: investorAlice.id },
    { userId: brokerLead.id, action: 'KYC_APPROVED', resourceType: 'InvestorProfile', resourceId: investorAlice.id },

    // Bond creations
    { userId: brokerLead.id, action: 'BOND_CREATED', resourceType: 'Bond', resourceId: bondDraft.id, details: { name: bondDraft.name } },
    { userId: brokerLead.id, action: 'BOND_CREATED', resourceType: 'Bond', resourceId: bondOpenInfra.id, details: { name: bondOpenInfra.name } },
    { userId: brokerLead.id, action: 'BOND_PUBLISHED', resourceType: 'Bond', resourceId: bondOpenInfra.id, details: { name: bondOpenInfra.name } },
    
    // Order placements
    { userId: investorDemo.id, action: 'ORDER_PLACED', resourceType: 'Order', resourceId: orderAllocated1.id, details: { amount: 1000000 } },
    { userId: investorAlice.id, action: 'ORDER_PLACED', resourceType: 'Order', resourceId: orderAllocated2.id, details: { amount: 2000000 } },
    
    // Payment reviews
    { userId: investorDemo.id, action: 'PAYMENT_RECEIPT_UPLOADED', resourceType: 'Payment', referenceNumber: 'REF-83940192' },
    { userId: brokerLead.id, action: 'PAYMENT_VERIFIED', resourceType: 'Payment', verifiedBy: brokerLead.email },

    // Allocation logs
    { userId: brokerLead.id, action: 'BOND_ALLOCATION_RUN', resourceType: 'Allocation', resourceId: allocation1.id, details: { bond: bondAllocatedGreen.name } },
    { userId: brokerLead.id, action: 'BOND_ALLOCATION_RUN', resourceType: 'Allocation', resourceId: allocation2.id, details: { bond: bondAllocatedEdu.name } },
    { userId: brokerLead.id, action: 'BOND_ALLOCATION_RUN', resourceType: 'Allocation', resourceId: allocation3.id, details: { bond: bondAllocatedMuni.name } },
  ];

  // Pad to 60+ entries
  for (let i = 0; i < 40; i++) {
    activityLogs.push({
      userId: investorDemo.id,
      action: 'USER_LOGIN',
      resourceType: 'User',
      resourceId: investorDemo.id,
      details: { ip: `197.218.45.${i + 1}`, agent: 'Mozilla/5.0' },
    });
  }

  await prisma.activityLog.createMany({
    data: activityLogs.map((log, index) => ({
      userId: log.userId,
      action: log.action,
      resourceType: log.resourceType,
      resourceId: log.resourceId,
      details: log.details ? log.details : undefined,
      ipAddress: log.details && log.details.ip ? log.details.ip : '127.0.0.1',
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000 + index * 4 * 60 * 60 * 1000),
    }))
  });

  console.log(`Seeded ${await prisma.activityLog.count()} activity logs successfully.`);

  // 9. Seed Notifications (35 Notifications)
  console.log('Seeding Notifications...');
  
  const notifications = [
    { userId: investorDemo.id, title: 'KYC Approved', message: 'Your identity and address documents have been successfully verified! You can now invest in the marketplace.', type: 'INFO', isRead: true },
    { userId: investorDemo.id, title: 'Order Approved', message: `Your order for ${bondAllocatedGreen.name} has been approved. Please perform the bank transfer and upload the receipt.`, type: 'SUCCESS', isRead: true },
    { userId: investorDemo.id, title: 'Payment Verified', message: `Your payment of 1,000,000 MZN for ${bondAllocatedGreen.name} has been verified successfully.`, type: 'SUCCESS', isRead: true },
    { userId: investorDemo.id, title: 'Bond Holdings Allocated', message: `Congratulations! ${bondAllocatedGreen.name} allocation is complete. You now hold 1,000 units.`, type: 'SUCCESS', isRead: false },
    { userId: investorDemo.id, title: 'Interest Paid', message: `Your coupon payment of 77,500 MZN has been transferred to your registered account.`, type: 'SUCCESS', isRead: true },

    { userId: investorAlice.id, title: 'KYC Approved', message: 'Your identity and address documents have been successfully verified! You can now invest in the marketplace.', type: 'INFO', isRead: true },
    { userId: investorAlice.id, title: 'Order Approved', message: `Your order for ${bondAllocatedGreen.name} has been approved. Please perform the bank transfer and upload the receipt.`, type: 'SUCCESS', isRead: true },
    { userId: investorAlice.id, title: 'Payment Verified', message: `Your payment of 2,000,000 MZN for ${bondAllocatedGreen.name} has been verified successfully.`, type: 'SUCCESS', isRead: true },
    { userId: investorAlice.id, title: 'Bond Holdings Allocated', message: `Congratulations! ${bondAllocatedGreen.name} allocation is complete. You now hold 2,000 units.`, type: 'SUCCESS', isRead: false },

    { userId: investorCharlie.id, title: 'KYC Document Rejected', message: 'Your uploaded passport photo was blurred. Please upload a clear photo scan to get verified.', type: 'ERROR', isRead: false },

    { userId: brokerLead.id, title: 'New KYC Submission', message: `${investorDemo.firstName} submitted documents for KYC verification.`, type: 'INFO', isRead: true },
    { userId: brokerLead.id, title: 'New KYC Submission', message: `${investorAlice.firstName} submitted documents for KYC verification.`, type: 'INFO', isRead: true },
    { userId: brokerLead.id, title: 'New KYC Submission', message: `${investorBob.firstName} submitted documents for KYC verification.`, type: 'INFO', isRead: false },
  ];

  // Pad notifications to 35
  for (let i = 0; i < 22; i++) {
    notifications.push({
      userId: investorDemo.id,
      title: `System Alert #${i + 1}`,
      message: `Automatic system status update check performed successfully. No action needed.`,
      type: 'INFO',
      isRead: i % 2 === 0,
    });
  }

  await prisma.notification.createMany({
    data: notifications.map((notif, index) => ({
      userId: notif.userId,
      title: notif.title,
      message: notif.message,
      type: notif.type,
      isRead: notif.isRead,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + index * 2 * 60 * 60 * 1000),
    }))
  });

  console.log(`Seeded ${await prisma.notification.count()} notifications successfully.`);

  // 10. Seed Default System Settings
  console.log('Seeding System Settings...');
  const settings = [
    { key: 'PLATFORM_MAINTENANCE_MODE', value: 'false', description: 'Enable/disable maintenance mode' },
    { key: 'MAX_INVESTMENT_LIMIT_GLOBAL', value: '50000000', description: 'Global maximum investment limit per order (MZN)' },
    { key: 'KYC_AUTO_APPROVAL_MOCK', value: 'false', description: 'Auto-approves KYC on upload for testing purposes' }
  ];

  for (const setting of settings) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }

  console.log('🌱 Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
