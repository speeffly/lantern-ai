const axios = require('axios');

const API_BASE = process.env.API_URL || 'http://localhost:3001';

async function testFinalAssessmentV3() {
  console.log('🧪 Testing Final Assessment V3 Structure');
  console.log('=' .repeat(50));

  try {
    // Test 1: Get assessment structure
    console.log('\n1️⃣ Testing assessment structure retrieval...');
    const assessmentResponse = await axios.get(`${API_BASE}/api/assessment/v2`);
    
    if (assessmentResponse.data.success) {
      const assessment = assessmentResponse.data.data;
      console.log('✅ Assessment structure loaded');
      console.log(`📊 Version: ${assessment.version}`);
      console.log(`📝 Total questions: ${assessment.questions.length}`);
      console.log(`🛤️ Available paths: ${Object.keys(assessment.pathLogic).join(', ')}`);
      
      // Verify v3 structure
      const expectedPaths = ['hard_hat', 'non_hard_hat', 'unable_to_decide'];
      const actualPaths = Object.keys(assessment.pathLogic);
      const hasCorrectPaths = expectedPaths.every(path => actualPaths.includes(path));
      
      if (hasCorrectPaths) {
        console.log('✅ V3 path structure is correct');
      } else {
        console.log('❌ V3 path structure is incorrect');
        console.log('Expected:', expectedPaths);
        console.log('Actual:', actualPaths);
      }
    }

    // Test 2: Get branching question
    console.log('\n2️⃣ Testing branching question...');
    const branchingResponse = await axios.get(`${API_BASE}/api/assessment/v2/branching`);
    
    if (branchingResponse.data.success) {
      const branchingQuestion = branchingResponse.data.data;
      console.log('✅ Branching question loaded');
      console.log(`📋 Question: ${branchingQuestion.text}`);
      console.log(`🔀 Options: ${branchingQuestion.options.map(o => o.label).join(', ')}`);
      
      // Verify hierarchical options
      const expectedOptions = ['hard_hat', 'non_hard_hat', 'unable_to_decide'];
      const actualOptions = branchingQuestion.options.map(o => o.value);
      const hasCorrectOptions = expectedOptions.every(opt => actualOptions.includes(opt));
      
      if (hasCorrectOptions) {
        console.log('✅ Hierarchical branching options are correct');
      } else {
        console.log('❌ Hierarchical branching options are incorrect');
      }
    }

    // Test 3: Test path determination for each option
    console.log('\n3️⃣ Testing path determination...');
    
    const testCases = [
      { preference: 'hard_hat', expectedPath: 'hard_hat' },
      { preference: 'non_hard_hat', expectedPath: 'non_hard_hat' },
      { preference: 'unable_to_decide', expectedPath: 'unable_to_decide' }
    ];

    for (const testCase of testCases) {
      const pathResponse = await axios.post(`${API_BASE}/api/assessment/v2/determine-path`, {
        workPreference: testCase.preference
      });

      if (pathResponse.data.success) {
        const selectedPath = pathResponse.data.data.selectedPath;
        if (selectedPath === testCase.expectedPath) {
          console.log(`✅ ${testCase.preference} → ${selectedPath} (correct)`);
        } else {
          console.log(`❌ ${testCase.preference} → ${selectedPath} (expected ${testCase.expectedPath})`);
        }
      }
    }

    // Test 4: Get questions for each path
    console.log('\n4️⃣ Testing path-specific questions...');
    
    for (const path of ['hard_hat', 'non_hard_hat', 'unable_to_decide']) {
      const questionsResponse = await axios.get(`${API_BASE}/api/assessment/v2/questions/${path}`);
      
      if (questionsResponse.data.success) {
        const pathData = questionsResponse.data.data;
        console.log(`✅ ${path}: ${pathData.questions.length} questions`);
        console.log(`   Focus areas: ${pathData.pathConfig.focusAreas.join(', ')}`);
        
        // Verify path-specific questions are included
        const questionIds = pathData.questions.map(q => q.id);
        
        if (path === 'hard_hat' && questionIds.includes('hard_hat_specific')) {
          console.log('   ✅ Hard hat specific question included');
        } else if (path === 'non_hard_hat' && questionIds.includes('non_hard_hat_specific')) {
          console.log('   ✅ Non hard hat specific question included');
        } else if (path === 'unable_to_decide' && questionIds.includes('personal_traits')) {
          console.log('   ✅ Exploration questions included');
        }
      }
    }

    // Test 5: Test complete assessment submission
    console.log('\n5️⃣ Testing assessment submission...');
    
    // Test hard hat path
    const hardHatResponses = {
      basic_info: { grade: '11', zipCode: '12345' },
      work_preference_main: 'hard_hat',
      hard_hat_specific: 'building_fixing',
      subject_strengths: {
        math: 'good',
        science: 'excellent',
        technology: 'good'
      },
      education_commitment: 'certificate',
      career_constraints: '',
      education_support: 'strong_support',
      impact_and_inspiration: 'I want to build things that help people and make communities better.'
    };

    const submissionResponse = await axios.post(`${API_BASE}/api/assessment/v2/submit`, {
      responses: hardHatResponses,
      path: 'hard_hat'
    });

    if (submissionResponse.data.success) {
      const results = submissionResponse.data.data;
      console.log('✅ Hard hat assessment submission successful');
      console.log(`📊 Assessment version: ${results.assessmentVersion}`);
      console.log(`🛤️ Path taken: ${results.pathTaken}`);
      console.log(`🎯 Primary matches: ${results.careerMatches?.primaryMatches?.length || 0}`);
      console.log(`👤 Student profile created: ${results.studentProfile?.workPreference}`);
      
      if (results.assessmentVersion === 'v3') {
        console.log('✅ V3 assessment version confirmed');
      }
    }

    // Test 6: Test validation
    console.log('\n6️⃣ Testing response validation...');
    
    const validationResponse = await axios.post(`${API_BASE}/api/assessment/v2/validate`, {
      responses: hardHatResponses,
      path: 'hard_hat'
    });

    if (validationResponse.data.success) {
      const validation = validationResponse.data.data;
      console.log(`✅ Validation completed: ${validation.isValid ? 'Valid' : 'Invalid'}`);
      if (validation.errors.length > 0) {
        console.log(`❌ Errors: ${validation.errors.join(', ')}`);
      }
      if (validation.warnings.length > 0) {
        console.log(`⚠️ Warnings: ${validation.warnings.join(', ')}`);
      }
    }

    console.log('\n🎉 Final Assessment V3 testing completed!');
    console.log('=' .repeat(50));

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testFinalAssessmentV3();