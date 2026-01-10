// Test which assessment is being served by the API
const http = require('http');

function testEndpoint(path, description) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          console.log(`\n${description}:`);
          console.log(`Status: ${res.statusCode}`);
          if (parsed.success && parsed.data) {
            console.log(`Version: ${parsed.data.version || 'unknown'}`);
            console.log(`Title: ${parsed.data.title || 'unknown'}`);
            console.log(`Questions: ${parsed.data.questions?.length || 0}`);
            if (parsed.data.questions && parsed.data.questions.length > 0) {
              console.log(`First question: ${parsed.data.questions[0].text || parsed.data.questions[0].label || 'unknown'}`);
              console.log(`Question ID: ${parsed.data.questions[0].id}`);
            }
          } else {
            console.log(`Error: ${parsed.error || 'Unknown error'}`);
          }
        } catch (e) {
          console.log(`Parse error: ${e.message}`);
          console.log(`Raw response: ${data.substring(0, 200)}...`);
        }
        resolve();
      });
    });

    req.on('error', (e) => {
      console.log(`\n${description}:`);
      console.log(`Connection error: ${e.message}`);
      resolve();
    });

    req.setTimeout(5000, () => {
      console.log(`\n${description}:`);
      console.log('Request timeout');
      req.destroy();
      resolve();
    });

    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing Assessment API Endpoints');
  console.log('=' .repeat(50));

  await testEndpoint('/api/assessment/v2', '✅ NEW V3 Assessment (should be used)');
  await testEndpoint('/api/questionnaire', '❌ OLD V1 Questionnaire (should NOT be used)');
  
  console.log('\n' + '=' .repeat(50));
  console.log('If you see old questions, make sure you are visiting:');
  console.log('✅ http://localhost:3000/questionnaire (uses V3)');
  console.log('❌ NOT http://localhost:3000/questionnaire-test (uses V1)');
  console.log('❌ NOT http://localhost:3000/questionnaire-debug (uses static V1)');
}

runTests();