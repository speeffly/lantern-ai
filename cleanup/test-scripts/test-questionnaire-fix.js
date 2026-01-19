/**
 * Test script to verify the questionnaire duplicate options fix
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Testing Questionnaire Duplicate Options Fix...\n');

// Read the questionnaire component
const questionnairePath = path.join(__dirname, 'frontend/app/questionnaire/page.tsx');
const questionnaireContent = fs.readFileSync(questionnairePath, 'utf8');

// Check for the removed duplicate rendering block
const hasOldWorkPreferenceBlock = questionnaireContent.includes('work_preference_decided') || 
                                  questionnaireContent.includes('work_preference_undecided');

if (hasOldWorkPreferenceBlock) {
  console.log('❌ FAIL: Old work preference rendering block still exists');
  process.exit(1);
} else {
  console.log('✅ PASS: Old work preference rendering block removed');
}

// Check that single_choice rendering still exists
const hasSingleChoiceRendering = questionnaireContent.includes("case 'single_choice':");

if (!hasSingleChoiceRendering) {
  console.log('❌ FAIL: Single choice rendering block missing');
  process.exit(1);
} else {
  console.log('✅ PASS: Single choice rendering block exists');
}

// Check that determinePath function was removed
const hasDeterminePathFunction = questionnaireContent.includes('const determinePath = async');

if (hasDeterminePathFunction) {
  console.log('❌ FAIL: Unused determinePath function still exists');
  process.exit(1);
} else {
  console.log('✅ PASS: Unused determinePath function removed');
}

// Read the assessment data to verify structure
const assessmentPath = path.join(__dirname, 'backend/src/data/final-assessment-v3.json');
const assessmentData = JSON.parse(fs.readFileSync(assessmentPath, 'utf8'));

// Check that work_preference_main question exists and has correct structure
const workPrefQuestion = assessmentData.questions.find(q => q.id === 'work_preference_main');

if (!workPrefQuestion) {
  console.log('❌ FAIL: work_preference_main question not found in assessment data');
  process.exit(1);
} else {
  console.log('✅ PASS: work_preference_main question found in assessment data');
}

if (workPrefQuestion.type !== 'single_choice') {
  console.log('❌ FAIL: work_preference_main question has incorrect type:', workPrefQuestion.type);
  process.exit(1);
} else {
  console.log('✅ PASS: work_preference_main question has correct type: single_choice');
}

// Check that options are not duplicated in the data
const optionValues = workPrefQuestion.options.map(opt => opt.value);
const uniqueOptionValues = [...new Set(optionValues)];

if (optionValues.length !== uniqueOptionValues.length) {
  console.log('❌ FAIL: Duplicate option values found in assessment data');
  console.log('Options:', optionValues);
  process.exit(1);
} else {
  console.log('✅ PASS: No duplicate option values in assessment data');
}

console.log('\n🎉 All tests passed! Duplicate options issue should be fixed.');
console.log('\nSummary of changes:');
console.log('- Removed duplicate work preference rendering block');
console.log('- Kept single_choice rendering for work_preference_main question');
console.log('- Removed unused determinePath function');
console.log('- Verified assessment data structure is correct');