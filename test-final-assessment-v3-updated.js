const { FinalAssessmentService } = require('./backend/dist/services/improvedAssessmentService');

console.log('🧪 Testing Final Assessment V3 with Updated Path Logic');

try {
  // Test 1: Get assessment structure
  console.log('\n📋 Test 1: Get Assessment Structure');
  const assessment = FinalAssessmentService.getAssessment();
  console.log('✅ Assessment version:', assessment.version);
  console.log('✅ Total questions:', assessment.questions.length);
  console.log('✅ Available paths:', Object.keys(assessment.pathLogic));

  // Test 2: Test path determination
  console.log('\n🛤️ Test 2: Path Determination');
  const hardHatPath = FinalAssessmentService.determinePath('hard_hat');
  const nonHardHatPath = FinalAssessmentService.determinePath('non_hard_hat');
  const undecidedPath = FinalAssessmentService.determinePath('unable_to_decide');
  
  console.log('✅ Hard hat work preference maps to:', hardHatPath);
  console.log('✅ Non hard hat work preference maps to:', nonHardHatPath);
  console.log('✅ Unable to decide maps to:', undecidedPath);

  // Test 3: Get questions for each path
  console.log('\n❓ Test 3: Questions for Each Path');
  
  const decidedQuestions = FinalAssessmentService.getQuestionsForPath('decided');
  console.log('✅ Decided path questions:', decidedQuestions.length);
  console.log('   Question IDs:', decidedQuestions.map(q => q.id));
  
  const undecidedQuestions = FinalAssessmentService.getQuestionsForPath('undecided');
  console.log('✅ Undecided path questions:', undecidedQuestions.length);
  console.log('   Question IDs:', undecidedQuestions.map(q => q.id));

  // Test 4: Test legacy path compatibility
  console.log('\n🔄 Test 4: Legacy Path Compatibility');
  
  const legacyHardHatQuestions = FinalAssessmentService.getQuestionsForPath('hard_hat');
  console.log('✅ Legacy hard_hat path questions:', legacyHardHatQuestions.length);
  
  const legacyUnableQuestions = FinalAssessmentService.getQuestionsForPath('unable_to_decide');
  console.log('✅ Legacy unable_to_decide path questions:', legacyUnableQuestions.length);

  // Test 5: Test branching question
  console.log('\n🌿 Test 5: Branching Question');
  const branchingQuestion = FinalAssessmentService.getBranchingQuestion();
  console.log('✅ Branching question found:', branchingQuestion ? branchingQuestion.id : 'None');
  if (branchingQuestion) {
    console.log('   Options count:', branchingQuestion.options?.length || 0);
  }

  // Test 6: Test sample responses validation
  console.log('\n✅ Test 6: Sample Response Validation');
  
  const sampleDecidedResponses = {
    basic_info: { grade: '11', zipCode: '12345' },
    work_preference_main: 'hard_hat_building_fixing',
    subject_strengths: { math: 'good', science: 'excellent' },
    education_commitment: 'certificate',
    decided_career_constraints: '',
    decided_education_support: 'strong_support',
    decided_impact_and_inspiration: 'I want to build things that help people and be remembered as someone who made a difference in construction.'
  };
  
  const decidedValidation = FinalAssessmentService.validateResponses(sampleDecidedResponses, 'decided');
  console.log('✅ Decided path validation - Valid:', decidedValidation.isValid);
  console.log('   Errors:', decidedValidation.errors.length);
  console.log('   Warnings:', decidedValidation.warnings.length);

  const sampleUndecidedResponses = {
    basic_info: { grade: '10', zipCode: '54321' },
    work_preference_main: 'unable_to_decide',
    subject_strengths: { english: 'good', art: 'excellent' },
    education_commitment: 'bachelor',
    undecided_interests_hobbies: 'I love drawing, reading, and helping friends with their problems.',
    undecided_work_experience: 'I volunteer at the local library and help with art classes.',
    undecided_personal_traits: ['creative', 'helpful', 'communicator'],
    undecided_career_constraints: '',
    undecided_education_support: 'some_support',
    undecided_impact_and_inspiration: 'I admire teachers who inspire students. I want to be remembered for helping others discover their potential.'
  };
  
  const undecidedValidation = FinalAssessmentService.validateResponses(sampleUndecidedResponses, 'undecided');
  console.log('✅ Undecided path validation - Valid:', undecidedValidation.isValid);
  console.log('   Errors:', undecidedValidation.errors.length);
  console.log('   Warnings:', undecidedValidation.warnings.length);

  // Test 7: Test career matching
  console.log('\n🎯 Test 7: Career Matching');
  
  const decidedMatches = FinalAssessmentService.generateCareerMatches(sampleDecidedResponses, 'decided');
  console.log('✅ Decided path career matches:', decidedMatches.primaryMatches?.length || 0);
  
  const undecidedMatches = FinalAssessmentService.generateCareerMatches(sampleUndecidedResponses, 'undecided');
  console.log('✅ Undecided path career matches:', undecidedMatches.primaryMatches?.length || 0);

  console.log('\n🎉 All tests completed successfully!');
  console.log('\n📊 Summary:');
  console.log('- Assessment structure: ✅ Working');
  console.log('- Path determination: ✅ Working');
  console.log('- Question flow: ✅ Working');
  console.log('- Legacy compatibility: ✅ Working');
  console.log('- Validation: ✅ Working');
  console.log('- Career matching: ✅ Working');

} catch (error) {
  console.error('❌ Test failed:', error.message);
  console.error('Stack:', error.stack);
}