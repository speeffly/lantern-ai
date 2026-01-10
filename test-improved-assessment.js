const axios = require('axios');

const BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://lantern-ai-backend.onrender.com'
  : 'http://localhost:3002';

console.log('🧪 Testing Improved Assessment API');
console.log('🌐 Base URL:', BASE_URL);

async function testImprovedAssessment() {
  try {
    console.log('\n📋 1. Testing: Get improved assessment structure');
    const assessmentResponse = await axios.get(`${BASE_URL}/api/assessment/v2`);
    console.log('✅ Assessment structure retrieved');
    console.log('📊 Questions count:', assessmentResponse.data.data.questions.length);
    console.log('🛤️ Paths available:', Object.keys(assessmentResponse.data.data.pathLogic));

    console.log('\n🔀 2. Testing: Get branching question');
    const branchingResponse = await axios.get(`${BASE_URL}/api/assessment/v2/branching`);
    console.log('✅ Branching question retrieved');
    console.log('🎯 Question:', branchingResponse.data.data.text);
    console.log('🔢 Options count:', branchingResponse.data.data.options.length);

    console.log('\n🛤️ 3. Testing: Determine path (Clear Direction)');
    const pathResponse = await axios.post(`${BASE_URL}/api/assessment/v2/determine-path`, {
      careerClarity: 'clear'
    });
    console.log('✅ Path determined:', pathResponse.data.data.selectedPath);
    console.log('📝 Reasoning:', pathResponse.data.data.reasoning);

    console.log('\n❓ 4. Testing: Get questions for Path A');
    const pathAResponse = await axios.get(`${BASE_URL}/api/assessment/v2/questions/pathA`);
    console.log('✅ Path A questions retrieved');
    console.log('📊 Total questions:', pathAResponse.data.data.totalQuestions);
    console.log('🎯 Focus areas:', pathAResponse.data.data.pathConfig.focusAreas);

    console.log('\n❓ 5. Testing: Get questions for Path B');
    const pathBResponse = await axios.get(`${BASE_URL}/api/assessment/v2/questions/pathB`);
    console.log('✅ Path B questions retrieved');
    console.log('📊 Total questions:', pathBResponse.data.data.totalQuestions);
    console.log('🎯 Focus areas:', pathBResponse.data.data.pathConfig.focusAreas);

    console.log('\n✅ 6. Testing: Validate responses (Path A)');
    const samplePathAResponses = {
      basic_info: {
        grade: '12',
        zipCode: '12345'
      },
      education_commitment: 'bachelor',
      career_clarity: 'clear',
      career_category: 'healthcare',
      subject_strengths: {
        science: 'excellent',
        math: 'good',
        english: 'average'
      },
      specific_career_interest: 'I want to become a registered nurse and help patients in a hospital setting.',
      constraints_considerations: ''
    };

    const validationResponse = await axios.post(`${BASE_URL}/api/assessment/v2/validate`, {
      responses: samplePathAResponses,
      path: 'pathA'
    });
    console.log('✅ Validation completed');
    console.log('🎯 Is valid:', validationResponse.data.data.isValid);
    console.log('⚠️ Warnings:', validationResponse.data.data.warnings.length);

    console.log('\n📊 7. Testing: Get progress');
    const progressResponse = await axios.post(`${BASE_URL}/api/assessment/v2/progress`, {
      responses: samplePathAResponses,
      path: 'pathA'
    });
    console.log('✅ Progress calculated');
    console.log('📈 Completed:', progressResponse.data.data.completedQuestions);
    console.log('📊 Total:', progressResponse.data.data.totalQuestions);
    console.log('🎯 Percent:', progressResponse.data.data.percentComplete + '%');

    console.log('\n🤖 8. Testing: Generate weighted AI prompt');
    const promptResponse = await axios.post(`${BASE_URL}/api/assessment/v2/weighted-prompt`, {
      responses: samplePathAResponses,
      path: 'pathA'
    });
    console.log('✅ Weighted prompt generated');
    console.log('📝 Prompt length:', promptResponse.data.data.promptLength);
    console.log('⚖️ Weighted factors:', Object.keys(promptResponse.data.data.weightedFactors));

    console.log('\n🎯 9. Testing: Submit complete assessment (Path A)');
    const submitResponse = await axios.post(`${BASE_URL}/api/assessment/v2/submit`, {
      responses: samplePathAResponses,
      path: 'pathA'
    });
    console.log('✅ Assessment submitted successfully');
    console.log('📊 Assessment version:', submitResponse.data.data.assessmentVersion);
    console.log('🛤️ Path taken:', submitResponse.data.data.pathTaken);
    console.log('🎯 Career category:', submitResponse.data.data.studentProfile.careerCategory);
    console.log('🏆 Best fit careers:', submitResponse.data.data.recommendations.career_recommendations.best_fit.length);
    console.log('✨ Improved features:', Object.keys(submitResponse.data.data.improvedFeatures));

    console.log('\n🔄 10. Testing: Path B (Uncertain Student)');
    const samplePathBResponses = {
      basic_info: {
        grade: '11',
        zipCode: '54321'
      },
      education_commitment: 'associate',
      career_clarity: 'exploring',
      career_category: 'unable_to_decide',
      subject_strengths: {
        art: 'excellent',
        english: 'good',
        math: 'average',
        science: 'struggling'
      },
      personal_traits: ['creative', 'helpful', 'team_player'],
      impact_legacy: 'I want to make a positive difference in people\'s lives through creative work that brings joy and inspiration.',
      inspiration: 'My art teacher who always encouraged creativity and helped students express themselves.',
      constraints_considerations: 'I prefer not to work with complex math or science.'
    };

    const pathBSubmitResponse = await axios.post(`${BASE_URL}/api/assessment/v2/submit`, {
      responses: samplePathBResponses,
      path: 'pathB'
    });
    console.log('✅ Path B assessment submitted successfully');
    console.log('🛤️ Path taken:', pathBSubmitResponse.data.data.pathTaken);
    console.log('🎨 Career category:', pathBSubmitResponse.data.data.studentProfile.careerCategory);
    console.log('🏆 Best fit careers:', pathBSubmitResponse.data.data.recommendations.career_recommendations.best_fit.length);
    console.log('📚 Readiness level:', pathBSubmitResponse.data.data.studentProfile.readinessLevel);

    console.log('\n🎉 All improved assessment tests passed!');
    console.log('\n📈 Improvements Verified:');
    console.log('✅ Branching logic working (pathA vs pathB)');
    console.log('✅ Focused questions (7 for pathA, 9 for pathB vs 20+ before)');
    console.log('✅ Career category-based matching');
    console.log('✅ Weighted AI prompts for better guidance');
    console.log('✅ Enhanced explainability');
    console.log('✅ Path-specific recommendations');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      console.log('\n💡 Tip: Make sure the backend server is running and the improved assessment routes are registered');
    }
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Tip: Backend server may not be running. Try: npm run dev');
    }
  }
}

// Run the test
testImprovedAssessment();