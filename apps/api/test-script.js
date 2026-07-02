async function runTests() {
  console.log('--- TESTING REGISTRATION ---');
  try {
    const regRes = await fetch('http://127.0.0.1:3001/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `investor_${Date.now()}@example.com`,
        password: 'SecurePassword123!',
        firstName: 'Test',
        lastName: 'Investor'
      })
    });
    const regData = await regRes.json();
    console.log(`Status: ${regRes.status}`);
    console.log('Response:', JSON.stringify(regData, null, 2));
    
    console.log('\n--- TESTING LOGIN ---');
    const loginRes = await fetch('http://127.0.0.1:3001/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: regData.email || 'error@example.com',
        password: 'SecurePassword123!'
      })
    });
    const loginData = await loginRes.json();
    console.log(`Status: ${loginRes.status}`);
    console.log('Response:', JSON.stringify(loginData, null, 2));

    console.log('\n--- TESTING PROTECTED PROFILE ROUTE ---');
    const profileRes = await fetch('http://127.0.0.1:3001/auth/profile', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${loginData.accessToken}`
      }
    });
    const profileData = await profileRes.json();
    console.log(`Status: ${profileRes.status}`);
    console.log('Response:', JSON.stringify(profileData, null, 2));

    console.log('\n--- TESTING UNAUTHORIZED ROUTE (NO TOKEN) ---');
    const noTokenRes = await fetch('http://127.0.0.1:3001/auth/profile', {
      method: 'GET',
    });
    const noTokenData = await noTokenRes.json();
    console.log(`Status: ${noTokenRes.status}`);
    console.log('Response:', JSON.stringify(noTokenData, null, 2));

  } catch (error) {
    console.error('Error during testing:', error);
  }
}

runTests();
