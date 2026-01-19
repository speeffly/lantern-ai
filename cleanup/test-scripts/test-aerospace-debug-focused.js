const axios = require('axios');

async function testAerospaceDebugFocused() {
  try {
    console.log('🐛 FOCUSED AEROSPACE ENGINEER DEBUG TEST');
    console.log('='.repeat(60));
    
    // Test with minimal aerospace engineer selection
    const testResponses = {
      q1_grade_zip: {
        grade: '11',
        zipCode: '12345'
      },
      q3_career_knowledge: 'yes',
      q3a_career_categories: 'engineering',
      q3a2_engineering_careers: 'aerospace_engineer', // CRITICAL TEST
      q5_education_willingness: 'advanced_degree'
    };

    console.log('📝 Test Input:');
    console.log('   Career Knowledge:', testResponses.q3_career_knowledge);
    console.log('   Career Category:', testResponses.q3a_career_categories);
    console.log('   Specific Career:', testResponses.q3a2_engineering_careers);
    console.log('   Education:', testResponses.q5_education_willingness);
    
    console.log('\n🚀 Submitting to V1 endpoint...');
    
    const response = await axios.post('http://localhost:3002/api/assessment/v2/submit-v1', {
      responses: testResponses
    });

    if (response.data.success) {
      const results = response.data.data;
      console.log('\n✅ SUBMISSION SUCCESSFUL');
      console.log('🎯 Specific Career Choice:', results.specificCareerChoice);
      console.log('📂 Career Category:', results.determinedWorkPreference);
      
      if (results.careerMatches && results.careerMatches.length > 0) {
        console.log('\n🏆 CAREER MATCHES RETURNED:');
        console.log('-'.repeat(60));
        results.careerMatches.forEach((match, index) => {
          const isAerospace = match.career.title === 'Aerospace Engineer';
          const isHotel = match.career.title === 'Hotel Front Desk Clerk';
          const isPhotographer = match.career.title === 'Photographer';
          
          let marker = '  ';
          if (isAerospace) marker = '✅';
          else if (isHotel) marker = '🏨';
          else if (isPhotographer) marker = '📸';
          
          console.log(`${marker} ${index + 1}. ${match.career.title} (${match.matchScore}%)`);
          console.log(`     Sector: ${match.career.sector}`);
          console.log(`     ID: ${match.career.id}`);
          
          if (index === 0) {
            console.log(`     🔍 TOP MATCH DETAILS:`);
            console.log(`        Explanation: ${match.explanation}`);
            console.log(`        Reasoning: ${match.reasoningFactors?.join(', ')}`);
          }
        });
        
        // Analysis
        const topMatch = results.careerMatches[0];
        console.log('\n📊 ANALYSIS:');
        if (topMatch.career.title === 'Aerospace Engineer') {
          console.log('   ✅ SUCCESS: Aerospace Engineer is the top match!');
        } else if (topMatch.career.title === 'Hotel Front Desk Clerk') {
          console.log('   🏨 BUG: Hotel Front Desk Clerk is top match - this is wrong!');
          console.log('   🔍 This suggests category matching or fallback logic is interfering');
        } else if (topMatch.career.title === 'Photographer') {
          console.log('   📸 BUG: Photographer is top match - original bug still exists!');
        } else {
          console.log(`   ⚠️  Unexpected top match: ${topMatch.career.title}`);
        }
        
        // Check if Aerospace Engineer exists anywhere in results
        const aerospaceMatch = results.careerMatches.find(m => m.career.title === 'Aerospace Engineer');
        if (aerospaceMatch) {
          const position = results.careerMatches.findIndex(m => m.career.title === 'Aerospace Engineer') + 1;
          console.log(`   🚀 Aerospace Engineer found at position ${position}`);
        } else {
          console.log('   🚨 CRITICAL: Aerospace Engineer NOT FOUND in any results!');
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

testAerospaceDebugFocused();