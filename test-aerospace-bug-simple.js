const axios = require('axios');

async function testAerospaceBug() {
  try {
    console.log('🐛 Testing Aerospace Engineer Bug');
    console.log('='.repeat(50));
    
    // Test V1 submission with aerospace engineer selection
    const testResponses = {
      q1_grade_zip: {
        grade: '11',
        zipCode: '12345'
      },
      q3_career_knowledge: 'yes',
      q3a_career_categories: 'engineering',
      q3a2_engineering_careers: 'aerospace_engineer', // KEY TEST
      q4_academic_performance: {
        'Math': 'Excellent',
        'Science (Biology, Chemistry, Physics)': 'Excellent'
      },
      q5_education_willingness: 'advanced_degree',
      q14_constraints: ['no_constraints'],
      q17_support_confidence: 'strong_support',
      q19_20_impact_inspiration: 'I want to work in aerospace engineering and design aircraft.'
    };

    console.log('📝 Submitting test with aerospace_engineer selection...');
    
    const response = await axios.post('http://localhost:3002/api/assessment/v2/submit-v1', {
      responses: testResponses
    });

    if (response.data.success) {
      const results = response.data.data;
      console.log('\n✅ Submission successful');
      console.log('🎯 Specific Career Choice:', results.specificCareerChoice);
      console.log('📊 Career Category:', results.determinedWorkPreference);
      
      if (results.careerMatches && results.careerMatches.length > 0) {
        console.log('\n🏆 TOP 5 CAREER MATCHES:');
        results.careerMatches.slice(0, 5).forEach((match, index) => {
          const isAerospace = match.career.title === 'Aerospace Engineer';
          const isPhotographer = match.career.title === 'Photographer';
          const marker = isAerospace ? '✅' : (isPhotographer ? '🐛' : '  ');
          console.log(`${marker} ${index + 1}. ${match.career.title} (${match.matchScore}%)`);
        });
        
        // Check for the bug
        const photographerMatch = results.careerMatches.find(m => m.career.title === 'Photographer');
        const aerospaceMatch = results.careerMatches.find(m => m.career.title === 'Aerospace Engineer');
        
        if (photographerMatch && !aerospaceMatch) {
          console.log('\n🚨 BUG CONFIRMED: Photographer found but NO Aerospace Engineer!');
        } else if (aerospaceMatch) {
          console.log('\n✅ SUCCESS: Aerospace Engineer found in results');
        } else {
          console.log('\n⚠️  Neither Photographer nor Aerospace Engineer found');
        }
      }
    } else {
      console.log('❌ Submission failed:', response.data.error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testAerospaceBug();