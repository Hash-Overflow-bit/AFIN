const fetch = require('node-fetch'); // Depending on node version, native fetch might be available

async function test() {
  const email = `test.investor.${Date.now()}@example.com`;
  
  // Register
  let res = await fetch('http://localhost:4000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'Password123!', firstName: 'Test', lastName: 'Investor' })
  });
  let data = await res.json();
  console.log('Register:', data.user ? 'Success' : data);

  // Login
  res = await fetch('http://localhost:4000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'Password123!' })
  });
  data = await res.json();
  const token = data.accessToken;
  console.log('Login token received:', !!token);

  // Get Profile
  res = await fetch('http://localhost:4000/api/investors/profile', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  data = await res.json();
  console.log('Initial Profile:', data);

  // Patch Profile (Partial)
  res = await fetch('http://localhost:4000/api/investors/profile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ city: 'Maputo', country: 'Mozambique' })
  });
  data = await res.json();
  console.log('After Partial Patch:', data);

  // Patch Profile (Complete)
  res = await fetch('http://localhost:4000/api/investors/profile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ 
      dateOfBirth: '1990-01-01',
      nationality: 'Mozambican',
      taxId: '123456789',
      addressLine1: '123 Main St'
    })
  });
  data = await res.json();
  console.log('After Complete Patch:', data);
}

test().catch(console.error);
