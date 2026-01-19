const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3002';

// Sample questionnaire responses for testing (using new question IDs)
const sampleResponses = {
  // Basic Information
  q1_grade: '11',
  q2_zip: '12345',
  
  // Work Environment Preferences
  q3_work_environment: ['indoors', 'mixed'],
  
  // Work Style
  q4_work_style: ['helping', 'technology'],
  
  // Thinking Style
  q5_thinking_style: ['helping_challenges', 'systems'],
  
  // Education & Training
  q6_education_willingness: '2–4 years (college or technical school)',
  
  // Academic Interests
  q7_academic_interests: ['Science', 'Technology / Computer Science', 'Math'],
  
  // Academic Performance (matrix)
  q8_academic_performance: {
    'Math': 'Good',
    'Science': 'Excellent',
    'English / Language Arts': 'Average',
    'Social Studies / History': 'Good',
    'Art / Creative Subjects': 'Average',
    'Physical Education / Health': 'Good',
    'Technology / Computer Science': 'Excellent',
    'Foreign Languages': 'Average',
    'Business / Economics': 'Haven\'t taken yet'
  },
  
  // Interests & Experience
  q9_interests_text: 'I love working with computers and helping people solve technical problems. I volunteer at the local library helping seniors learn to use computers.',
  q10_experience_text: 'I work part-time at a computer repair shop and volunteer teaching computer skills to elderly people at the community center.',
  
  // Personality & Traits
  q11_traits: ['analytical', 'compassionate', 'patient', 'collaborative'],
  
  // Values
  q12_income_importance: 'Somewhat important',
  q13_stability_importance: 'Very important',
  q14_helping_importance: 'Very important',
  
  // Lifestyle & Constraints
  q15_constraints: ['Predictable hours', 'Stay close to home'],
  
  // Decision Readiness & Risk
  q16_decision_urgency: 'I want to narrow things down this year',
  q17_risk_tolerance: 'Somewhat comfortable',
  
  // Support & Confidence
  q18_support_confidence: 'Some support',
  q19_career_confidence: 'Somewhat confident',
  
  // Reflection
  q20_impact_text: 'I want to help people by making technology more accessible and solving problems that improve their daily lives.',
  q21_inspiration_text: 'My computer science teacher who always takes time to help struggling students and shows how technology can make a positive difference.'
};

async function testQuestionnaireAPI() {
  console.log('🧪 Testing Questionnaire API...\n');
  
  try {
    // Test 1: Get questionnaire structure
    console.log('1️⃣ Testing GET /api/questionnaire');
    const questionnaireResponse = await fetch(`${BASE_URL}/api/questionnaire`);
    const questionnaireData = await questionnaireResponse.json();
    
    if (questionnaireData.success) {
      console.log('✅ Questionnaire structure retrieved successfully');
      console.log(`   - Version: ${questionnaireData.data.version}`);
      console.log(`   - Questions: ${questionnaireData.data.questions.length}`);
    } else {
      console.log('❌ Failed to get questionnaire structure:', questionnaireData.error);
      return;
    }
    
    // Test 2: Validate responses
    console.log('\n2️⃣ Testing POST /api/questionnaire/validate');
    const validateResponse = await fetch(`${BASE_URL}/api/questionnaire/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sampleResponses)
    });
    const validateData = await validateResponse.json();
    
    if (validateData.success) {
      console.log('✅ Validation completed');
      console.log(`   - Valid: ${validateData.data.isValid}`);
      console.log(`   - Errors: ${validateData.data.errors.length}`);
      console.log(`   - Warnings: ${validateData.data.warnings.length}`);
      
      if (validateData.data.errors.length > 0) {
        console.log('   - Error details:', validateData.data.errors);
      }
      if (validateData.data.warnings.length > 0) {
        console.log('   - Warning details:', validateData.data.warnings);
      }
    } else {
      console.log('❌ Validation failed:', validateData.error);
    }
    
    // Test 3: Get progress
    console.log('\n3️⃣ Testing POST /api/questionnaire/progress');
    const progressResponse = await fetch(`${BASE_URL}/api/questionnaire/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sampleResponses)
    });
    const progressData = await progressResponse.json();
    
    if (progressData.success) {
      console.log('✅ Progress calculated successfully');
      console.log(`   - Completed questions: ${progressData.data.completedQuestions}/${progressData.data.totalQuestions}`);
      console.log(`   - Percent complete: ${progressData.data.percentComplete}%`);
    } else {
      console.log('❌ Progress calculation failed:', progressData.error);
    }
    
    // Test 4: Generate summary
    console.log('\n4️⃣ Testing POST /api/questionnaire/summary');
    const summaryResponse = await fetch(`${BASE_URL}/api/questionnaire/summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sampleResponses)
    });
    const summaryData = await summaryResponse.json();
    
    if (summaryData.success) {
      console.log('✅ Summary generated successfully');
      console.log('   - Basic info:', JSON.stringify(summaryData.data.basicInfo, null, 2));
      console.log('   - Academic interests:', summaryData.data.academics.interests);
      console.log('   - Top traits:', summaryData.data.personality.traits);
    } else {
      console.log('❌ Summary generation failed:', summaryData.error);
    }
    
    // Test 5: Submit questionnaire and get recommendations
    console.log('\n5️⃣ Testing POST /api/questionnaire/submit (Full Integration)');
    const submitResponse = await fetch(`${BASE_URL}/api/questionnaire/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sampleResponses)
    });
    const submitData = await submitResponse.json();
    
    if (submitData.success) {
      console.log('✅ Questionnaire submitted and recommendations generated!');
      
      const recommendations = submitData.data.recommendations;
      const studentProfile = submitData.data.studentProfile;
      
      console.log('\n📊 Student Profile Summary:');
      console.log(`   - Grade: ${studentProfile.grade}th`);
      console.log(`   - ZIP Code: ${studentProfile.zipCode}`);
      console.log(`   - Readiness Level: ${studentProfile.readinessLevel}`);
      console.log(`   - Key Strengths: ${studentProfile.keyStrengths.join(', ')}`);
      console.log(`   - Primary Interests: ${studentProfile.primaryInterests.join(', ')}`);
      
      console.log('\n🎯 Top Career Clusters:');
      recommendations.top_clusters.forEach((cluster, index) => {
        console.log(`   ${index + 1}. ${cluster.name} (${cluster.score}%)`);
        console.log(`      Reasoning: ${cluster.reasoning.join(', ')}`);
      });
      
      console.log('\n🌟 Best Fit Careers:');
      recommendations.career_recommendations.best_fit.forEach((career, index) => {
        console.log(`   ${index + 1}. ${career.career.name} (${career.score}%)`);
        console.log(`      Reasoning: ${career.reasoning.join(', ')}`);
        if (career.feasibility_notes) {
          console.log(`      Notes: ${career.feasibility_notes.join(', ')}`);
        }
      });
      
      console.log('\n💡 Good Fit Careers:');
      recommendations.career_recommendations.good_fit.forEach((career, index) => {
        console.log(`   ${index + 1}. ${career.career.name} (${career.score}%)`);
      });
      
      console.log('\n🚀 Stretch Options:');
      recommendations.career_recommendations.stretch_options.forEach((career, index) => {
        console.log(`   ${index + 1}. ${career.career.name} (${career.score}%)`);
      });
      
      // Test determinism - run the same request again
      console.log('\n6️⃣ Testing Determinism (Same Input → Same Output)');
      const submitResponse2 = await fetch(`${BASE_URL}/api/questionnaire/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sampleResponses)
      });
      const submitData2 = await submitResponse2.json();
      
      if (submitData2.success) {
        const rec1 = submitData.data.recommendations;
        const rec2 = submitData2.data.recommendations;
        
        // Compare top clusters
        const clustersMatch = rec1.top_clusters.every((cluster, index) => 
          cluster.cluster_id === rec2.top_clusters[index].cluster_id &&
          cluster.score === rec2.top_clusters[index].score
        );
        
        // Compare best fit careers
        const careersMatch = rec1.career_recommendations.best_fit.every((career, index) => 
          career.career.career_id === rec2.career_recommendations.best_fit[index].career.career_id &&
          career.score === rec2.career_recommendations.best_fit[index].score
        );
        
        if (clustersMatch && careersMatch) {
          console.log('✅ DETERMINISM TEST PASSED - Same input produces identical output');
        } else {
          console.log('❌ DETERMINISM TEST FAILED - Output differs between runs');
        }
      } else {
        console.log('❌ Second submission failed:', submitData2.error);
      }
      
    } else {
      console.log('❌ Questionnaire submission failed:', submitData.error);
      if (submitData.details) {
        console.log('   - Details:', submitData.details);
      }
    }
    
    console.log('\n🎉 Questionnaire API testing completed!');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Test with incomplete responses to verify validation
async function testValidation() {
  console.log('\n🔍 Testing Validation with Incomplete Responses...\n');
  
  const incompleteResponses = {
    q1_grade: '10',
    // Missing q2_zip (required)
    q3_work_environment: ['indoors'],
    // Missing other required fields
  };
  
  try {
    const validateResponse = await fetch(`${BASE_URL}/api/questionnaire/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(incompleteResponses)
    });
    const validateData = await validateResponse.json();
    
    if (validateData.success) {
      console.log('✅ Validation with incomplete data:');
      console.log(`   - Valid: ${validateData.data.isValid}`);
      console.log(`   - Errors: ${validateData.data.errors.length}`);
      console.log(`   - Error messages:`, validateData.data.errors);
    }
    
    // Try to submit incomplete responses
    const submitResponse = await fetch(`${BASE_URL}/api/questionnaire/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(incompleteResponses)
    });
    const submitData = await submitResponse.json();
    
    if (!submitData.success) {
      console.log('✅ Incomplete submission properly rejected');
      console.log(`   - Error: ${submitData.error}`);
    } else {
      console.log('❌ Incomplete submission should have been rejected');
    }
    
  } catch (error) {
    console.error('❌ Validation test failed:', error.message);
  }
}

// Run tests
if (require.main === module) {
  console.log('🚀 Starting Questionnaire API Tests...\n');
  
  testQuestionnaireAPI()
    .then(() => testValidation())
    .then(() => {
      console.log('\n✅ All tests completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Tests failed:', error);
      process.exit(1);
    });
}