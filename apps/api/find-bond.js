const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const bonds = await prisma.bond.findMany();
  console.log('All bonds:', bonds.map(b => ({
    id: b.id,
    name: b.name,
    status: b.status,
    faceValue: b.faceValue,
    minInvestment: b.minInvestment,
    couponRate: b.couponRate
  })));
}

main().finally(() => prisma.$disconnect());
