import fetch from 'node-fetch';
import fs from 'fs';
import FormData from 'form-data';

async function test() {
  const baseUrl = 'http://localhost:4000/api';

  console.log('1. Registering a new investor...');
  const email = `test_doc_${Date.now()}@example.com`;
  const password = 'Password123!';
  const registerRes = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password,
      firstName: 'Doc',
      lastName: 'Tester'
    })
  });
  
  const registerData = await registerRes.json();
  console.log('Register Response:', registerData);
  
  console.log('\n2. Logging in...');
  const loginRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const loginData = await loginRes.json();
  const token = loginData.accessToken;

  console.log('\n3. Completing profile to reach PROFILE_COMPLETE status...');
  const patchRes = await fetch(`${baseUrl}/investors/profile`, {
    method: 'PATCH',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    },
    body: JSON.stringify({
      dateOfBirth: '1990-01-01',
      nationality: 'Mozambican',
      city: 'Maputo',
      taxId: '123456789',
      addressLine1: '123 Main St',
      country: 'Mozambique'
    })
  });
  const patchData = await patchRes.json();
  console.log('Profile KYC Status:', patchData.kycStatus); // Should be PROFILE_COMPLETE

  console.log('\n4. Uploading document...');
  // Create a dummy file
  fs.writeFileSync('dummy.png', 'fake image content');
  
  const form = new FormData();
  form.append('file', fs.createReadStream('dummy.png'), {
    filename: 'dummy.png',
    contentType: 'image/png',
  });

  const uploadRes = await fetch(`${baseUrl}/investors/documents`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: form,
  });
  const uploadData = await uploadRes.json();
  console.log('Upload Response:', uploadData);

  console.log('\n5. Fetching profile again to check KYC status...');
  const profileRes = await fetch(`${baseUrl}/investors/profile`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const profileData = await profileRes.json();
  console.log('Final Profile KYC Status:', profileData.kycStatus); // Should be DOCUMENTS_SUBMITTED

  console.log('\n6. Fetching documents list...');
  const docsListRes = await fetch(`${baseUrl}/investors/documents`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const docsListData = await docsListRes.json();
  console.log('Documents count:', docsListData.length);

  // cleanup
  fs.unlinkSync('dummy.png');
}

test().catch(console.error);
