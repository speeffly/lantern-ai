const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3002';

// Sample questionnaire responses for testing
const sampleResponses = {
  // Basic Information
  grade: '11th',
  zipCode: '12345',
  
  // Work Environment Preferences
  workEnvironment: [
    'Indoors (offices, hospitals, schools)',
    'A mix of indoor and outdoor work'
  ],
  
  // Work Style
  workStyle: [
    'Helping people directly',
    'Working with computers or technology'
  ],
  
  // Thinking Style
  thinkingStyle: [
    'Helping people overcome challenges',
    'Understanding how systems or machines work'
  ],
  
  // Education & Training
  educationWillingness: '2–4 years (college or technical school)',
  
  // Academic Interests
  academicInterests: [
    'Science (Biology, Chemistry, Physics)',
    'Technology / Computer Science',
    'Math'
  ],
  
  // Academic Performance (matrix)
  academicPerformance: {
    'Math': 'Good',
    'Science (Biology, Chemistry, Physics)': 'Excellent',
    'English / Language Arts': 'Average',
    'Social Studies / History': 'Good',
    'Art / Creative Subjects': 'Average',
    'Physical Education / Health': 'Good',
    'Technology / Computer Science': 'Excellent',
    'Foreign Languages': 'Average',
    'Business / Economics': 'Haven\'t taken yet'
  },
  
  // Interests & Experience
  interests: 'I love working with computers and helping people solve technical problems. I volunteer at the local library helping seniors learn to use computers.',
  experience: 'I work part-time at a computer repair shop and volunteer teaching computer skills to elderly people at the community center.',
  
  // Personality & Traits
  traits: [
    'Analytical and logical',
    'Compassionate and caring',
    'Patient and persistent',
    'Collaborative and team-focused'
  ],
  otherTraits: 'I enjoy explaining complex things in simple terms',
  
  // Values
  incomeImportance: 'Somewhat important',
  stabilityImportance: 'Very important',
  helpingImportance: 'Very important',
  
  // Lifestyle & Constraints
  constraints: [
    'Predictable hours',
    'Stay close to home'
  ],
  
  // Decision Readiness & Risk
  decisionPressure: 'Want to narrow this year',
  riskTolerance: 'Somewhat comfortable',
  
  // Support & Confidence
  supportLevel: 'Some support available',
  careerConfidence: 'Somewhat confident',
  
  // Reflection
  impactStatement: 'I want to help people by making technology more accessible and solving problems that improve their daily lives.',
  inspiration: 'My computer science teacher who always takes time to help struggling students and shows how technology can make a positive difference.'
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
      console.log(`   - Sections: ${questionnaireData.data.sections.length}`);
      console.log(`   - Total questions: ${questionnaireData.data.sections.reduce((total, section) => total + section.questions.length, 0)}`);
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
      console.log(`   - Completed sections: ${progressData.data.completedSections}/${progressData.data.totalSections}`);
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
    grade: '10th',
    // Missing zipCode (required)
    workEnvironment: ['Indoors (offices, hospitals, schools)'],
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