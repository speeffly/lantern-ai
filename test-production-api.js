// Test script to check production API endpoints
const https = require('https');

const BASE_URL = 'https://lantern-ai.onrender.com';

async function testEndpoint(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Test-Script/1.0'
      }
    };

    if (data && method === 'POST') {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: body
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data && method === 'POST') {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing Production API Endpoints');
  console.log('='.repeat(50));

  try {
    // Test 1: Basic health check
    console.log('\n1. Testing basic API health...');
    const healthCheck = await testEndpoint('/api/health');
    console.log(`   Status: ${healthCheck.status}`);
    console.log(`   Response: ${healthCheck.body.substring(0, 200)}`);

    // Test 2: Check if feedback routes exist
    console.log('\n2. Testing feedback routes...');
    const feedbackStats = await testEndpoint('/api/feedback/stats');
    console.log(`   Status: ${feedbackStats.status}`);
    console.log(`   Response: ${feedbackStats.body.substring(0, 200)}`);

    // Test 3: Test feedback submission (should fail gracefully)
    console.log('\n3. Testing feedback submission...');
    const feedbackSubmit = await testEndpoint('/api/feedback/submit', 'POST', {
      careerCode: 'TEST001',
      careerTitle: 'Test Career',
      feedbackType: 'rating',
      rating: 5
    });
    console.log(`   Status: ${feedbackSubmit.status}`);
    console.log(`   Response: ${feedbackSubmit.body.substring(0, 200)}`);

    // Test 4: Check available routes
    console.log('\n4. Testing available routes...');
    const routes = await testEndpoint('/api');
    console.log(`   Status: ${routes.status}`);
    console.log(`   Response: ${routes.body.substring(0, 200)}`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }

  console.log('\n' + '='.repeat(50));
  console.log('🏁 Production API test complete');
}

runTests();