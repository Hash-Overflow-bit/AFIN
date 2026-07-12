const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Checking active queries in Postgres...');

  // 1. Get running queries
  const activeQueries = await prisma.$queryRaw`
    SELECT pid, query, state, age(clock_timestamp(), query_start)::text as age 
    FROM pg_stat_activity 
    WHERE state != 'idle' AND query NOT LIKE '%pg_stat_activity%';
  `;

  console.log('Active Queries:', activeQueries);

  // 2. Kill other active queries that might be blocking
  console.log('Terminating other active queries running for more than 10 seconds...');
  const terminated = await prisma.$queryRaw`
    SELECT pg_terminate_backend(pid), query
    FROM pg_stat_activity 
    WHERE pid <> pg_backend_pid() 
      AND age(clock_timestamp(), query_start) > interval '10 seconds';
  `;
  console.log('Termination results:', terminated);
}

main()
  .catch((e) => {
    console.error('Error killing locks:', e);
  })
  .finally(() => prisma.$disconnect());
