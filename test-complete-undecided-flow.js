// Complete test of the undecided career path flow
console.log('🧪 Testing Complete Undecided Career Path Flow...');

// Step 1: Test the detection logic
function detectUndecidedPath(responses) {
  const workPreference = responses.work_preference_main || responses.q2_work_preference;
  if (workPreference === 'unable_to_decide') {
    console.log('🤔 Detected undecided path: Work preference is "unable_to_decide"');
    return true;
  }
  
  const undecidedQuestions = [
    'undecided_interests_hobbies',
    'undecided_work_experience', 
    'undecided_personal_traits',
    'undecided_career_constraints',
    'undecided_education_support',
    'undecided_impact_and_inspiration'
  ];
  
  const hasUndecidedQuestions = undecidedQuestions.some(questionId => 
    responses[questionId] !== undefined && responses[questionId] !== null && responses[questionId] !== ''
  );
  
  if (hasUndecidedQuestions) {
    console.log('🤔 Detected undecided path: Found undecided-specific questions');
    return true;
  }
  
  return false;
}

// Step 2: Mock responses that should trigger undecided path
const testResponses = {
  basic_info: { grade: 11, zipCode: '12345' },
  work_preference_main: 'unable_to_decide', // This should trigger undecided path
  subject_strengths: {
    'Math': 3,
    'Science': 4,
    'English': 3
  },
  education_commitment: 'I am willing to go to a 2-year college',
  undecided_interests_hobbies: 'I enjoy reading and helping friends',
  undecided_work_experience: 'I volunteered at an animal shelter',
  undecided_personal_traits: ['helpful', 'creative'],
  undecided_education_support: 'yes_with_conditions'
};

console.log('\n📋 Test Responses:');
console.log('   - work_preference_main:', testResponses.work_preference_main);
console.log('   - Has undecided questions:', Object.keys(testResponses).filter(key => key.startsWith('undecided_')));

// Step 3: Test detection
const isUndecided = detectUndecidedPath(testResponses);
console.log('\n🎯 Detection Result:', isUndecided ? 'UNDECIDED PATH ✅' : 'DECIDED PATH ❌');

// Step 4: Mock the expected backend response structure
const mockBackendResponse = {
  recommendations: {
    studentProfile: {
      grade: 11,
      location: '12345',
      careerReadiness: 'Exploring Options',
      pathType: 'undecided'
    },
    topJobMatches: [
      {
        career: {
          id: 'healthcare-option',
          title: 'Healthcare Professional',
          sector: 'healthcare',
          averageSalary: 55000
        },
        matchScore: 85,
        matchReasons: ['Based on your interest in helping others']
      },
      {
        career: {
          id: 'technology-option', 
          title: 'Technology Specialist',
          sector: 'technology',
          averageSalary: 60000
        },
        matchScore: 80,
        matchReasons: ['Based on your problem-solving skills']
      },
      {
        career: {
          id: 'education-option',
          title: 'Education Professional', 
          sector: 'education',
          averageSalary: 50000
        },
        matchScore: 75,
        matchReasons: ['Based on your desire to help others learn']
      }
    ],
    selectionRationale: 'These 3 careers represent different pathways to help you explore your options',
    nextSteps: [
      'Research each career option',
      'Talk to professionals in these fields',
      'Consider job shadowing'
    ],
    undecidedPath: true,
    parentSummary: {
      overview: 'Your student has been provided with 3 career options to explore'
    },
    counselorNotes: {
      assessmentInsights: ['Student took undecided path']
    }
  }
};

// Step 5: Test frontend detection logic
const frontendDetection = mockBackendResponse.recommendations?.undecidedPath || 
                         mockBackendResponse.recommendations?.studentProfile?.pathType === 'undecided' ||
                         (mockBackendResponse.recommendations?.topJobMatches?.length === 3 && 
                          mockBackendResponse.recommendations?.selectionRationale);

console.log('\n🖥️ Frontend Detection Test:');
console.log('   - undecidedPath flag:', mockBackendResponse.recommendations.undecidedPath);
console.log('   - pathType:', mockBackendResponse.recommendations.studentProfile.pathType);
console.log('   - Career count:', mockBackendResponse.recommendations.topJobMatches.length);
console.log('   - Has rationale:', !!mockBackendResponse.recommendations.selectionRationale);
console.log('   - Frontend would detect:', frontendDetection ? 'UNDECIDED PATH ✅' : 'DECIDED PATH ❌');

// Step 6: Expected UI behavior
console.log('\n🎨 Expected UI Behavior:');
if (frontendDetection) {
  console.log('   ✅ Should show "Your Career Exploration Options" header');
  console.log('   ✅ Should display UndecidedCareerOptions component');
  console.log('   ✅ Should show 3 career options in grid layout');
  console.log('   ✅ Should show selection rationale');
  console.log('   ✅ Should show next steps');
  console.log('   ✅ Should allow career selection');
} else {
  console.log('   ❌ Would show regular career matches instead');
}

// Step 7: Debugging checklist
console.log('\n🔍 Debugging Checklist:');
console.log('   1. Check browser console for backend logs');
console.log('   2. Verify work_preference_main = "unable_to_decide" in request');
console.log('   3. Check if generateUndecidedCareerMatches() is called');
console.log('   4. Verify response has undecidedPath: true');
console.log('   5. Check if UndecidedCareerOptions component renders');
console.log('   6. Verify exactly 3 career matches are returned');

console.log('\n🎯 Test Complete - If you see 1 career instead of 3:');
console.log('   - Check browser network tab for the actual API response');
console.log('   - Look for backend logs showing path detection');
console.log('   - Verify the frontend isUndecidedPath logic');
console.log('   - Check if AI parsing is working correctly');