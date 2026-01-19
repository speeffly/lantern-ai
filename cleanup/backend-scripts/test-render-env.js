#!/usr/bin/env node

/**
 * Test script to verify Render.com environment variables
 * This will help debug why RealJobProvider is still disabled in production
 */

console.log('🧪 Testing Render.com Environment Variables');
console.log('==================================================');

// Check all relevant environment variables
console.log('\n📋 Environment Variables Status:');
console.log('   - NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('   - USE_REAL_JOBS:', process.env.USE_REAL_JOBS || 'not set');
console.log('   - ADZUNA_APP_ID:', process.env.ADZUNA_APP_ID || 'not set');
console.log('   - ADZUNA_APP_KEY:', process.env.ADZUNA_APP_KEY ? 'present' : 'not set');
console.log('   - ADZUNA_COUNTRY:', process.env.ADZUNA_COUNTRY || 'not set (will default to "us")');

// Test the exact logic from RealJobProvider.isEnabled()
const useRealJobs = (process.env.USE_REAL_JOBS || '').toLowerCase().trim();
const appId = (process.env.ADZUNA_APP_ID || '').trim();
const apiKey = (process.env.ADZUNA_APP_KEY || '').trim();

console.log('\n🔍 RealJobProvider.isEnabled() Logic Test:');
console.log('   - USE_REAL_JOBS value:', `"${useRealJobs}"`);
console.log('   - USE_REAL_JOBS is truthy:', ['true', '1', 'yes'].includes(useRealJobs));
console.log('   - ADZUNA_APP_ID present:', !!appId);
console.log('   - ADZUNA_APP_ID length:', appId.length);
console.log('   - ADZUNA_APP_KEY present:', !!apiKey);
console.log('   - ADZUNA_APP_KEY length:', apiKey.length);

const flagCheck = ['true', '1', 'yes'].includes(useRealJobs);
const credentialsCheck = !!(appId && apiKey);
const finalResult = flagCheck && credentialsCheck;

console.log('\n🎯 Final RealJobProvider Status:');
console.log('   - Flag check (USE_REAL_JOBS):', flagCheck ? '✅ PASS' : '❌ FAIL');
console.log('   - Credentials check (APP_ID & API_KEY):', credentialsCheck ? '✅ PASS' : '❌ FAIL');
console.log('   - Overall result:', finalResult ? '✅ ENABLED' : '❌ DISABLED');

if (!finalResult) {
  console.log('\n💡 Issues Found:');
  if (!flagCheck) {
    console.log('   ❌ USE_REAL_JOBS is not set to "true", "1", or "yes"');
    console.log('   💡 Set USE_REAL_JOBS=true in Render environment variables');
  }
  if (!appId) {
    console.log('   ❌ ADZUNA_APP_ID is missing or empty');
    console.log('   💡 Set ADZUNA_APP_ID in Render environment variables');
  }
  if (!apiKey) {
    console.log('   ❌ ADZUNA_APP_KEY is missing or empty');
    console.log('   💡 Set ADZUNA_APP_KEY in Render environment variables');
  }
}

console.log('\n🔧 Environment Variable Debugging:');
console.log('   - All environment variables:', Object.keys(process.env).filter(key => 
  key.includes('ADZUNA') || key.includes('USE_REAL') || key.includes('JOB')
).map(key => `${key}=${process.env[key] ? 'SET' : 'NOT_SET'}`));

console.log('\n🏁 Test complete');
console.log('==================================================');

// Exit with error code if RealJobProvider would be disabled
process.exit(finalResult ? 0 : 1);