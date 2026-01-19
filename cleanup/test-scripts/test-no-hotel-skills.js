const axios = require('axios');

async function testNoHotelSkills() {
  try {
    console.log('🏨 TESTING: No Hotel Front Desk Clerk Skills Bug');
    console.log('='.repeat(60));
    
    // Test with aerospace engineer selection
    const testResponses = {
      q1_grade_zip: {
        grade: '11',
        zipCode: '12345'
      },
      q3_career_knowledge: 'yes',
      q3a_career_categories: 'engineering',
      q3a2_engineering_careers: 'aerospace_engineer', // Should NOT generate hotel skills
      q5_education_willingness: 'advanced_degree'
    };

    console.log('📝 Test Input (Should Generate Aerospace Skills, NOT Hotel Skills):');
    console.log('   Career:', testResponses.q3a2_engineering_careers);
    console.log('   Category:', testResponses.q3a_career_categories);
    
    console.log('\n🚀 Submitting to Clean AI Service...');
    
    const response = await axios.post('http://localhost:3002/api/assessment/v2/submit-v1', {
      responses: testResponses
    });

    if (response.data.success) {
      const results = response.data.data;
      console.log('\n✅ SUBMISSION SUCCESSFUL');
      
      // Check career matches
      if (results.careerMatches && results.careerMatches.length > 0) {
        console.log('\n🏆 CAREER MATCHES:');
        results.careerMatches.forEach((match, index) => {
          const isAerospace = match.career.title === 'Aerospace Engineer';
          const isHotel = match.career.title === 'Hotel Front Desk Clerk';
          
          let marker = '  ';
          if (isAerospace) marker = '✅ CORRECT';
          else if (isHotel) marker = '🏨 BUG';
          
          console.log(`${marker} ${index + 1}. ${match.career.title}`);
        });
      }
      
      // Check AI recommendations for skill gaps
      if (results.aiRecommendations) {
        console.log('\n🤖 AI RECOMMENDATIONS ANALYSIS:');
        
        if (results.aiRecommendations.skillGaps) {
          console.log('\n🔧 SKILL GAPS ANALYSIS:');
          console.log('-'.repeat(40));
          
          let hasHotelSkills = false;
          let hasAerospaceSkills = false;
          
          results.aiRecommendations.skillGaps.forEach((skillGap, index) => {
            const skillText = JSON.stringify(skillGap).toLowerCase();
            
            if (skillText.includes('hotel') || skillText.includes('front desk')) {
              hasHotelSkills = true;
              console.log(`🏨 BUG FOUND ${index + 1}. ${skillGap.skill}`);
              console.log(`     Importance: ${skillGap.importance}`);
              console.log(`     How to Acquire: ${skillGap.howToAcquire}`);
            } else if (skillText.includes('aerospace') || skillText.includes('engineering') || skillText.includes('aircraft')) {
              hasAerospaceSkills = true;
              console.log(`✅ CORRECT ${index + 1}. ${skillGap.skill}`);
              console.log(`     Importance: ${skillGap.importance}`);
              console.log(`     How to Acquire: ${skillGap.howToAcquire}`);
            } else {
              console.log(`⚠️  GENERIC ${index + 1}. ${skillGap.skill}`);
              console.log(`     Importance: ${skillGap.importance}`);
            }
          });
          
          // Analysis
          console.log('\n📊 SKILL GAPS ANALYSIS RESULTS:');
          if (hasHotelSkills) {
            console.log('   🏨 BUG DETECTED: Hotel Front Desk Clerk skills found!');
            console.log('   🐛 The old career matching service is still being called');
          } else {
            console.log('   ✅ SUCCESS: No Hotel Front Desk Clerk skills found');
          }
          
          if (hasAerospaceSkills) {
            console.log('   ✅ SUCCESS: Aerospace/Engineering skills found');
          } else {
            console.log('   ⚠️  WARNING: No Aerospace/Engineering specific skills found');
          }
          
        } else {
          console.log('   ℹ️  No skill gaps in AI recommendations');
        }
        
        // Check career recommendations
        if (results.aiRecommendations.careerRecommendations) {
          console.log('\n📋 CAREER RECOMMENDATIONS:');
          results.aiRecommendations.careerRecommendations.slice(0, 3).forEach((rec, index) => {
            const isAerospace = rec.title === 'Aerospace Engineer';
            const isHotel = rec.title === 'Hotel Front Desk Clerk';
            
            let marker = '  ';
            if (isAerospace) marker = '✅ CORRECT';
            else if (isHotel) marker = '🏨 BUG';
            
            console.log(`${marker} ${index + 1}. ${rec.title}`);
          });
        }
      }
      
      // Final assessment
      console.log('\n🎯 FINAL ASSESSMENT:');
      const topMatch = results.careerMatches?.[0];
      const topAIRec = results.aiRecommendations?.careerRecommendations?.[0];
      
      if (topMatch?.career.title === 'Aerospace Engineer' && topAIRec?.title === 'Aerospace Engineer') {
        console.log('   ✅ SUCCESS: Aerospace Engineer is consistently the top choice');
        console.log('   🔧 The clean AI service is working correctly');
      } else {
        console.log(`   ❌ INCONSISTENCY: Top match is ${topMatch?.career.title}, AI rec is ${topAIRec?.title}`);
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

testNoHotelSkills();