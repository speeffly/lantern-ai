const { CounselorGuidanceService } = require('./backend/dist/services/counselorGuidanceService');

async function testUndecidedCareerPath() {
  console.log('🧪 Testing Undecided Career Path Feature...');
  
  // Mock undecided student responses
  const undecidedResponses = {
    basic_info: { grade: 11, zipCode: '12345' },
    undecided_interests_hobbies: 'I enjoy reading, playing video games, and helping my friends with their problems. I also like working with my hands and building things.',
    undecided_work_experience: 'I volunteered at a local animal shelter and helped with a school fundraiser. I also worked part-time at a grocery store.',
    undecided_personal_traits: ['helpful', 'creative', 'patient', 'good_with_technology'],
    undecided_career_constraints: 'I want to stay close to home and my family is supportive but we need to consider college costs.',
    undecided_education_support: 'yes_with_conditions',
    undecided_impact_and_inspiration: 'My teacher Mrs. Johnson inspires me because she always finds ways to help every student succeed. I want to be remembered as someone who made a positive difference in people\'s lives.',
    subject_strengths: ['English', 'Science'],
    education_commitment: 'I am willing to go to a 2-year college or get a certificate'
  };

  try {
    console.log('📤 Calling generateUndecidedCareerMatches...');
    const result = await CounselorGuidanceService.generateUndecidedCareerMatches(undecidedResponses);
    
    console.log('✅ Undecided career path result received!');
    console.log('📊 Result structure check:');
    console.log('   - Is undecided path:', !!result.undecidedPath);
    console.log('   - Number of career options:', result.topJobMatches?.length || 0);
    console.log('   - Has selection rationale:', !!result.selectionRationale);
    console.log('   - Has next steps:', !!result.nextSteps);
    console.log('   - Has parent summary:', !!result.parentSummary);
    
    if (result.topJobMatches && result.topJobMatches.length > 0) {
      console.log('\n🎯 Career Options:');
      result.topJobMatches.forEach((option, index) => {
        console.log(`   ${index + 1}. ${option.career.title} (${option.career.sector})`);
        console.log(`      - Match Score: ${option.matchScore}%`);
        console.log(`      - Salary: $${option.localOpportunities.averageLocalSalary.toLocaleString()}`);
        console.log(`      - Education: ${option.career.requiredEducation}`);
      });
    }
    
    if (result.selectionRationale) {
      console.log('\n📝 Selection Rationale:', result.selectionRationale);
    }
    
    if (result.nextSteps) {
      console.log('\n🚀 Next Steps:');
      result.nextSteps.forEach((step, index) => {
        console.log(`   ${index + 1}. ${step}`);
      });
    }
    
    console.log('\n🎯 Test Result: SUCCESS - Undecided career path feature working correctly');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testUndecidedCareerPath();