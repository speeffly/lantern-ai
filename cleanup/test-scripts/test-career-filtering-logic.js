// Test Career Filtering Logic
// This tests the match score filtering for undecided vs decided students

// Mock career data with various match scores
const mockCareers = [
  { career: { id: 'nurse', title: 'Registered Nurse' }, matchScore: 95 },
  { career: { id: 'doctor', title: 'Doctor' }, matchScore: 92 },
  { career: { id: 'therapist', title: 'Physical Therapist' }, matchScore: 88 },
  { career: { id: 'tech', title: 'Software Developer' }, matchScore: 85 },
  { career: { id: 'teacher', title: 'Teacher' }, matchScore: 82 },
  { career: { id: 'engineer', title: 'Engineer' }, matchScore: 78 },
  { career: { id: 'business', title: 'Business Analyst' }, matchScore: 75 }
];

// Mock careers with no high matches
const mockCareersLowMatch = [
  { career: { id: 'nurse', title: 'Registered Nurse' }, matchScore: 85 },
  { career: { id: 'doctor', title: 'Doctor' }, matchScore: 82 },
  { career: { id: 'therapist', title: 'Physical Therapist' }, matchScore: 78 },
  { career: { id: 'tech', title: 'Software Developer' }, matchScore: 75 },
  { career: { id: 'teacher', title: 'Teacher' }, matchScore: 72 }
];

// Filter careers based on match scores and student type
function filterCareersByMatchScore(careers, isUndecided) {
  if (!careers || careers.length === 0) return [];

  // Sort careers by match score (highest first)
  const sortedCareers = [...careers].sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

  if (isUndecided) {
    // For undecided students: always show top 3 results (no match score filtering)
    return sortedCareers.slice(0, 3);
  } else {
    // For decided students: show all careers above 90% (up to 5), or top 3 if none above 90%
    const highMatchCareers = sortedCareers.filter(career => (career.matchScore || 0) >= 90);
    if (highMatchCareers.length > 0) {
      return highMatchCareers.slice(0, 5); // Limit to 5 even if more than 5 are above 90%
    } else {
      return sortedCareers.slice(0, 3);
    }
  }
}

// Test Cases
console.log('='.repeat(60));
console.log('CAREER FILTERING LOGIC TESTS');
console.log('='.repeat(60));

console.log('\n1. UNDECIDED STUDENTS - High Match Scenario');
console.log('Input: 7 careers, 2 above 90%');
const undecidedHighMatch = filterCareersByMatchScore(mockCareers, true);
console.log('Output:', undecidedHighMatch.length, 'careers');
console.log('Careers:', undecidedHighMatch.map(c => `${c.career.title} (${c.matchScore}%)`));
console.log('✅ Expected: 3 careers (always top 3, regardless of match scores)');

console.log('\n2. UNDECIDED STUDENTS - Low Match Scenario');
console.log('Input: 5 careers, none above 90%');
const undecidedLowMatch = filterCareersByMatchScore(mockCareersLowMatch, true);
console.log('Output:', undecidedLowMatch.length, 'careers');
console.log('Careers:', undecidedLowMatch.map(c => `${c.career.title} (${c.matchScore}%)`));
console.log('✅ Expected: 3 careers (always top 3)');

console.log('\n3. DECIDED STUDENTS - High Match Scenario');
console.log('Input: 7 careers, 2 above 90%');
const decidedHighMatch = filterCareersByMatchScore(mockCareers, false);
console.log('Output:', decidedHighMatch.length, 'careers');
console.log('Careers:', decidedHighMatch.map(c => `${c.career.title} (${c.matchScore}%)`));
console.log('✅ Expected: 2 careers (both above 90%, limited to 5 max)');

console.log('\n4. DECIDED STUDENTS - Low Match Scenario');
console.log('Input: 5 careers, none above 90%');
const decidedLowMatch = filterCareersByMatchScore(mockCareersLowMatch, false);
console.log('Output:', decidedLowMatch.length, 'careers');
console.log('Careers:', decidedLowMatch.map(c => `${c.career.title} (${c.matchScore}%)`));
console.log('✅ Expected: 3 careers (top 3)');

// Test with many high matches (for decided students limit)
const manyHighMatches = [
  { career: { id: 'c1', title: 'Career 1' }, matchScore: 98 },
  { career: { id: 'c2', title: 'Career 2' }, matchScore: 96 },
  { career: { id: 'c3', title: 'Career 3' }, matchScore: 94 },
  { career: { id: 'c4', title: 'Career 4' }, matchScore: 93 },
  { career: { id: 'c5', title: 'Career 5' }, matchScore: 92 },
  { career: { id: 'c6', title: 'Career 6' }, matchScore: 91 },
  { career: { id: 'c7', title: 'Career 7' }, matchScore: 90 }
];

console.log('\n5. DECIDED STUDENTS - Many High Matches (7 above 90%)');
console.log('Input: 7 careers, all above 90%');
const decidedManyHighMatch = filterCareersByMatchScore(manyHighMatches, false);
console.log('Output:', decidedManyHighMatch.length, 'careers');
console.log('Careers:', decidedManyHighMatch.map(c => `${c.career.title} (${c.matchScore}%)`));
console.log('✅ Expected: 5 careers (limited to 5 max for decided students)');

console.log('\n6. UNDECIDED STUDENTS - Many High Matches (7 above 90%)');
console.log('Input: 7 careers, all above 90%');
const undecidedManyHighMatch = filterCareersByMatchScore(manyHighMatches, true);
console.log('Output:', undecidedManyHighMatch.length, 'careers');
console.log('Careers:', undecidedManyHighMatch.map(c => `${c.career.title} (${c.matchScore}%)`));
console.log('✅ Expected: 3 careers (always top 3, regardless of match scores)');

console.log('\n' + '='.repeat(60));
console.log('FILTERING LOGIC SUMMARY');
console.log('='.repeat(60));
console.log('✅ Undecided Students:');
console.log('   - ALWAYS show top 3 careers (no match score filtering)');
console.log('   - Consistent experience for exploration');
console.log('✅ Decided Students:');
console.log('   - Show careers ≥90% (max 5)');
console.log('   - If none ≥90%, show top 3');
console.log('✅ All results sorted by match score (highest first)');