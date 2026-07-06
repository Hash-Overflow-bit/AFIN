import http from 'http';

const req = http.request(
  {
    hostname: 'localhost',
    port: 3001,
    path: '/api/portfolio/trigger-mock-coupons',
    method: 'POST',
  },
  (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => console.log('Response:', res.statusCode, data));
  }
);
req.on('error', console.error);
req.end();
