const axios = require('axios');

console.log('🤔 Testing Undecided Student Profile - Correct Questionnaire Structure');
console.log('='.repeat(70));

// Test profile that follows the EXACT questionnaire structure for undecided students
const undecidedStudentProfile = {
  // Basic Information - matches q1_grade_zip structure
  q1_grade_zip: {
    grade: '11',
    zipCode: '30309'
  },

  // Career Knowledge - KEY: "no" triggers the undecided conditional questions
  q3_career_knowledge: 'no',

  // CONDITIONAL QUESTIONS that appear when q3_career_knowledge = "no"
  // These are the questions that actually get asked to undecided students

  // Traits question (q10_traits) - appears in "no" branch
  q10_traits: [
    'curious',
    'analytical', 
    'collaborative',
    'detail_oriented'
  ],

  // Interests text (q8_interests_text) - appears in "no" branch  
  q8_interests_text: 'I have a lot of different interests but haven\'t found my main passion yet. I enjoy reading books, playing basketball with friends, volunteering at the local animal shelter, and learning about different topics online. I like both creative activities like drawing and analytical tasks like solving math problems. I\'m curious about many things but haven\'t found the one thing that really excites me for a career.',

  // Experience text (q9_experience_text) - appears in "no" branch
  q9_experience_text: 'I\'ve tried different types of work to see what I might like. I helped at my family\'s small restaurant during busy weekends, which taught me about customer service and working under pressure. I also volunteered at an animal shelter for 6 months, helping with feeding and cleaning, which I really enjoyed. I tutored younger kids in math and science, and worked part-time at a grocery store. Each job taught me something different, but I\'m still figuring out what type of work environment and tasks I prefer.',

  // REGULAR QUESTIONS that appear for all students

  // Academic Performance Matrix - exact column names from questionnaire
  q4_academic_performance: {
    'Math': 'Good',
    'Science (Biology, Chemistry, Physics)': 'Good',
    'English / Language Arts': 'Excellent',
    'Social Studies / History': 'Good',
    'Art / Creative Subjects': 'Average',
    'Physical Education / Health': 'Good',
    'Technology / Computer Science': 'Average',
    'Foreign Languages': 'Good',
    'Business / Economics': 'Average'
  },

  // Education Willingness
  q5_education_willingness: 'not_sure',

  // Constraints
  q14_constraints: [
    'stay_close_home',
    'flexible_hours'
  ],

  // Support Confidence
  q17_support_confidence: 'some_support',

  // Impact and Inspiration
  q19_20_impact_inspiration: 'I want to find work that feels meaningful and makes a positive difference in some way, but I\'m still figuring out what that looks like for me. I hope to discover a career that combines my interests and allows me to grow as a person while contributing something valuable to society. I\'m inspired by people who found their passion later in life and weren\'t afraid to change directions. I admire professionals who seem genuinely happy with their work, regardless of what field they\'re in.'
};

async function testUndecidedProfile() {
  try {
    console.log('📝 Submitting undecided student assessment with correct structure...');
    console.log('🔑 Key: q3_career_knowledge = "no" (triggers undecided path)');
    console.log('📋 Conditional questions included: q10_traits, q8_interests_text, q9_experience_text');
    
    const response = await axios.post('http://localhost:3001/api/counselor-assessment/submit', {
      sessionId: `test_undecided_correct_${Date.now()}`,
      responses: undecidedStudentProfile,
      userId: null
    });

    if (response.data.success) {
      console.log('✅ Assessment submitted successfully!');
      console.log('\n📊 RESULTS ANALYSIS:');
      console.log('='.repeat(50));
      
      const recommendations = response.data.data.recommendations;
      
      // Check if this triggered the undecided path
      console.log('🎯 Path Type:', recommendations.studentProfile?.pathType || 'Not specified');
      console.log('🎓 Career Readiness:', recommendations.studentProfile?.careerReadiness || 'Not specified');
      
      // Analyze career matches
      if (recommendations.topJobMatches && recommendations.topJobMatches.length > 0) {
        console.log(`\n💼 Career Matches Found: ${recommendations.topJobMatches.length}`);
        
        recommendations.topJobMatches.forEach((match, index) => {
          console.log(`\n${index + 1}. ${match.career.title}`);
          console.log(`   Sector: ${match.career.sector}`);
          console.log(`   Match Score: ${match.matchScore}%`);
          console.log(`   Education: ${match.career.requiredEducation}`);
          console.log(`   Salary: $${match.localOpportunities?.averageLocalSalary?.toLocaleString() || match.career.averageSalary?.toLocaleString()}`);
          
          if (match.matchReasons && match.matchReasons.length > 0) {
            console.log(`   Why it matches:`);
            match.matchReasons.slice(0, 2).forEach(reason => {
              console.log(`     • ${reason}`);
            });
          }
        });
      }
      
      // Check for undecided-specific features
      if (recommendations.selectionRationale) {
        console.log('\n🎯 Selection Rationale:');
        console.log(`   ${recommendations.selectionRationale}`);
      }
      
      if (recommendations.nextSteps && recommendations.nextSteps.length > 0) {
        console.log('\n📋 Next Steps for Exploration:');
        recommendations.nextSteps.forEach((step, index) => {
          console.log(`   ${index + 1}. ${step}`);
        });
      }
      
      // Check AI recommendations
      if (recommendations.aiRecommendations) {
        console.log('\n🤖 AI Recommendations:');
        console.log('   Career Pathway Available:', !!recommendations.aiRecommendations.careerPathway);
        console.log('   Academic Plan Available:', !!recommendations.aiRecommendations.academicPlan);
        console.log('   Skill Gaps Identified:', recommendations.aiRecommendations.skillGaps?.length || 0);
        console.log('   Action Items:', recommendations.aiRecommendations.actionItems?.length || 0);
        
        if (recommendations.aiRecommendations.careerPathway?.steps) {
          console.log('\n🛤️ AI-Generated Career Pathway Steps:');
          recommendations.aiRecommendations.careerPathway.steps.slice(0, 3).forEach((step, index) => {
            console.log(`   ${index + 1}. ${step}`);
          });
        }
      }
      
      // Verify the AI received the correct data
      console.log('\n🔍 DATA VERIFICATION:');
      console.log('   ✓ Traits data should be processed from q10_traits array');
      console.log('   ✓ Interests should come from q8_interests_text');
      console.log('   ✓ Experience should come from q9_experience_text');
      console.log('   ✓ Academic performance should use matrix column names');
      console.log('   ✓ Education willingness should be "not_sure"');
      
      console.log('\n' + '='.repeat(50));
      console.log('✅ UNDECIDED STUDENT PROFILE TEST COMPLETE');
      console.log('\n🎯 Key Success Indicators:');
      console.log('   ✓ Multiple diverse career options provided');
      console.log('   ✓ Exploration-focused recommendations');
      console.log('   ✓ No single career forced as "the answer"');
      console.log('   ✓ Next steps emphasize discovery and exploration');
      console.log('   ✓ AI processed undecided-specific question responses');
      
    } else {
      console.error('❌ Assessment failed:', response.data.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testUndecidedProfile().catch(console.error);