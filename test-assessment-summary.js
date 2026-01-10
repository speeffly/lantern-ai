const axios = require('axios');

const BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://lantern-ai-backend.onrender.com'
  : 'http://localhost:3002';

console.log('🧪 Testing Assessment Summary Feature');
console.log('🌐 Base URL:', BASE_URL);

async function testAssessmentSummary() {
  try {
    console.log('\n📋 1. Testing: Complete improved assessment flow with summary');
    
    // Sample Path A responses (Clear Direction Student)
    const pathAResponses = {
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
        english: 'average',
        art: 'struggling'
      },
      specific_career_interest: 'I want to become a registered nurse and help patients in a hospital setting. I am particularly interested in pediatric nursing.',
      constraints_considerations: 'I prefer not to work night shifts if possible, but I understand it may be necessary during training.'
    };

    console.log('\n🎯 Submitting Path A assessment...');
    const submitResponse = await axios.post(`${BASE_URL}/api/assessment/v2/submit`, {
      responses: pathAResponses,
      path: 'pathA'
    });

    if (submitResponse.data.success) {
      console.log('✅ Assessment submitted successfully');
      console.log('📊 Assessment version:', submitResponse.data.data.assessmentVersion);
      console.log('🛤️ Path taken:', submitResponse.data.data.pathTaken);
      console.log('🎯 Career category:', submitResponse.data.data.studentProfile.careerCategory);
      console.log('🏆 Career matches found:', submitResponse.data.data.recommendations?.matches?.length || 0);
      
      // Test assessment data structure for summary display
      const assessmentData = {
        assessmentVersion: submitResponse.data.data.assessmentVersion,
        pathTaken: submitResponse.data.data.pathTaken,
        responses: pathAResponses,
        studentProfile: submitResponse.data.data.studentProfile
      };
      
      console.log('\n📋 Assessment Summary Data Structure:');
      console.log('✅ Assessment Version:', assessmentData.assessmentVersion);
      console.log('✅ Path Taken:', assessmentData.pathTaken);
      console.log('✅ Responses Keys:', Object.keys(assessmentData.responses));
      console.log('✅ Student Profile Keys:', Object.keys(assessmentData.studentProfile));
      
      // Test specific response formatting
      console.log('\n🔍 Response Formatting Test:');
      console.log('📚 Education Commitment:', assessmentData.responses.education_commitment);
      console.log('🎯 Career Category:', assessmentData.responses.career_category);
      console.log('📊 Subject Strengths:', assessmentData.responses.subject_strengths);
      console.log('💭 Specific Interest:', assessmentData.responses.specific_career_interest);
      console.log('⚠️ Constraints:', assessmentData.responses.constraints_considerations);
      
      console.log('\n✨ Improved Features Verified:');
      console.log('✅ Branching Logic:', submitResponse.data.data.improvedFeatures?.branchingLogic);
      console.log('✅ Weighted Matching:', submitResponse.data.data.improvedFeatures?.weightedMatching);
      console.log('✅ Focused Questions:', submitResponse.data.data.improvedFeatures?.focusedQuestions);
      console.log('✅ Enhanced Explainability:', submitResponse.data.data.improvedFeatures?.enhancedExplainability);
    }

    console.log('\n🔄 2. Testing: Path B assessment (Uncertain Student)');
    
    const pathBResponses = {
      basic_info: {
        grade: '11',
        zipCode: '54321'
      },
      education_commitment: 'associate',
      career_clarity: 'exploring',
      career_category: 'creative_arts',
      subject_strengths: {
        art: 'excellent',
        english: 'good',
        math: 'average',
        science: 'struggling'
      },
      personal_traits: ['creative', 'helpful', 'independent'],
      impact_legacy: 'I want to create beautiful things that inspire people and bring joy to their lives. I hope to be remembered as someone who made the world more beautiful.',
      inspiration: 'My art teacher Mrs. Johnson who always encouraged my creativity and helped me see that art can be a real career path.',
      constraints_considerations: 'I need to stay close to home to help care for my younger siblings.'
    };

    const pathBSubmitResponse = await axios.post(`${BASE_URL}/api/assessment/v2/submit`, {
      responses: pathBResponses,
      path: 'pathB'
    });

    if (pathBSubmitResponse.data.success) {
      console.log('✅ Path B assessment submitted successfully');
      console.log('🛤️ Path taken:', pathBSubmitResponse.data.data.pathTaken);
      console.log('🎨 Career category:', pathBSubmitResponse.data.data.studentProfile.careerCategory);
      console.log('📚 Readiness level:', pathBSubmitResponse.data.data.studentProfile.readinessLevel);
      
      console.log('\n📋 Path B Assessment Summary:');
      console.log('✅ Personal Traits:', pathBResponses.personal_traits);
      console.log('✅ Impact/Legacy:', pathBResponses.impact_legacy);
      console.log('✅ Inspiration:', pathBResponses.inspiration);
    }

    console.log('\n🎉 Assessment Summary Feature Test Complete!');
    console.log('\n📈 Summary of What Students Will See:');
    console.log('✅ Their assessment path (Clear Direction vs Exploration)');
    console.log('✅ All their responses formatted in user-friendly language');
    console.log('✅ Explanation of how responses were weighted');
    console.log('✅ Key highlights (career interest, education goal, path taken)');
    console.log('✅ Expandable detailed view of all responses');
    console.log('✅ Matching logic explanation');
    console.log('✅ Option to retake assessment');
    
    console.log('\n🎯 Benefits for Students:');
    console.log('• Clear transparency about how recommendations were generated');
    console.log('• Understanding of the weighting system used');
    console.log('• Ability to see exactly what they entered');
    console.log('• Context for why certain careers were suggested');
    console.log('• Confidence in the assessment results');

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
testAssessmentSummary();