import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import axios from 'axios';

const prisma = new PrismaClient();
const API_URL = 'http://localhost:3001/api';

async function main() {
  console.log('--- Testing Orders API (Task 4.1) ---');
  
  // 1. Setup Data in DB
  const email = `investor_${Date.now()}@example.com`;
  const password = 'SecurePassword123!';
  const passwordHash = await bcrypt.hash(password, 10);
  
  console.log('1. Creating Investor User...');
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      firstName: 'Order',
      lastName: 'Tester',
      role: 'INVESTOR',
      status: 'ACTIVE',
      investorProfile: {
        create: {
          kycStatus: 'APPROVED'
        }
      }
    },
  });

  console.log('2. Creating OPEN Bond...');
  const broker = await prisma.user.findFirst({ where: { role: 'BROKER_MANAGER' } }) || user; // fallback
  const bond = await prisma.bond.create({
    data: {
      name: 'Order Test Bond',
      isin: 'MZ' + Date.now().toString().slice(-10),
      couponRate: 15.0,
      faceValue: 1000,
      minInvestment: 5000, // Multiple of 1000, min 5000
      issueDate: new Date(),
      maturityDate: new Date(Date.now() + 100000000000), // future
      status: 'OPEN',
      createdBy: broker.id,
    }
  });

  // 3. Login to get JWT Token
  console.log('3. Logging in via API to get token...');
  const loginRes = await axios.post(`${API_URL}/auth/login`, {
    email,
    password
  });
  const token = loginRes.data.accessToken;
  console.log('   Token received!');

  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}` }
  };

  // 4. Test Error Case: Invalid Multiple
  console.log('\n4. Testing POST /api/orders with INVALID amount (not multiple of 1000)...');
  try {
    await axios.post(`${API_URL}/orders`, {
      bondId: bond.id,
      requestedAmount: 5500
    }, axiosConfig);
    console.error('   FAILED: Should have rejected the order.');
  } catch (error) {
    console.log(`   SUCCESS: API rejected correctly -> ${error.response.data.message}`);
  }

  // 5. Test Error Case: Below Minimum
  console.log('\n5. Testing POST /api/orders with INVALID amount (below 5000)...');
  try {
    await axios.post(`${API_URL}/orders`, {
      bondId: bond.id,
      requestedAmount: 4000
    }, axiosConfig);
    console.error('   FAILED: Should have rejected the order.');
  } catch (error) {
    console.log(`   SUCCESS: API rejected correctly -> ${error.response.data.message}`);
  }

  // 6. Test Success Case: Valid Order
  console.log('\n6. Testing POST /api/orders with VALID amount (10000)...');
  let orderId;
  try {
    const res = await axios.post(`${API_URL}/orders`, {
      bondId: bond.id,
      requestedAmount: 10000
    }, axiosConfig);
    console.log('   SUCCESS: Order created!');
    console.log(`   Order ID: ${res.data.id}, Order Number: ${res.data.orderNumber}, Status: ${res.data.status}`);
    orderId = res.data.id;
  } catch (error) {
    console.error('   FAILED:', error.response?.data || error.message);
  }

  // 7. Test Duplicate Case
  console.log('\n7. Testing POST /api/orders for DUPLICATE pending order...');
  try {
    await axios.post(`${API_URL}/orders`, {
      bondId: bond.id,
      requestedAmount: 20000
    }, axiosConfig);
    console.error('   FAILED: Should have rejected duplicate order.');
  } catch (error) {
    console.log(`   SUCCESS: API rejected correctly -> ${error.response.data.message}`);
  }

  // 8. Test GET my-orders
  console.log('\n8. Testing GET /api/orders/my-orders...');
  try {
    const res = await axios.get(`${API_URL}/orders/my-orders`, axiosConfig);
    console.log(`   SUCCESS: Fetched ${res.data.length} orders.`);
    console.log(`   Latest Order: ${res.data[0].orderNumber} for ${res.data[0].bond.name}`);
  } catch (error) {
    console.error('   FAILED:', error.response?.data || error.message);
  }

  // 9. Test Cancel Order
  console.log('\n9. Testing PATCH /api/orders/:id/cancel...');
  try {
    const res = await axios.patch(`${API_URL}/orders/${orderId}/cancel`, {}, axiosConfig);
    console.log(`   SUCCESS: Order status is now ${res.data.status}`);
  } catch (error) {
    console.error('   FAILED:', error.response?.data || error.message);
  }

  // Cleanup
  console.log('\nCleaning up DB...');
  await prisma.activityLog.deleteMany({ where: { userId: user.id }});
  await prisma.order.deleteMany({ where: { investorId: user.id }});
  await prisma.bond.delete({ where: { id: bond.id }});
  await prisma.investorProfile.delete({ where: { userId: user.id }});
  await prisma.user.delete({ where: { id: user.id }});
  console.log('Cleanup complete.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
