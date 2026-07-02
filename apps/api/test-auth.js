const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const email = `test_${Date.now()}@example.com`;
  const passwordHash = await bcrypt.hash('SecurePassword123!', 10);
  
  try {
    const newUser = await prisma.$transaction(async (tx) => {
      console.log('Creating user...');
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          firstName: 'Test',
          lastName: 'User',
          role: 'INVESTOR',
          status: 'PENDING',
        },
      });
      console.log('User created:', user.id);

      console.log('Creating investor profile...');
      const profile = await tx.investorProfile.create({
        data: {
          userId: user.id,
          kycStatus: 'PENDING',
          country: 'Mozambique',
        },
      });
      console.log('Profile created:', profile.id);

      return user;
    });
    console.log('Transaction successful!');
  } catch (error) {
    console.error('Transaction failed:', error);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
