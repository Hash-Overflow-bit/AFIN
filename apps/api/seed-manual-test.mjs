import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 1. Create a Broker
  const brokerEmail = 'broker@afin.com';
  let broker = await prisma.user.findUnique({ where: { email: brokerEmail } });
  
  if (!broker) {
    broker = await prisma.user.create({
      data: {
        email: brokerEmail,
        passwordHash,
        firstName: 'Alice',
        lastName: 'Broker',
        role: 'BROKER_MANAGER',
        status: 'ACTIVE',
      }
    });
  }

  // 2. Create an Investor (Approved)
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
          create: {
            kycStatus: 'APPROVED'
          }
        }
      }
    });
  } else {
    // Ensure KYC is approved
    await prisma.investorProfile.update({
      where: { userId: investor.id },
      data: { kycStatus: 'APPROVED' }
    });
  }

  // 3. Create an OPEN bond if none exists
  let bond = await prisma.bond.findFirst({ where: { status: 'OPEN' } });
  if (!bond) {
    bond = await prisma.bond.create({
      data: {
        name: 'Mozambique Treasury 2026',
        isin: 'MZ999888777',
        couponRate: 12.5,
        faceValue: 1000,
        minInvestment: 10000,
        issueDate: new Date(),
        maturityDate: new Date('2026-12-31'),
        status: 'OPEN',
        createdBy: broker.id,
      }
    });
  }

  console.log('--- TEST DATA READY ---');
  console.log('Broker Login: broker@afin.com / Password123!');
  console.log('Investor Login: investor@afin.com / Password123!');
  console.log('Bond Available:', bond.name);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
