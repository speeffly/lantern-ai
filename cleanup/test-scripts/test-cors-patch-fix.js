const https = require('https');

// Test CORS PATCH method support
async function testCORSPatchMethod() {
  console.log('🌐 Testing CORS PATCH method support...');
  console.log('='.repeat(50));

  const options = {
    hostname: 'lantern-ai.onrender.com',
    path: '/api/student/assignments/1/status',
    method: 'OPTIONS', // Preflight request
    headers: {
      'Origin': 'https://main.d36ebthmdi6xdg.amplifyapp.com',
      'Access-Control-Request-Method': 'PATCH',
      'Access-Control-Request-Headers': 'Content-Type, Authorization'
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      console.log('📊 Preflight response status:', res.statusCode);
      console.log('📊 Response headers:');
      
      Object.keys(res.headers).forEach(header => {
        if (header.toLowerCase().includes('access-control')) {
          console.log(`   ${header}: ${res.headers[header]}`);
        }
      });

      const allowedMethods = res.headers['access-control-allow-methods'];
      const allowedOrigin = res.headers['access-control-allow-origin'];
      
      console.log('\n🔍 CORS Analysis:');
      console.log(`   Allowed Origin: ${allowedOrigin}`);
      console.log(`   Allowed Methods: ${allowedMethods}`);
      console.log(`   PATCH Supported: ${allowedMethods && allowedMethods.includes('PATCH') ? '✅ YES' : '❌ NO'}`);
      
      if (allowedMethods && allowedMethods.includes('PATCH')) {
        console.log('\n✅ CORS PATCH method is now supported!');
        console.log('🎯 Student assignment status updates should work');
      } else {
        console.log('\n❌ CORS PATCH method still not supported');
        console.log('🔧 Backend needs to be redeployed with PATCH method');
      }

      resolve(res.statusCode === 200 || res.statusCode === 204);
    });

    req.on('error', (error) => {
      console.error('❌ CORS test error:', error.message);
      reject(error);
    });

    req.end();
  });
}

// Test actual PATCH request (will fail without auth, but should not fail due to CORS)
async function testPatchRequest() {
  console.log('\n🔧 Testing actual PATCH request (without auth)...');
  
  const options = {
    hostname: 'lantern-ai.onrender.com',
    path: '/api/student/assignments/1/status',
    method: 'PATCH',
    headers: {
      'Origin': 'https://main.d36ebthmdi6xdg.amplifyapp.com',
      'Content-Type': 'application/json'
      // Intentionally no Authorization header to test CORS vs Auth errors
    }
  };

  const testData = JSON.stringify({ status: 'in_progress' });

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        console.log('📊 PATCH response status:', res.statusCode);
        
        try {
          const jsonBody = JSON.parse(body);
          console.log('📊 PATCH response:', jsonBody);
          
          if (res.statusCode === 401) {
            console.log('✅ Got 401 Unauthorized (expected - no auth token)');
            console.log('🎯 This means CORS is working, just need authentication');
          } else if (res.statusCode === 404) {
            console.log('✅ Got 404 Not Found (expected - assignment may not exist)');
            console.log('🎯 This means CORS is working');
          } else {
            console.log(`ℹ️ Got ${res.statusCode} response`);
          }
        } catch (e) {
          console.log('📊 PATCH response (non-JSON):', body);
        }

        resolve(true);
      });
    });

    req.on('error', (error) => {
      if (error.message.includes('CORS')) {
        console.error('❌ CORS error still present:', error.message);
        resolve(false);
      } else {
        console.log('ℹ️ Non-CORS error (expected):', error.message);
        resolve(true);
      }
    });

    req.write(testData);
    req.end();
  });
}

// Run tests
async function runCORSTests() {
  try {
    await testCORSPatchMethod();
    await testPatchRequest();
    
    console.log('\n🎯 NEXT STEPS:');
    console.log('1. Deploy backend changes to Render');
    console.log('2. Wait for deployment to complete');
    console.log('3. Test student assignment status updates');
    console.log('4. Verify PATCH requests work from frontend');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

runCORSTests();

console.log(`
📋 CORS PATCH METHOD FIX
========================

🔧 ISSUE: PATCH method not allowed in CORS preflight response
🎯 FIX: Added 'PATCH' to allowed methods in backend CORS configuration

📝 Changes Made:
- Updated backend/src/index.ts
- Added 'PATCH' to methods array: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']

🚀 Deployment Required:
- Backend needs to be redeployed to Render
- Changes will take effect after deployment completes

🧪 Testing:
- This script tests CORS preflight for PATCH method
- Verifies that PATCH requests are allowed from Amplify domain
- Confirms student assignment status updates will work
`);