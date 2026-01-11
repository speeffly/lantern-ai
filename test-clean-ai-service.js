const axios = require('axios');

async function testCleanAIService() {
  try {
    console.log('🧹 TESTING CLEAN AI SERVICE');
    console.log('='.repeat(60));
    
    // Test with aerospace engineer selection
    const testResponses = {
      q1_grade_zip: {
        grade: '11',
        zipCode: '12345'
      },
      q3_career_knowledge: 'yes',
      q3a_career_categories: 'engineering',
      q3a2_engineering_careers: 'aerospace_engineer', // KEY TEST
      q5_education_willingness: 'advanced_degree',
      q19_20_impact_inspiration: 'I want to design aircraft and spacecraft systems.'
    };

    console.log('📝 Test Input (Aerospace Engineer Selection):');
    console.log('   Career Knowledge:', testResponses.q3_career_knowledge);
    console.log('   Career Category:', testResponses.q3a_career_categories);
    console.log('   Specific Career:', testResponses.q3a2_engineering_careers);
    console.log('   Education Goal:', testResponses.q5_education_willingness);
    console.log('   Inspiration:', testResponses.q19_20_impact_inspiration);
    
    console.log('\n🚀 Submitting to V1 endpoint with Clean AI Service...');
    
    const response = await axios.post('http://localhost:3002/api/assessment/v2/submit-v1', {
      responses: testResponses
    });

    if (response.data.success) {
      const results = response.data.data;
      console.log('\n✅ SUBMISSION SUCCESSFUL');
      console.log('🎯 Specific Career Choice:', results.specificCareerChoice);
      console.log('📂 Career Category:', results.determinedWorkPreference);
      
      if (results.careerMatches && results.careerMatches.length > 0) {
        console.log('\n🏆 CAREER MATCHES FROM CLEAN AI SERVICE:');
        console.log('-'.repeat(60));
        
        results.careerMatches.forEach((match, index) => {
          const isAerospace = match.career.title === 'Aerospace Engineer';
          const marker = isAerospace ? '✅ CORRECT' : '❌ WRONG';
          
          console.log(`${marker} ${index + 1}. ${match.career.title} (${match.matchScore}%)`);
          console.log(`     Sector: ${match.career.sector}`);
          console.log(`     Explanation: ${match.explanation}`);
          
          if (index === 0) {
            console.log(`\n🔍 TOP MATCH ANALYSIS:`);
            if (isAerospace) {
              console.log('     ✅ SUCCESS: Aerospace Engineer is #1 - Clean AI Service working!');
            } else {
              console.log(`     ❌ FAILURE: ${match.career.title} is #1 instead of Aerospace Engineer`);
            }
          }
        });
        
        // Check AI recommendations
        if (results.aiRecommendations) {
          console.log('\n🤖 AI RECOMMENDATIONS:');
          if (results.aiRecommendations.careerRecommendations) {
            results.aiRecommendations.careerRecommendations.slice(0, 3).forEach((rec, index) => {
              const isAerospace = rec.title === 'Aerospace Engineer';
              const marker = isAerospace ? '✅' : '❌';
              console.log(`${marker} ${index + 1}. ${rec.title} (${rec.matchPercentage}%)`);
            });
          }
          
          if (results.aiRecommendations.careerPathway) {
            console.log('\n🛤️ CAREER PATHWAY:');
            results.aiRecommendations.careerPathway.steps?.slice(0, 3).forEach((step, index) => {
              console.log(`   ${index + 1}. ${step}`);
            });
          }
        }
        
        // Final assessment
        const topMatch = results.careerMatches[0];
        console.log('\n📊 FINAL ASSESSMENT:');
        if (topMatch.career.title === 'Aerospace Engineer') {
          console.log('   🎉 SUCCESS: Clean AI Service correctly prioritized Aerospace Engineer!');
          console.log('   🔧 The aerospace engineer bug appears to be FIXED!');
        } else {
          console.log(`   ❌ FAILURE: Still getting ${topMatch.career.title} instead of Aerospace Engineer`);
          console.log('   🐛 The bug persists - need further investigation');
        }
      }
    } else {
      console.log('❌ SUBMISSION FAILED:', response.data.error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testCleanAIService();