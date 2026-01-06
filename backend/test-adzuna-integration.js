#!/usr/bin/env node

/**
 * Test script for Adzuna API integration
 * Tests job search functionality and API connectivity
 */

require('dotenv').config();

async function testAdzunaIntegration() {
  console.log('🧪 Testing Adzuna API Integration');
  console.log('==================================================');
  
  // Check environment variables
  console.log('\n📋 Environment Variables:');
  console.log('   - ADZUNA_APP_ID:', process.env.ADZUNA_APP_ID ? 'Present' : 'Missing');
  console.log('   - ADZUNA_APP_KEY:', process.env.ADZUNA_APP_KEY ? 'Present' : 'Missing');
  
  if (!process.env.ADZUNA_APP_ID || !process.env.ADZUNA_APP_KEY) {
    console.log('\n❌ Adzuna API credentials missing');
    console.log('   Please add to your .env file:');
    console.log('   ADZUNA_APP_ID=your-app-id');
    console.log('   ADZUNA_APP_KEY=your-app-key');
    console.log('   Get credentials from: https://developer.adzuna.com/');
    return;
  }
  
  try {
    // Import the service (need to compile TypeScript first)
    console.log('\n🔄 Note: Make sure to run "npm run build" first to compile TypeScript');
    
    // Test basic job search
    console.log('\n🔍 Testing basic job search...');
    
    const axios = require('axios');
    const testUrl = `https://api.adzuna.com/v1/api/jobs/us/search/1?app_id=${process.env.ADZUNA_APP_ID}&app_key=${process.env.ADZUNA_APP_KEY}&what=nurse&where=New York&results_per_page=5`;
    
    const response = await axios.get(testUrl, { timeout: 10000 });
    const data = response.data;
    
    console.log('✅ Adzuna API connection successful!');
    console.log('   - Total jobs found:', data.count);
    console.log('   - Jobs returned:', data.results?.length || 0);
    console.log('   - Mean salary:', data.mean ? `$${Math.round(data.mean)}` : 'Not available');
    
    if (data.results && data.results.length > 0) {
      console.log('\n📋 Sample Job:');
      const job = data.results[0];
      console.log('   - Title:', job.title);
      console.log('   - Company:', job.company.display_name);
      console.log('   - Location:', job.location.display_name);
      console.log('   - Salary:', job.salary_min && job.salary_max 
        ? `$${Math.round(job.salary_min)} - $${Math.round(job.salary_max)}`
        : 'Not specified');
      console.log('   - Category:', job.category?.label || 'Not specified');
      console.log('   - Posted:', new Date(job.created).toLocaleDateString());
    }
    
    // Test different search parameters
    console.log('\n🔍 Testing healthcare jobs search...');
    const healthcareUrl = `https://api.adzuna.com/v1/api/jobs/us/search/1?app_id=${process.env.ADZUNA_APP_ID}&app_key=${process.env.ADZUNA_APP_KEY}&what=healthcare&where=Chicago&results_per_page=3`;
    
    const healthcareResponse = await axios.get(healthcareUrl, { timeout: 10000 });
    console.log('✅ Healthcare jobs found:', healthcareResponse.data.count);
    
    // Test technology jobs
    console.log('\n🔍 Testing technology jobs search...');
    const techUrl = `https://api.adzuna.com/v1/api/jobs/us/search/1?app_id=${process.env.ADZUNA_APP_ID}&app_key=${process.env.ADZUNA_APP_KEY}&what=software developer&where=San Francisco&results_per_page=3`;
    
    const techResponse = await axios.get(techUrl, { timeout: 10000 });
    console.log('✅ Technology jobs found:', techResponse.data.count);
    
    console.log('\n🎯 Integration Test Results:');
    console.log('   ✅ API connectivity: Working');
    console.log('   ✅ Job search: Working');
    console.log('   ✅ Multiple categories: Working');
    console.log('   ✅ Location filtering: Working');
    
    console.log('\n💡 Next Steps:');
    console.log('   1. Add your Adzuna credentials to production environment');
    console.log('   2. Deploy the updated backend code');
    console.log('   3. Test job recommendations in the frontend');
    
  } catch (error) {
    console.log('\n❌ Adzuna API test failed:', error.message);
    
    if (error.response?.status === 401) {
      console.log('   🔍 Authentication failed - check your APP_ID and APP_KEY');
    } else if (error.response?.status === 429) {
      console.log('   🔍 Rate limit exceeded - try again later');
    } else if (error.response?.status >= 500) {
      console.log('   🔍 Adzuna server error - try again later');
    } else {
      console.log('   🔍 Error details:', error.response?.data || error.message);
    }
  }
  
  console.log('\n🏁 Adzuna integration test complete');
  console.log('==================================================');
}

// Run the test
testAdzunaIntegration().catch(console.error);