import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const bonds = await prisma.bond.findMany();
  console.log('Bonds:', bonds.map(b => ({ id: b.id, name: b.name, totalIssuance: b.totalIssuance, faceValue: b.faceValue })));
  
  const orders = await prisma.order.findMany();
  console.log('Orders:', orders.map(o => ({ id: o.id, bondId: o.bondId, requestedAmount: o.requestedAmount, status: o.status })));
}

main().finally(() => prisma.$disconnect());
