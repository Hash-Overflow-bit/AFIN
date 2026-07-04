const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  await prisma.bond.updateMany({
    where: { totalIssuance: null },
    data: { totalIssuance: 1000000 }
  });
  await prisma.bond.updateMany({
    where: { totalIssuance: 0 },
    data: { totalIssuance: 1000000 }
  });
  console.log('Successfully updated existing bonds to have a totalIssuance of 1,000,000.');
}

main().finally(() => prisma.$disconnect());
