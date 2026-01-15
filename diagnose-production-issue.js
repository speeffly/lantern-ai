/**
 * Production Issue Diagnostic Script
 * Run this to check what's happening in production
 */

const https = require('https');

// Configuration
const PRODUCTION_URL = process.env.PRODUCTION_URL || 'https://your-backend-url.com';
const TEST_EMAIL = process.env.TEST_EMAIL || 'geostar0211@gmail.com';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'your-password';

console.log('🔍 PRODUCTION DIAGNOSTIC TOOL');
console.log('='.repeat(80));
console.log(`Production URL: ${PRODUCTION_URL}`);
console.log('='.repeat(80));
console.log('');

async function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, PRODUCTION_URL);
    const requestOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = https.request(url, requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: JSON.parse(data)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data
          });
        }
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

async function runDiagnostics() {
  console.log('📋 Test 1: Check Backend Health');
  console.log('-'.repeat(80));
  try {
    const health = await makeRequest('/health');
    console.log(`✅ Status: ${health.status}`);
    console.log(`Response:`, health.body);
  } catch (error) {
    console.log(`❌ Health check failed:`, error.message);
  }
  console.log('');

  console.log('📋 Test 2: Login Test');
  console.log('-'.repeat(80));
  let token = null;
  try {
    const login = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: {
        email: TEST_EMAIL,
        password: TEST_PASSWORD
      }
    });
    console.log(`Status: ${login.status}`);
    if (login.body.success) {
      token = login.body.token;
      console.log(`✅ Login successful`);
      console.log(`Token: ${token.substring(0, 20)}...`);
      console.log(`User:`, login.body.user);
    } else {
      console.log(`❌ Login failed:`, login.body.error);
    }
  } catch (error) {
    console.log(`❌ Login request failed:`, error.message);
  }
  console.log('');

  if (!token) {
    console.log('⚠️  Cannot continue without valid token');
    return;
  }

  console.log('📋 Test 3: Check Assessment History');
  console.log('-'.repeat(80));
  try {
    const history = await makeRequest('/api/counselor-assessment/history', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log(`Status: ${history.status}`);
    if (history.body.success) {
      console.log(`✅ Found ${history.body.data.length} assessment sessions`);
      history.body.data.forEach((session, index) => {
        console.log(`  ${index + 1}. Session ${session.id} - Status: ${session.status} - Created: ${session.created_at}`);
      });
    } else {
      console.log(`❌ Failed to get history:`, history.body.error);
    }
  } catch (error) {
    console.log(`❌ History request failed:`, error.message);
  }
  console.log('');

  console.log('📋 Test 4: Check Database Connection');
  console.log('-'.repeat(80));
  try {
    const dbCheck = await makeRequest('/api/debug/database-status', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log(`Status: ${dbCheck.status}`);
    console.log(`Response:`, dbCheck.body);
  } catch (error) {
    console.log(`⚠️  Debug endpoint not available (this is okay)`);
  }
  console.log('');

  console.log('📋 Test 5: Check Environment Variables');
  console.log('-'.repeat(80));
  console.log('Check these in your hosting platform:');
  console.log('  - DATABASE_URL: Should be set to PostgreSQL connection string');
  console.log('  - JWT_SECRET: Should be set (default: lantern-ai-secret-key)');
  console.log('  - USE_REAL_AI: Should be "true" if using OpenAI');
  console.log('  - OPENAI_API_KEY: Should be set if USE_REAL_AI=true');
  console.log('');

  console.log('='.repeat(80));
  console.log('📊 DIAGNOSTIC SUMMARY');
  console.log('='.repeat(80));
  console.log('');
  console.log('Next Steps:');
  console.log('1. Check production backend logs for errors');
  console.log('2. Verify DATABASE_URL is correctly set');
  console.log('3. Ensure backend was rebuilt after code changes');
  console.log('4. Check if assessment sessions are being created in database');
  console.log('5. Verify JWT_SECRET matches between services');
  console.log('');
  console.log('Common Issues:');
  console.log('- Backend not rebuilt: Run "npm run build" before deploying');
  console.log('- Environment variables not set: Check hosting platform settings');
  console.log('- Database connection failed: Verify DATABASE_URL');
  console.log('- Old code still running: Force restart backend service');
  console.log('');
}

runDiagnostics().catch(error => {
  console.error('❌ Diagnostic script failed:', error);
  process.exit(1);
});
