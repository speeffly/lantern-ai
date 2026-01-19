const https = require('https');
const { URL } = require('url');

console.log('🧪 Testing Adzuna API Fix');
console.log('='.repeat(50));

// Load environment variables
require('dotenv').config();

const appId = process.env.ADZUNA_APP_ID;
const apiKey = process.env.ADZUNA_API_KEY;
const useRealJobs = process.env.USE_REAL_JOBS;

console.log('📋 Environment Variables:');
console.log(`   - USE_REAL_JOBS: "${useRealJobs}"`);
console.log(`   - ADZUNA_APP_ID: ${appId ? 'present' : 'missing'} (length: ${appId?.length || 0})`);
console.log(`   - ADZUNA_API_KEY: ${apiKey ? 'present' : 'missing'} (length: ${apiKey?.length || 0})`);

if (!appId || !apiKey) {
  console.error('❌ Missing Adzuna credentials');
  process.exit(1);
}

// Test API call
async function testAdzunaAPI() {
  try {
    console.log('\n🔍 Testing Adzuna API call...');
    
    const url = new URL('https://api.adzuna.com/v1/api/jobs/us/search/1');
    url.searchParams.set('app_id', appId);
    url.searchParams.set('app_key', apiKey);
    url.searchParams.set('results_per_page', '5');
    url.searchParams.set('what', 'nurse');
    url.searchParams.set('where', '78724');
    url.searchParams.set('distance', '25');
    
    console.log(`📡 API URL: ${url.toString().replace(apiKey, 'HIDDEN')}`);
    
    const response = await fetchJson(url.toString());
    
    if (response.results && response.results.length > 0) {
      console.log(`✅ Success! Found ${response.results.length} jobs`);
      console.log('\n📋 Sample job:');
      const job = response.results[0];
      console.log(`   - Title: ${job.title}`);
      console.log(`   - Company: ${job.company?.display_name}`);
      console.log(`   - Location: ${job.location?.display_name}`);
      console.log(`   - Salary: ${formatSalary(job.salary_min, job.salary_max)}`);
      console.log(`   - Posted: ${job.created}`);
    } else {
      console.log('⚠️ No jobs found in response');
    }
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    
    if (error.message.includes('HTTP 400')) {
      console.error('   → HTTP 400: Bad Request - Check API parameters');
    } else if (error.message.includes('HTTP 401')) {
      console.error('   → HTTP 401: Unauthorized - Check API credentials');
    } else if (error.message.includes('HTTP 429')) {
      console.error('   → HTTP 429: Rate Limited - Too many requests');
    } else if (error.message.includes('HTTP 403')) {
      console.error('   → HTTP 403: Forbidden - API access denied');
    }
  }
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, res => {
      let data = '';
      
      if (res.statusCode && res.statusCode >= 400) {
        console.error(`❌ HTTP ${res.statusCode}`);
        res.on('data', chunk => { data += chunk; });
        res.on('end', () => {
          console.error(`   → Error response: ${data.substring(0, 200)}`);
          reject(new Error(`HTTP ${res.statusCode}`));
        });
        return;
      }

      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (err) {
          console.error('❌ Failed to parse response:', err);
          console.error('   → Response preview:', data.substring(0, 200));
          reject(err);
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy(new Error('Request timeout'));
    });
  });
}

function formatSalary(min, max) {
  if (min && max) return `$${Math.round(min).toLocaleString()} - $${Math.round(max).toLocaleString()}`;
  if (min) return `$${Math.round(min).toLocaleString()}+`;
  if (max) return `Up to $${Math.round(max).toLocaleString()}`;
  return 'Not specified';
}

// Run the test
testAdzunaAPI().then(() => {
  console.log('\n✅ Adzuna API test completed');
}).catch((error) => {
  console.error('\n❌ Test failed:', error);
  process.exit(1);
});