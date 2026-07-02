const { Client } = require('pg');

async function testConnection() {
  console.log('Testing with pg client using explicit config...');
  const client = new Client({
    host: 'aws-0-ap-northeast-1.pooler.supabase.com',
    port: 6543,
    user: 'postgres.ikfbycederuqhursbnrk',
    password: 'zlV3kgDcok9BlaAe',
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected successfully!');
    const res = await client.query('SELECT NOW()');
    console.log('Current time from DB:', res.rows[0]);
  } catch (err) {
    console.error('Connection error:', err.message);
  } finally {
    await client.end();
  }
}

testConnection();
