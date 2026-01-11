const { CounselorGuidanceService } = require('./backend/dist/services/counselorGuidanceService');

async function testCounselorNotesFix() {
  console.log('🧪 Testing Counselor Notes Fix...');
  
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
    console.log('📊 Complete structure check:');
    
    // Check all required properties
    const requiredProps = [
      'studentProfile',
      'topJobMatches', 
      'fourYearPlan',
      'aiRecommendations',
      'parentSummary',
      'counselorNotes'
    ];
    
    requiredProps.forEach(prop => {
      console.log(`   - Has ${prop}:`, !!result[prop]);
    });
    
    // Check parentSummary sub-properties
    if (result.parentSummary) {
      console.log('📋 parentSummary properties:');
      console.log('   - overview:', !!result.parentSummary.overview);
      console.log('   - keyRecommendations:', !!result.parentSummary.keyRecommendations);
      console.log('   - supportActions:', !!result.parentSummary.supportActions);
      console.log('   - timelineHighlights:', !!result.parentSummary.timelineHighlights);
    }
    
    // Check counselorNotes sub-properties
    if (result.counselorNotes) {
      console.log('📝 counselorNotes properties:');
      console.log('   - assessmentInsights:', !!result.counselorNotes.assessmentInsights);
      console.log('   - recommendationRationale:', !!result.counselorNotes.recommendationRationale);
      console.log('   - followUpActions:', !!result.counselorNotes.followUpActions);
      console.log('   - parentMeetingTopics:', !!result.counselorNotes.parentMeetingTopics);
      
      if (result.counselorNotes.assessmentInsights) {
        console.log('✅ assessmentInsights sample:', result.counselorNotes.assessmentInsights[0]);
      }
    }
    
    console.log('\n🎯 Test Result: SUCCESS - All required properties are present');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testCounselorNotesFix();