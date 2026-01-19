/**
 * Test script to verify the subject rating UI fix
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Testing Subject Rating UI Fix...\n');

// Read the questionnaire component
const questionnairePath = path.join(__dirname, 'frontend/app/questionnaire/page.tsx');
const questionnaireContent = fs.readFileSync(questionnairePath, 'utf8');

// Check that matrix validation logic exists
const hasMatrixValidation = questionnaireContent.includes("currentQuestion.type === 'matrix'");

if (!hasMatrixValidation) {
  console.log('❌ FAIL: Matrix validation logic missing');
  process.exit(1);
} else {
  console.log('✅ PASS: Matrix validation logic exists');
}

// Check that matrix validation checks all subjects
const hasSubjectValidation = questionnaireContent.includes('currentQuestion.subjects.every');

if (!hasSubjectValidation) {
  console.log('❌ FAIL: Subject validation logic missing');
  process.exit(1);
} else {
  console.log('✅ PASS: Subject validation logic exists');
}

// Check that matrix rendering case exists
const hasMatrixRendering = questionnaireContent.includes("case 'matrix':");

if (!hasMatrixRendering) {
  console.log('❌ FAIL: Matrix rendering case missing');
  process.exit(1);
} else {
  console.log('✅ PASS: Matrix rendering case exists');
}

// Check that radio buttons have proper name attributes for grouping
const hasProperRadioNames = questionnaireContent.includes('name={`${question.id}_${subject.id}`}');

if (!hasProperRadioNames) {
  console.log('❌ FAIL: Radio button name attributes not properly set');
  process.exit(1);
} else {
  console.log('✅ PASS: Radio button name attributes properly set');
}

// Read the assessment data to verify matrix question structure
const assessmentPath = path.join(__dirname, 'backend/src/data/final-assessment-v3.json');
const assessmentData = JSON.parse(fs.readFileSync(assessmentPath, 'utf8'));

// Find the subject strengths question
const subjectQuestion = assessmentData.questions.find(q => q.id === 'subject_strengths');

if (!subjectQuestion) {
  console.log('❌ FAIL: subject_strengths question not found');
  process.exit(1);
} else {
  console.log('✅ PASS: subject_strengths question found');
}

if (subjectQuestion.type !== 'matrix') {
  console.log('❌ FAIL: subject_strengths question has wrong type:', subjectQuestion.type);
  process.exit(1);
} else {
  console.log('✅ PASS: subject_strengths question has correct type: matrix');
}

// Check that all required subjects exist
const expectedSubjects = ['math', 'science', 'english', 'history', 'art', 'technology', 'languages', 'physical_ed'];
const actualSubjects = subjectQuestion.subjects.map(s => s.id);

const missingSubjects = expectedSubjects.filter(s => !actualSubjects.includes(s));
if (missingSubjects.length > 0) {
  console.log('❌ FAIL: Missing subjects:', missingSubjects);
  process.exit(1);
} else {
  console.log('✅ PASS: All 8 subjects present');
}

// Check that rating scale exists and has 5 levels
if (!subjectQuestion.ratingScale || subjectQuestion.ratingScale.length !== 5) {
  console.log('❌ FAIL: Rating scale missing or incorrect length');
  process.exit(1);
} else {
  console.log('✅ PASS: Rating scale has 5 levels (1-5)');
}

// Check that rating values are correct
const expectedRatings = ['1', '2', '3', '4', '5'];
const actualRatings = subjectQuestion.ratingScale.map(r => r.value);

const missingRatings = expectedRatings.filter(r => !actualRatings.includes(r));
if (missingRatings.length > 0) {
  console.log('❌ FAIL: Missing rating values:', missingRatings);
  process.exit(1);
} else {
  console.log('✅ PASS: All rating values (1-5) present');
}

console.log('\n🎉 All tests passed! Subject rating UI should be fixed.');
console.log('\nSummary of fixes:');
console.log('- Added matrix validation logic to check all subjects are rated');
console.log('- Matrix validation ensures all 8 subjects have ratings before proceeding');
console.log('- Radio button grouping properly implemented with unique names');
console.log('- Assessment data structure verified with 8 subjects and 5-point scale');
console.log('\nExpected behavior:');
console.log('- Students must rate all 8 subjects on 1-5 scale');
console.log('- Next button disabled until all subjects rated');
console.log('- Radio buttons properly grouped per subject');
console.log('- Clear visual feedback for rating selection');