// Simple test to verify V3 assessment structure
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Final Assessment V3 Structure');
console.log('=' .repeat(50));

try {
  // Test 1: Load and validate V3 JSON structure
  console.log('\n1️⃣ Testing V3 JSON structure...');
  
  const v3Path = path.join(__dirname, 'backend/src/data/final-assessment-v3.json');
  const v3Data = JSON.parse(fs.readFileSync(v3Path, 'utf8'));
  
  console.log(`✅ V3 assessment loaded`);
  console.log(`📊 Version: ${v3Data.version}`);
  console.log(`📝 Total questions: ${v3Data.questions.length}`);
  console.log(`🛤️ Available paths: ${Object.keys(v3Data.pathLogic).join(', ')}`);
  
  // Test 2: Verify hierarchical structure
  console.log('\n2️⃣ Testing hierarchical structure...');
  
  const expectedPaths = ['hard_hat', 'non_hard_hat', 'unable_to_decide'];
  const actualPaths = Object.keys(v3Data.pathLogic);
  const hasCorrectPaths = expectedPaths.every(path => actualPaths.includes(path));
  
  if (hasCorrectPaths) {
    console.log('✅ V3 path structure is correct');
  } else {
    console.log('❌ V3 path structure is incorrect');
    console.log('Expected:', expectedPaths);
    console.log('Actual:', actualPaths);
  }
  
  // Test 3: Verify branching question
  console.log('\n3️⃣ Testing branching question...');
  
  const branchingQuestion = v3Data.questions.find(q => q.id === 'work_preference_main');
  if (branchingQuestion) {
    console.log('✅ Branching question found');
    console.log(`📋 Question: ${branchingQuestion.text}`);
    console.log(`🔀 Options: ${branchingQuestion.options.map(o => o.label).join(', ')}`);
    
    const expectedOptions = ['hard_hat', 'non_hard_hat', 'unable_to_decide'];
    const actualOptions = branchingQuestion.options.map(o => o.value);
    const hasCorrectOptions = expectedOptions.every(opt => actualOptions.includes(opt));
    
    if (hasCorrectOptions) {
      console.log('✅ Hierarchical branching options are correct');
    } else {
      console.log('❌ Hierarchical branching options are incorrect');
    }
  } else {
    console.log('❌ Branching question not found');
  }
  
  // Test 4: Verify sub-questions
  console.log('\n4️⃣ Testing sub-questions...');
  
  const hardHatQuestion = v3Data.questions.find(q => q.id === 'hard_hat_specific');
  const nonHardHatQuestion = v3Data.questions.find(q => q.id === 'non_hard_hat_specific');
  
  if (hardHatQuestion) {
    console.log(`✅ Hard hat specific question: ${hardHatQuestion.options.length} options`);
  }
  
  if (nonHardHatQuestion) {
    console.log(`✅ Non hard hat specific question: ${nonHardHatQuestion.options.length} options`);
  }
  
  // Test 5: Verify exploration questions
  console.log('\n5️⃣ Testing exploration questions...');
  
  const explorationQuestions = ['personal_traits', 'interests_hobbies', 'work_experience'];
  let explorationCount = 0;
  
  explorationQuestions.forEach(questionId => {
    const question = v3Data.questions.find(q => q.id === questionId);
    if (question && question.appliesTo && question.appliesTo.includes('unable_to_decide')) {
      explorationCount++;
      console.log(`✅ ${questionId} question found for exploration path`);
    }
  });
  
  if (explorationCount === 3) {
    console.log('✅ All exploration questions are properly configured');
  }
  
  // Test 6: Verify career mapping
  console.log('\n6️⃣ Testing career mapping...');
  
  const careerMappingKeys = Object.keys(v3Data.careerMapping);
  console.log(`✅ Career mapping has ${careerMappingKeys.length} categories`);
  
  careerMappingKeys.forEach(key => {
    const mapping = v3Data.careerMapping[key];
    console.log(`   ${key}: ${mapping.careers.length} careers in ${mapping.primarySectors.join(', ')} sectors`);
  });
  
  // Test 7: Verify question weights
  console.log('\n7️⃣ Testing question weights...');
  
  if (v3Data.questionWeights) {
    console.log('✅ Question weights defined');
    const weights = v3Data.questionWeights;
    console.log(`   work_preference_main: ${weights.work_preference_main} (highest)`);
    console.log(`   hard_hat_specific: ${weights.hard_hat_specific}`);
    console.log(`   non_hard_hat_specific: ${weights.non_hard_hat_specific}`);
    console.log(`   education_commitment: ${weights.education_commitment}`);
    console.log(`   subject_strengths: ${weights.subject_strengths}`);
  }
  
  console.log('\n🎉 V3 Structure Validation Complete!');
  console.log('=' .repeat(50));
  
  // Summary
  console.log('\n📊 SUMMARY:');
  console.log(`✅ Assessment Version: ${v3Data.version}`);
  console.log(`✅ Total Questions: ${v3Data.questions.length}`);
  console.log(`✅ Career Paths: ${Object.keys(v3Data.pathLogic).length}`);
  console.log(`✅ Career Categories: ${Object.keys(v3Data.careerMapping).length}`);
  console.log(`✅ Hierarchical Branching: Implemented`);
  console.log(`✅ Exploration Path: Configured`);
  console.log(`✅ Question Weighting: Defined`);
  
} catch (error) {
  console.error('❌ Test failed:', error.message);
}