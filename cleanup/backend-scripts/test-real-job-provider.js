#!/usr/bin/env node

/**
 * Test script to verify RealJobProvider configuration
 */

require('dotenv').config();

function testRealJobProviderConfig() {
  console.log('🧪 Testing RealJobProvider Configuration');
  console.log('==================================================');
  
  // Check environment variables
  console.log('\n📋 Environment Variables:');
  console.log('   - USE_REAL_JOBS:', process.env.USE_REAL_JOBS || 'not set');
  console.log('   - ADZUNA_APP_ID:', process.env.ADZUNA_APP_ID || 'not set');
  console.log('   - ADZUNA_APP_KEY:', process.env.ADZUNA_APP_KEY ? 'present' : 'not set');
  
  // Test the isEnabled logic
  const useRealJobs = (process.env.USE_REAL_JOBS || '').toLowerCase().trim();
  const appId = (process.env.ADZUNA_APP_ID || '').trim();
  const apiKey = (process.env.ADZUNA_APP_KEY || '').trim();
  
  console.log('\n🔍 Configuration Analysis:');
  console.log('   - USE_REAL_JOBS value:', `"${useRealJobs}"`);
  console.log('   - USE_REAL_JOBS is truthy:', ['true', '1', 'yes'].includes(useRealJobs));
  console.log('   - ADZUNA_APP_ID present:', !!appId);
  console.log('   - ADZUNA_APP_KEY present:', !!apiKey);
  
  const isEnabled = (['true', '1', 'yes'].includes(useRealJobs)) && !!(appId && apiKey);
  
  console.log('\n🎯 Final Result:');
  if (isEnabled) {
    console.log('   ✅ RealJobProvider should be ENABLED');
    console.log('   📡 Will fetch real jobs from Adzuna API');
  } else {
    console.log('   ❌ RealJobProvider is DISABLED');
    console.log('   🔄 Will fall back to mock jobs');
    
    console.log('\n💡 To enable real jobs:');
    if (!['true', '1', 'yes'].includes(useRealJobs)) {
      console.log('   - Set USE_REAL_JOBS=true in .env file');
    }
    if (!appId) {
      console.log('   - Set ADZUNA_APP_ID in .env file');
    }
    if (!apiKey) {
      console.log('   - Set ADZUNA_APP_KEY in .env file');
    }
  }
  
  console.log('\n🏁 Configuration test complete');
  console.log('==================================================');
}

// Run the test
testRealJobProviderConfig();