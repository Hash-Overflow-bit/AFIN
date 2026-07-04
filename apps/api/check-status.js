const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const bonds = await prisma.bond.findMany();
  console.log('Bonds:', bonds.map(b => ({ id: b.id, name: b.name, status: b.status })));
}

main().finally(() => prisma.$disconnect());
