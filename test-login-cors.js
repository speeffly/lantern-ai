// Quick test for login CORS after deployment
const https = require('https');

async function testLoginCORS() {
  console.log('🧪 Testing Login CORS Configuration');
  console.log('='.repeat(40));

  const origin = 'https://main.d36ebthmdi6xdg.amplifyapp.com';
  
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'lantern-ai.onrender.com',  // Correct hostname
      port: 443,
      path: '/api/auth-db/login',
      method: 'OPTIONS',  // Preflight request
      headers: {
        'Origin': origin,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
      }
    };

    const req = https.request(options, (res) => {
      console.log(`Status: ${res.statusCode}`);
      console.log('CORS Headers:');
      console.log(`  Access-Control-Allow-Origin: ${res.headers['access-control-allow-origin'] || 'not set'}`);
      console.log(`  Access-Control-Allow-Methods: ${res.headers['access-control-allow-methods'] || 'not set'}`);
      console.log(`  Access-Control-Allow-Headers: ${res.headers['access-control-allow-headers'] || 'not set'}`);
      console.log(`  Access-Control-Allow-Credentials: ${res.headers['access-control-allow-credentials'] || 'not set'}`);
      
      if ((res.statusCode === 200 || res.statusCode === 204) && res.headers['access-control-allow-origin']) {
        console.log('\n✅ CORS is working! Login should work now.');
      } else {
        console.log('\n❌ CORS still not working. Backend may need more time to deploy.');
      }
      
      resolve();
    });

    req.on('error', (error) => {
      console.log(`❌ Error: ${error.message}`);
      reject(error);
    });

    req.end();
  });
}

testLoginCORS().catch(console.error);