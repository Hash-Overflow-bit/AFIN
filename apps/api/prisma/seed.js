const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('Password123!', salt);

  // Demo Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@afin.com' },
    update: {},
    create: {
      email: 'admin@afin.com',
      firstName: 'Admin',
      lastName: 'User',
      passwordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  // Demo Broker
  const broker = await prisma.user.upsert({
    where: { email: 'broker@afin.com' },
    update: {},
    create: {
      email: 'broker@afin.com',
      firstName: 'Broker',
      lastName: 'User',
      passwordHash,
      role: 'BROKER',
      status: 'ACTIVE',
    },
  });

  // Demo Investor
  const investor = await prisma.user.upsert({
    where: { email: 'investor@afin.com' },
    update: {},
    create: {
      email: 'investor@afin.com',
      firstName: 'Investor',
      lastName: 'User',
      passwordHash,
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

  console.log('Demo accounts created/verified:');
  console.log('ADMIN: admin@afin.com / Password123!');
  console.log('BROKER: broker@afin.com / Password123!');
  console.log('INVESTOR: investor@afin.com / Password123!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
