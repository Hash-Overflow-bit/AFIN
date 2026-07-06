import { PrismaClient } from '@prisma/client';
const PgBoss = require('pg-boss');

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DIRECT_URL } }
});

async function testTrigger() {
  const boss = new PgBoss(process.env.DIRECT_URL as string);
  
  boss.on('error', (error: any) => console.error('pg-boss error:', error));

  await boss.start();
  console.log('Connected to pg-boss. Queuing job...');
  
  // FIXED JOB NAME
  const jobId = await boss.send('process-coupons', {});
  console.log('Job queued successfully with ID:', jobId);

  // Wait 10 seconds for the worker in the backend (task-872) to process it
  console.log('Waiting 10 seconds for backend to process...');
  await new Promise(resolve => setTimeout(resolve, 10000));

  // Check the database to see if coupons are now PAID
  const coupons = await prisma.couponPayment.findMany();
  const scheduled = coupons.filter(c => c.status === 'SCHEDULED');
  const paid = coupons.filter(c => c.status === 'PAID');

  console.log(`Verification Results:`);
  console.log(`Total Coupons: ${coupons.length}`);
  console.log(`SCHEDULED: ${scheduled.length}`);
  console.log(`PAID: ${paid.length}`);

  if (paid.length > 0 && scheduled.length === 0) {
    console.log('✅ End-to-End Test PASSED! Background job processed the coupons successfully.');
  } else {
    console.log('❌ End-to-End Test FAILED! Coupons were not processed correctly.');
  }

  await boss.stop();
  await prisma.$disconnect();
}

testTrigger().catch(console.error);
