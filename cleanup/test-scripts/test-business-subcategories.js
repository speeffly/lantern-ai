// Test script to verify business subcategories are being loaded correctly
const https = require('https');
const http = require('http');

const API_URL = process.env.API_URL || 'http://localhost:3002';

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function testBusinessSubcategories() {
  try {
    console.log('\n🧪 Testing Business Subcategories Loading...\n');
    
    // Fetch counselor assessment questions
    const data = await fetchJSON(`${API_URL}/api/counselor-assessment/questions`);
    
    if (!data.success) {
      console.error('❌ Failed to fetch questions:', data.error);
      return;
    }
    
    const questions = data.data.questions;
    console.log(`✅ Loaded ${questions.length} total questions\n`);
    
    // Find the career categories question
    const careerCategoriesQ = questions.find(q => q.id === 'q3a_career_categories');
    if (careerCategoriesQ) {
      console.log('📋 Career Categories Question Found:');
      console.log('   ID:', careerCategoriesQ.id);
      console.log('   Text:', careerCategoriesQ.text);
      console.log('   Options:', careerCategoriesQ.options);
      console.log('');
    } else {
      console.log('❌ Career categories question NOT found\n');
    }
    
    // Find business subcategory question
    const businessSubQ = questions.find(q => q.id === 'q3a3_business_careers');
    if (businessSubQ) {
      console.log('✅ Business Subcategories Question Found:');
      console.log('   ID:', businessSubQ.id);
      console.log('   Text:', businessSubQ.text);
      console.log('   Type:', businessSubQ.type);
      console.log('   Is Conditional:', businessSubQ.isConditional);
      console.log('   Conditional Parent:', businessSubQ.conditionalParent);
      console.log('   Conditional Trigger:', businessSubQ.conditionalTrigger);
      console.log('   Options:', businessSubQ.options);
      console.log('');
    } else {
      console.log('❌ Business subcategories question NOT found\n');
    }
    
    // Find all conditional questions
    const conditionalQuestions = questions.filter(q => q.isConditional);
    console.log(`📊 Found ${conditionalQuestions.length} conditional questions total:`);
    conditionalQuestions.forEach(q => {
      console.log(`   - ${q.id} (parent: ${q.conditionalParent}, trigger: ${q.conditionalTrigger})`);
    });
    console.log('');
    
    // Check specifically for business_management trigger
    const businessConditionals = conditionalQuestions.filter(q => 
      q.conditionalParent === 'q3a_career_categories' && q.conditionalTrigger === 'business_management'
    );
    
    if (businessConditionals.length > 0) {
      console.log('✅ Business Management conditional questions found:');
      businessConditionals.forEach(q => {
        console.log(`   - ${q.id}: ${q.text}`);
      });
    } else {
      console.log('❌ No conditional questions found for business_management trigger');
      console.log('   Expected: conditionalParent="q3a_career_categories", conditionalTrigger="business_management"');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testBusinessSubcategories();
