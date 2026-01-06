// Test script to verify the correct backend URL is working
const https = require('https');

async function testBackendURL(url, endpoint) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(endpoint, url);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname,
      method: 'GET',
      headers: {
        'Origin': 'https://main.d36ebthmdi6xdg.amplifyapp.com',
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
          url: url,
          endpoint: endpoint,
          status: res.statusCode,
          headers: res.headers,
          body: body.substring(0, 200) + (body.length > 200 ? '...' : '')
        });
      });
    });

    req.on('error', (error) => {
      reject({ url, endpoint, error: error.message });
    });

    req.end();
  });
}

async function testBothURLs() {
  console.log('🧪 Testing Backend URLs');
  console.log('='.repeat(50));

  const endpoints = [
    '/api/counselor-assessment/questions',
    '/api/debug/cors',
    '/health'
  ];

  const urls = [
    'https://lantern-ai.onrender.com',           // Correct URL
    'https://lantern-ai-backend.onrender.com'    // Old URL (should fail)
  ];

  for (const url of urls) {
    console.log(`\n🌐 Testing: ${url}`);
    
    for (const endpoint of endpoints) {
      try {
        const result = await testBackendURL(url, endpoint);
        console.log(`   ${endpoint}: ${result.status === 200 ? '✅' : '❌'} ${result.status}`);
        
        if (result.status === 200) {
          console.log(`     CORS: ${result.headers['access-control-allow-origin'] ? '✅' : '❌'}`);
        }
      } catch (error) {
        console.log(`   ${endpoint}: ❌ ${error.error}`);
      }
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('🏁 Backend URL test complete');
  console.log('\nThe correct backend URL is: https://lantern-ai.onrender.com');
  console.log('Frontend needs to be rebuilt and redeployed to use the correct URL.');
}

testBothURLs().catch(console.error);