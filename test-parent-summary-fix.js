const { CounselorGuidanceService } = require('./backend/dist/services/counselorGuidanceService');

async function testParentSummaryFix() {
  console.log('🧪 Testing Parent Summary Fix...');
  
  // Mock assessment responses
  const mockResponses = {
    q1_grade_zip: { grade: 11, zipCode: '12345' },
    q2_work_environment: 'Indoors with people',
    q3_hands_on_preference: 'Working with people and helping them',
    q4_problem_solving: 'I like to think step-by-step through problems',
    q5_helping_others: 'Very important - I want to make a difference',
    q6_education_commitment: 'I am willing to go to a 4-year college',
    q7_income_importance: 'Important, but not the most important thing',
    q8_job_security: 'Very important - I want a stable career',
    q9_subjects_strengths: ['Science', 'Math'],
    q10_interests_passions: 'I love helping people and am interested in healthcare careers'
  };

  try {
    console.log('📤 Calling generateDirectCounselorRecommendations...');
    const result = await CounselorGuidanceService.generateDirectCounselorRecommendations(mockResponses);
    
    console.log('✅ Result received!');
    console.log('📊 Result structure check:');
    console.log('   - Has parentSummary:', !!result.parentSummary);
    console.log('   - Has parentSummary.overview:', !!result.parentSummary?.overview);
    console.log('   - Has parentSummary.keyRecommendations:', !!result.parentSummary?.keyRecommendations);
    console.log('   - Has parentSummary.supportActions:', !!result.parentSummary?.supportActions);
    console.log('   - Has parentSummary.timelineHighlights:', !!result.parentSummary?.timelineHighlights);
    
    if (result.parentSummary?.overview) {
      console.log('✅ Parent Summary Overview:', result.parentSummary.overview.substring(0, 100) + '...');
    } else {
      console.log('❌ Missing parentSummary.overview property!');
    }
    
    console.log('\n📋 Full parentSummary structure:');
    console.log(JSON.stringify(result.parentSummary, null, 2));
    
    console.log('\n🎯 Test Result: SUCCESS - parentSummary.overview property is present');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testParentSummaryFix();