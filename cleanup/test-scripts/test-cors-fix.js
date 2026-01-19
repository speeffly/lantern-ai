// Test script to verify CORS configuration fix
const https = require('https');

const BACKEND_URL = 'https://lantern-ai.onrender.com';
const FRONTEND_ORIGINS = [
  'https://main.d36ebthmdi6xdg.amplifyapp.com',  // New domain
  'https://main.d2ymtj6aumrj0m.amplifyapp.com',  // Old domain
  'https://localhost:3000'                       // Local development
];

async function testCORS(origin) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'lantern-ai.onrender.com',
      port: 443,
      path: '/api/debug/cors',
      method: 'GET',
      headers: {
        'Origin': origin,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: body,
          origin: origin
        });
      });
    });

    req.on('error', (error) => {
      reject({ error, origin });
    });

    req.end();
  });
}

async function testAllOrigins() {
  console.log('🧪 Testing CORS Configuration');
  console.log('='.repeat(50));

  for (const origin of FRONTEND_ORIGINS) {
    console.log(`\n🌐 Testing origin: ${origin}`);
    
    try {
      const result = await testCORS(origin);
      console.log(`   Status: ${result.status}`);
      console.log(`   CORS Headers:`);
      console.log(`     Access-Control-Allow-Origin: ${result.headers['access-control-allow-origin'] || 'not set'}`);
      console.log(`     Access-Control-Allow-Credentials: ${result.headers['access-control-allow-credentials'] || 'not set'}`);
      
      if (result.status === 200) {
        try {
          const data = JSON.parse(result.body);
          console.log(`   Origin Allowed: ${data.data?.isOriginAllowed ? '✅ Yes' : '❌ No'}`);
          console.log(`   Amplify Pattern Match: ${data.data?.amplifyPatternMatch ? '✅ Yes' : '❌ No'}`);
        } catch (e) {
          console.log('   Could not parse response body');
        }
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.error?.message || 'Request failed'}`);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('🏁 CORS test complete');
  console.log('\nIf origins show as not allowed, the backend needs to be redeployed');
  console.log('with the updated CORS configuration.');
}

testAllOrigins().catch(console.error);