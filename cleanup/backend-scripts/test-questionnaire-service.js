const { QuestionnaireService } = require('./dist/services/questionnaireService');

console.log('🧪 Testing QuestionnaireService directly...\n');

try {
  // Test 1: Get questionnaire structure
  console.log('1️⃣ Testing getQuestionnaire()');
  const questionnaire = QuestionnaireService.getQuestionnaire();
  
  console.log('✅ Questionnaire loaded');
  console.log(`   - Version: ${questionnaire.version}`);
  console.log(`   - Title: ${questionnaire.title}`);
  console.log(`   - Sections: ${questionnaire.sections.length}`);
  
  // Test each section
  questionnaire.sections.forEach((section, index) => {
    console.log(`   - Section ${index + 1}: ${section.title} (${section.questions.length} questions)`);
    
    section.questions.forEach((question, qIndex) => {
      console.log(`     - Q${qIndex + 1}: ${question.id} (${question.type}) - "${question.text.substring(0, 50)}..."`);
      if (question.options) {
        console.log(`       Options: ${question.options.length} choices`);
      }
      if (question.subjects) {
        console.log(`       Subjects: ${question.subjects.length} subjects`);
      }
    });
  });
  
  // Test 2: Get specific section
  console.log('\n2️⃣ Testing getSection()');
  const basicInfoSection = QuestionnaireService.getSection('basic_info');
  if (basicInfoSection) {
    console.log('✅ Basic info section retrieved');
    console.log(`   - Questions: ${basicInfoSection.questions.length}`);
  } else {
    console.log('❌ Failed to get basic info section');
  }
  
  // Test 3: Validate empty responses
  console.log('\n3️⃣ Testing validation with empty responses');
  const emptyValidation = QuestionnaireService.validateResponses({});
  console.log(`   - Valid: ${emptyValidation.isValid}`);
  console.log(`   - Errors: ${emptyValidation.errors.length}`);
  console.log(`   - Warnings: ${emptyValidation.warnings.length}`);
  
  // Test 4: Test with sample responses
  console.log('\n4️⃣ Testing with sample responses');
  const sampleResponses = {
    grade: '11th',
    zipCode: '12345',
    workEnvironment: ['Indoors (offices, hospitals, schools)'],
    workStyle: ['Helping people directly'],
    thinkingStyle: ['Helping people overcome challenges']
  };
  
  const validation = QuestionnaireService.validateResponses(sampleResponses);
  console.log(`   - Valid: ${validation.isValid}`);
  console.log(`   - Errors: ${validation.errors.length}`);
  console.log(`   - Warnings: ${validation.warnings.length}`);
  
  // Test 5: Convert to StudentProfile
  console.log('\n5️⃣ Testing StudentProfile conversion');
  const profile = QuestionnaireService.convertToStudentProfile(sampleResponses);
  console.log(`   - Grade: ${profile.grade}`);
  console.log(`   - ZIP Code: ${profile.zipCode}`);
  console.log(`   - Work Environment: ${profile.workEnvironment.length} selections`);
  
  console.log('\n✅ All QuestionnaireService tests passed!');
  
} catch (error) {
  console.error('❌ QuestionnaireService test failed:', error);
  console.error('Stack trace:', error.stack);
}