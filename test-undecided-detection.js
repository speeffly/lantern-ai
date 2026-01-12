// Test script to verify undecided path detection
const testResponses = {
  basic_info: { grade: 11, zipCode: '12345' },
  work_preference_main: 'unable_to_decide',
  subject_strengths: {
    'Math': 3,
    'Science': 4,
    'English': 3,
    'History': 2,
    'Art': 4
  },
  education_commitment: 'I am willing to go to a 2-year college or get a certificate',
  undecided_interests_hobbies: 'I enjoy reading, playing video games, and helping my friends with their problems.',
  undecided_work_experience: 'I volunteered at a local animal shelter and helped with a school fundraiser.',
  undecided_personal_traits: ['helpful', 'creative', 'patient'],
  undecided_education_support: 'yes_with_conditions',
  undecided_impact_and_inspiration: 'My teacher inspires me because she helps everyone succeed. I want to make a positive difference.'
};

console.log('🧪 Testing Undecided Path Detection...');
console.log('📋 Test Responses:');
console.log(JSON.stringify(testResponses, null, 2));

// Simulate the detection logic
function detectUndecidedPath(responses) {
  // Primary check: Look for "unable_to_decide" in work preference
  const workPreference = responses.work_preference_main || responses.q2_work_preference;
  if (workPreference === 'unable_to_decide') {
    console.log('🤔 Detected undecided path: Work preference is "unable_to_decide"');
    return true;
  }
  
  // Check for undecided-specific question responses
  const undecidedQuestions = [
    'undecided_interests_hobbies',
    'undecided_work_experience', 
    'undecided_personal_traits',
    'undecided_career_constraints',
    'undecided_education_support',
    'undecided_impact_and_inspiration'
  ];
  
  // If any undecided-specific questions are answered, student is on undecided path
  const hasUndecidedQuestions = undecidedQuestions.some(questionId => 
    responses[questionId] !== undefined && responses[questionId] !== null && responses[questionId] !== ''
  );
  
  if (hasUndecidedQuestions) {
    console.log('🤔 Detected undecided path: Found undecided-specific questions');
    return true;
  }
  
  console.log('✅ Detected decided path: Student has clear preferences');
  return false;
}

const isUndecided = detectUndecidedPath(testResponses);
console.log('\n🎯 Detection Result:', isUndecided ? 'UNDECIDED PATH' : 'DECIDED PATH');

if (isUndecided) {
  console.log('✅ SUCCESS: Correctly detected undecided path');
  console.log('   - Should trigger generateUndecidedCareerMatches()');
  console.log('   - Should return exactly 3 career options');
  console.log('   - Should display UndecidedCareerOptions component');
} else {
  console.log('❌ FAILURE: Should have detected undecided path');
  console.log('   - Work preference:', testResponses.work_preference_main);
  console.log('   - Has undecided questions:', Object.keys(testResponses).filter(key => key.startsWith('undecided_')));
}

console.log('\n📊 Frontend Detection Logic Test:');
const mockResults = {
  recommendations: {
    undecidedPath: isUndecided,
    studentProfile: { pathType: isUndecided ? 'undecided' : 'decided' },
    topJobMatches: isUndecided ? [{}, {}, {}] : [{}], // 3 vs 1 career
    selectionRationale: isUndecided ? 'Test rationale' : undefined
  }
};

const frontendDetection = mockResults.recommendations?.undecidedPath || 
                         mockResults.recommendations?.studentProfile?.pathType === 'undecided' ||
                         (mockResults.recommendations?.topJobMatches?.length === 3 && 
                          mockResults.recommendations?.selectionRationale);

console.log('Frontend would detect:', frontendDetection ? 'UNDECIDED PATH' : 'DECIDED PATH');
console.log('Career matches count:', mockResults.recommendations.topJobMatches.length);