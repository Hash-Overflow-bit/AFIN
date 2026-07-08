const { Client } = require('pg');

async function testConnection() {
  const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.ikfbycederuqhursbnrk:jNxFvXMwOo0oxiwz@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?sslmode=require';
  
  console.log('Testing with pg client...');
  const client = new Client({
    connectionString,
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
