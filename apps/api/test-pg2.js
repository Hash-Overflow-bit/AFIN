const { Client } = require('pg');

async function testConnection() {
  console.log('Testing with pooled connection on 6543...');
  const client = new Client({
    host: 'db.ikfbycederuqhursbnrk.supabase.co',
    port: 6543,
    user: 'postgres.ikfbycederuqhursbnrk',
    password: 'jNxFvXMwOo0oxiwz',
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected successfully to pooled DB!');
    const res = await client.query('SELECT NOW()');
    console.log('Current time from DB:', res.rows[0]);
  } catch (err) {
    console.error('Connection error:', err.message);
  } finally {
    await client.end();
  }
}

testConnection();
