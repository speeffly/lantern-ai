const axios = require('axios');

const BASE_URL = 'https://lantern-ai.onrender.com';

async function testZipCodeValidation() {
  console.log('🧪 Testing ZIP Code Validation');
  console.log('='.repeat(80));
  
  const testCases = [
    {
      name: 'Valid ZIP code (5 digits)',
      zipCode: '78724',
      shouldPass: true
    },
    {
      name: 'Invalid ZIP code (letters)',
      zipCode: 'ABCDE',
      shouldPass: false
    },
    {
      name: 'Invalid ZIP code (4 digits)',
      zipCode: '1234',
      shouldPass: false
    },
    {
      name: 'Invalid ZIP code (6 digits)',
      zipCode: '123456',
      shouldPass: false
    },
    {
      name: 'Invalid ZIP code (mixed letters and numbers)',
      zipCode: '12A34',
      shouldPass: false
    },
    {
      name: 'Invalid ZIP code (empty)',
      zipCode: '',
      shouldPass: false
    },
    {
      name: 'Invalid ZIP code (spaces)',
      zipCode: '12 34',
      shouldPass: false
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n📋 Testing: ${testCase.name}`);
    console.log(`   ZIP Code: "${testCase.zipCode}"`);
    console.log(`   Expected: ${testCase.shouldPass ? 'PASS' : 'FAIL'}`);
    
    try {
      const assessmentData = {
        grade: 11,
        zipCode: testCase.zipCode,
        workEnvironment: 'Indoors - offices, hospitals, schools',
        handsOnPreference: 'Prefer working with people and helping them',
        problemSolving: 'Helping people with their challenges',
        helpingOthers: 'Very important - I want to directly help people',
        educationCommitment: '2-4 years of college or technical school',
        incomeImportance: 'Somewhat important - I want a comfortable living',
        jobSecurity: 'Very important - I want a stable, secure job',
        subjectsStrengths: ['Math', 'Science (Biology, Chemistry, Physics)'],
        interestsPassions: 'I am passionate about helping people.',
        workExperience: 'I have volunteered at the local hospital.',
        personalTraits: ['Compassionate and caring'],
        inspirationRoleModels: 'My aunt who is a nurse.',
        legacyImpact: 'I want to help heal people.'
      };

      const response = await axios.post(`${BASE_URL}/api/counselor-assessment/submit`, {
        responses: assessmentData
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      if (response.data.success) {
        if (testCase.shouldPass) {
          console.log('   ✅ PASS - Assessment accepted (as expected)');
        } else {
          console.log('   ❌ FAIL - Assessment should have been rejected but was accepted');
        }
      } else {
        if (testCase.shouldPass) {
          console.log('   ❌ FAIL - Assessment should have been accepted but was rejected');
          console.log('   Error:', response.data.error);
        } else {
          console.log('   ✅ PASS - Assessment rejected (as expected)');
          console.log('   Error:', response.data.error);
        }
      }
      
    } catch (error) {
      if (error.response && error.response.data) {
        if (testCase.shouldPass) {
          console.log('   ❌ FAIL - Assessment should have been accepted but was rejected');
          console.log('   Error:', error.response.data.error);
        } else {
          console.log('   ✅ PASS - Assessment rejected (as expected)');
          console.log('   Error:', error.response.data.error);
        }
      } else {
        console.log('   ⚠️ NETWORK ERROR:', error.message);
      }
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('🔍 ZIP CODE VALIDATION TEST SUMMARY');
  console.log('='.repeat(80));
  console.log('✅ Valid ZIP codes should be accepted (5 digits only)');
  console.log('❌ Invalid ZIP codes should be rejected with clear error messages');
  console.log('\nExpected behavior:');
  console.log('- Only 5-digit numbers should be accepted (e.g., 78724)');
  console.log('- Letters, spaces, and wrong lengths should be rejected');
  console.log('- Clear error message: "ZIP code must be exactly 5 digits (e.g., 12345)"');
  console.log('='.repeat(80));
}

// Run the test
testZipCodeValidation();