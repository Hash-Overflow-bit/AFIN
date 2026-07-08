const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const salt = await bcrypt.genSalt(10);

  // Secure production passwords
  const adminHash = await bcrypt.hash('AfiN#9xP@7zD!4qK', salt);
  const brokerHash = await bcrypt.hash('BrkR*2yM^8wB!5tX', salt);
  const investorHash = await bcrypt.hash('InvS%6hF$3vC#9nJ', salt);

  // Demo Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@afin.mz' },
    update: {},
    create: {
      email: 'admin@afin.mz',
      firstName: 'Admin',
      lastName: 'User',
      passwordHash: adminHash,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  // Demo Broker
  const broker = await prisma.user.upsert({
    where: { email: 'operations@afin.mz' },
    update: {},
    create: {
      email: 'operations@afin.mz',
      firstName: 'Broker',
      lastName: 'User',
      passwordHash: brokerHash,
      role: 'BROKER',
      status: 'ACTIVE',
    },
  });

  // Demo Investor
  const investor = await prisma.user.upsert({
    where: { email: 'investor.demo@afin.mz' },
    update: {},
    create: {
      email: 'investor.demo@afin.mz',
      firstName: 'Investor',
      lastName: 'User',
      passwordHash: investorHash,
      role: 'INVESTOR',
      status: 'ACTIVE',
      investorProfile: {
        create: {
          kycStatus: 'APPROVED',
          country: 'Mozambique',
        }
      }
    },
  });

  // Default Settings
  const settings = [
    { key: 'PLATFORM_MAINTENANCE_MODE', value: 'false', description: 'Enable/disable maintenance mode' },
    { key: 'MAX_INVESTMENT_LIMIT_GLOBAL', value: '50000000', description: 'Global maximum investment limit per order (MZN)' },
    { key: 'KYC_AUTO_APPROVAL_MOCK', value: 'false', description: 'Auto-approves KYC on upload for testing purposes' }
  ];

  for (const setting of settings) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting
    });
  }

  console.log('Production accounts created/verified:');
  console.log('ADMIN: admin@afin.mz / AfiN#9xP@7zD!4qK');
  console.log('BROKER: operations@afin.mz / BrkR*2yM^8wB!5tX');
  console.log('INVESTOR: investor.demo@afin.mz / InvS%6hF$3vC#9nJ');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
