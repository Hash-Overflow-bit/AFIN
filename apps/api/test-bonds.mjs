import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Testing Bonds API via Prisma (Database Level) to verify models ---');
  
  // 1. Create a Broker Manager User
  const email = `broker_${Date.now()}@example.com`;
  const passwordHash = await bcrypt.hash('SecurePassword123!', 10);
  
  const broker = await prisma.user.create({
    data: {
      email,
      passwordHash,
      firstName: 'Test',
      lastName: 'Broker',
      role: 'BROKER_MANAGER',
      status: 'ACTIVE',
    },
  });
  console.log('Created Broker Manager:', broker.id);

  // 2. Create a Bond as DRAFT
  console.log('Creating Bond...');
  const bond = await prisma.bond.create({
    data: {
      name: 'Test Treasury Bond 2031',
      isin: 'MZ1234567890',
      couponRate: 10.5,
      faceValue: 100,
      minInvestment: 10000,
      issueDate: new Date(),
      maturityDate: new Date('2031-12-31'),
      status: 'DRAFT',
      createdBy: broker.id,
    }
  });
  console.log('Bond Created Successfully:', bond);

  // 3. Publish the Bond
  console.log('Publishing Bond...');
  const publishedBond = await prisma.bond.update({
    where: { id: bond.id },
    data: { status: 'OPEN' }
  });
  console.log('Bond Published Successfully:', publishedBond.status);

  // 4. Fetch all OPEN bonds
  const openBonds = await prisma.bond.findMany({
    where: { status: 'OPEN' }
  });
  console.log(`Found ${openBonds.length} OPEN bonds.`);

  // Cleanup
  console.log('Cleaning up test data...');
  await prisma.bond.delete({ where: { id: bond.id } });
  await prisma.user.delete({ where: { id: broker.id } });
  console.log('Done.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
