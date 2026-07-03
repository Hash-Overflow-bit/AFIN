import fetch from 'node-fetch';

async function test() {
  const baseUrl = 'http://localhost:4000/api';

  console.log('1. Registering a new investor...');
  const email = `test_investor_${Date.now()}@example.com`;
  const password = 'Password123!';
  const registerRes = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password,
      firstName: 'Test',
      lastName: 'Investor'
    })
  });
  
  const registerData = await registerRes.json();
  console.log('Register Response:', registerData);
  
  console.log('\nLogging in...');
  const loginRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const loginData = await loginRes.json();
  if (!loginData.accessToken) {
    console.error('Failed to login:', loginData);
    return;
  }
  const token = loginData.accessToken;

  console.log('\n2. Fetching profile (GET /api/investors/profile)...');
  const profileRes = await fetch(`${baseUrl}/investors/profile`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const profileData = await profileRes.json();
  console.log('Profile Response:', profileData);

  console.log('\n3. Updating profile partially (PATCH /api/investors/profile)...');
  const patch1Res = await fetch(`${baseUrl}/investors/profile`, {
    method: 'PATCH',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    },
    body: JSON.stringify({
      dateOfBirth: '1990-01-01',
      nationality: 'Mozambican',
      city: 'Maputo'
    })
  });
  const patch1Data = await patch1Res.json();
  console.log('Partial Patch Response (expect PENDING):', patch1Data.kycStatus);

  console.log('\n4. Updating profile completely (PATCH /api/investors/profile)...');
  const patch2Res = await fetch(`${baseUrl}/investors/profile`, {
    method: 'PATCH',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    },
    body: JSON.stringify({
      taxId: '123456789',
      addressLine1: '123 Main St',
      country: 'Mozambique'
    })
  });
  const patch2Data = await patch2Res.json();
  console.log('Full Patch Response (expect PROFILE_COMPLETE):', patch2Data.kycStatus);
}

test().catch(console.error);
