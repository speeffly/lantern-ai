// Test just the direct career mapping without AI interference
const axios = require('axios');

async function testDirectMappingOnly() {
  try {
    console.log('🎯 Testing Direct Career Mapping (No AI)');
    console.log('='.repeat(50));
    
    // First, check if the careers endpoint works
    console.log('1. Testing careers endpoint...');
    const careersResponse = await axios.get('http://localhost:3002/api/careers/all');
    
    if (careersResponse.data.success) {
      const careers = careersResponse.data.data;
      console.log('   ✅ Careers endpoint working, total careers:', careers.length);
      
      const aerospace = careers.find(c => c.title === 'Aerospace Engineer');
      console.log('   🚀 Aerospace Engineer in database:', !!aerospace);
      
      if (aerospace) {
        console.log('      ID:', aerospace.id);
        console.log('      Sector:', aerospace.sector);
        console.log('      Salary:', aerospace.averageSalary);
      }
    } else {
      console.log('   ❌ Careers endpoint failed');
      return;
    }
    
    // Test the V1 processing without AI
    console.log('\n2. Testing V1 processing logic...');
    
    // Create minimal test responses focused on aerospace engineer
    const testResponses = {
      q1_grade_zip: {
        grade: '11',
        zipCode: '12345'
      },
      q3_career_knowledge: 'yes',
      q3a_career_categories: 'engineering',
      q3a2_engineering_careers: 'aerospace_engineer', // KEY TEST
      q5_education_willingness: 'advanced_degree'
    };
    
    console.log('   📝 Test responses:');
    console.log('      Career knowledge:', testResponses.q3_career_knowledge);
    console.log('      Career category:', testResponses.q3a_career_categories);
    console.log('      Specific career:', testResponses.q3a2_engineering_careers);
    
    // Submit with USE_REAL_AI=false to avoid AI interference
    console.log('\n3. Submitting with AI disabled...');
    
    const response = await axios.post('http://localhost:3002/api/assessment/v2/submit-v1', {
      responses: testResponses
    }, {
      headers: {
        'X-Disable-AI': 'true' // Custom header to disable AI if supported
      }
    });
    
    if (response.data.success) {
      const results = response.data.data;
      console.log('   ✅ Submission successful');
      console.log('   🎯 Specific Career Choice:', results.specificCareerChoice);
      console.log('   📂 Career Category:', results.determinedWorkPreference);
      
      if (results.careerMatches && results.careerMatches.length > 0) {
        console.log('\n   📊 CAREER MATCHES RETURNED:');
        results.careerMatches.forEach((match, index) => {
          const isAerospace = match.career.title === 'Aerospace Engineer';
          const isPhotographer = match.career.title === 'Photographer';
          const marker = isAerospace ? '✅' : (isPhotographer ? '🐛' : '  ');
          console.log(`   ${marker} ${index + 1}. ${match.career.title} (${match.matchScore}%)`);
          
          if (index === 0) {
            console.log(`      First match details:`, {
              id: match.career.id,
              sector: match.career.sector,
              explanation: match.explanation
            });
          }
        });
        
        // Check for the bug
        const firstMatch = results.careerMatches[0];
        if (firstMatch && firstMatch.career.title === 'Aerospace Engineer') {
          console.log('\n   ✅ SUCCESS: Aerospace Engineer is the top match!');
        } else if (firstMatch && firstMatch.career.title === 'Photographer') {
          console.log('\n   🐛 BUG CONFIRMED: Photographer is top match instead of Aerospace Engineer');
          console.log('      This indicates the direct mapping is being overridden');
        } else {
          console.log('\n   ⚠️  Unexpected top match:', firstMatch?.career.title);
        }
      } else {
        console.log('\n   ❌ No career matches returned');
      }
    } else {
      console.log('   ❌ Submission failed:', response.data.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Response status:', error.response.status);
      console.error('   Response data:', error.response.data);
    }
  }
}

testDirectMappingOnly();