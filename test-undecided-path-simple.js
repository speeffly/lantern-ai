const axios = require('axios');

console.log('🤔 Simple Undecided Student Test - Correct Structure');
console.log('='.repeat(50));

// Minimal test profile that follows the EXACT questionnaire structure for undecided path
const simpleUndecidedProfile = {
  // Basic info - exact structure from questionnaire
  q1_grade_zip: {
    grade: '10',
    zipCode: '12345'
  },

  // Career knowledge - "no" triggers undecided conditional questions
  q3_career_knowledge: 'no',

  // CONDITIONAL QUESTIONS for "no" path:
  
  // Traits (q10_traits from conditional questions)
  q10_traits: [
    'curious',
    'collaborative'
  ],

  // Interests text (q8_interests_text from conditional questions)
  q8_interests_text: 'I like many different things but haven\'t found my passion yet.',

  // Experience text (q9_experience_text from conditional questions)  
  q9_experience_text: 'I\'ve tried different activities but still exploring what I like.',

  // REGULAR QUESTIONS (same for all students):

  // Academic performance - exact column names from questionnaire
  q4_academic_performance: {
    'Math': 'Average',
    'Science (Biology, Chemistry, Physics)': 'Average',
    'English / Language Arts': 'Good'
  },

  // Education willingness
  q5_education_willingness: 'not_sure',

  // Constraints
  q14_constraints: [
    'no_constraints'
  ],

  // Support confidence
  q17_support_confidence: 'some_support',

  // Impact and inspiration
  q19_20_impact_inspiration: 'I want meaningful work but not sure what that means for me yet.'
};

async function testSimpleUndecided() {
  try {
    console.log('📤 Sending assessment with correct questionnaire structure...');
    console.log('🔑 Key trigger: q3_career_knowledge = "no"');
    console.log('📋 Includes conditional questions: q10_traits, q8_interests_text, q9_experience_text');
    
    const response = await axios.post('http://localhost:3001/api/counselor-assessment/submit', {
      sessionId: `simple_undecided_correct_${Date.now()}`,
      responses: simpleUndecidedProfile
    });

    if (response.data.success) {
      const rec = response.data.data.recommendations;
      
      console.log('✅ SUCCESS! Results received');
      console.log('\n📊 Quick Analysis:');
      console.log(`   Path Type: ${rec.studentProfile?.pathType || 'Not set'}`);
      console.log(`   Career Readiness: ${rec.studentProfile?.careerReadiness || 'Not set'}`);
      console.log(`   Career Options: ${rec.topJobMatches?.length || 0}`);
      console.log(`   Has Next Steps: ${rec.nextSteps ? 'Yes' : 'No'}`);
      console.log(`   Has AI Recommendations: ${rec.aiRecommendations ? 'Yes' : 'No'}`);
      
      if (rec.topJobMatches && rec.topJobMatches.length > 0) {
        console.log('\n💼 Career Options Provided:');
        rec.topJobMatches.forEach((match, i) => {
          console.log(`   ${i + 1}. ${match.career.title} (${match.career.sector})`);
        });
      }
      
      if (rec.nextSteps && rec.nextSteps.length > 0) {
        console.log('\n📋 Exploration Steps:');
        rec.nextSteps.slice(0, 3).forEach((step, i) => {
          console.log(`   ${i + 1}. ${step}`);
        });
      }
      
      console.log('\n🎯 Test Result: ' + 
        (rec.studentProfile?.pathType === 'undecided' ? 'UNDECIDED PATH TRIGGERED ✅' : 'Regular path used ⚠️'));

      console.log('\n🔍 Data Structure Verification:');
      console.log('   ✓ Used correct q1_grade_zip structure');
      console.log('   ✓ Used q3_career_knowledge = "no"');
      console.log('   ✓ Included conditional questions for undecided path');
      console.log('   ✓ Used exact academic performance column names');
        
    } else {
      console.error('❌ Failed:', response.data.error);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data?.error || error.message);
  }
}

testSimpleUndecided();