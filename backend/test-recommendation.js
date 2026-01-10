// Simple test script for the recommendation engine
const { RecommendationEngine } = require('./dist/services/recommendationEngine');

// Test student profile
const testProfile = {
  grade: 11,
  zipCode: '12345',
  workEnvironment: ['Indoors (offices, hospitals, schools)', 'A mix of indoor and outdoor work'],
  workStyle: ['Helping people directly', 'Working with computers or technology'],
  thinkingStyle: ['Helping people overcome challenges', 'Understanding how systems or machines work'],
  educationWillingness: '2–4 years (college or technical school)',
  academicInterests: ['Math', 'Science (Biology, Chemistry, Physics)', 'Technology / Computer Science'],
  academicPerformance: {
    'Math': 'Good',
    'Science (Biology, Chemistry, Physics)': 'Excellent',
    'Technology / Computer Science': 'Good',
    'English / Language Arts': 'Average'
  },
  interests: 'I love helping people and am fascinated by how technology can improve healthcare',
  experience: 'Volunteered at local hospital for 6 months, helped with patient transport and basic tasks',
  traits: ['Compassionate and caring', 'Analytical and logical', 'Patient and persistent'],
  otherTraits: '',
  incomeImportance: 'Somewhat important',
  stabilityImportance: 'Very important',
  helpingImportance: 'Very important',
  constraints: ['Stay close to home'],
  decisionPressure: 'Want to narrow this year',
  riskTolerance: 'Prefer stability',
  supportLevel: 'Some support available',
  careerConfidence: 'Somewhat confident',
  impactStatement: 'I want to make a difference in people\'s lives through healthcare',
  inspiration: 'My grandmother\'s nurse who was so caring during her illness'
};

console.log('🧪 Testing Recommendation Engine...\n');

try {
  const recommendations = RecommendationEngine.generateRecommendations(testProfile);
  
  console.log('✅ Test completed successfully!\n');
  
  console.log('📊 Results Summary:');
  console.log('==================');
  console.log(`Student: Grade ${recommendations.student_profile_summary.grade}`);
  console.log(`Readiness: ${recommendations.student_profile_summary.readiness_level}`);
  console.log(`Key Strengths: ${recommendations.student_profile_summary.key_strengths.join(', ')}`);
  console.log(`Primary Interests: ${recommendations.student_profile_summary.primary_interests.join(', ')}\n`);
  
  console.log('🏆 Top 3 Clusters:');
  recommendations.top_clusters.forEach((cluster, i) => {
    console.log(`${i + 1}. ${cluster.name} (${cluster.score}%)`);
  });
  console.log('');
  
  console.log('🎯 Best Fit Careers:');
  recommendations.career_recommendations.best_fit.forEach((rec, i) => {
    console.log(`${i + 1}. ${rec.career.name} (${rec.score}% match)`);
    console.log(`   Education: ${rec.career.edu_required_level === 0 ? 'High School' : 
                                rec.career.edu_required_level === 1 ? 'Certificate/Apprenticeship' :
                                rec.career.edu_required_level === 2 ? 'Associate Degree' : 'Bachelor\'s+'}`);
    console.log(`   Time to Entry: ${rec.career.time_to_entry_years} years`);
    if (rec.feasibility_notes) {
      console.log(`   Notes: ${rec.feasibility_notes.join(', ')}`);
    }
  });
  console.log('');
  
  console.log('🔄 Good Fit Careers:');
  recommendations.career_recommendations.good_fit.slice(0, 3).forEach((rec, i) => {
    console.log(`${i + 1}. ${rec.career.name} (${rec.score}% match)`);
  });
  console.log('');
  
  console.log('🚀 Stretch Options:');
  recommendations.career_recommendations.stretch_options.slice(0, 2).forEach((rec, i) => {
    console.log(`${i + 1}. ${rec.career.name} (${rec.score}% match)`);
  });
  console.log('');
  
  console.log('📅 Four-Year Plan Preview:');
  if (recommendations.four_year_plan.grade_11) {
    console.log(`Grade 11 Focus: ${recommendations.four_year_plan.grade_11.focus}`);
    console.log(`Courses: ${recommendations.four_year_plan.grade_11.courses.slice(0, 3).join(', ')}...`);
  }
  console.log(`Post-Graduation: ${recommendations.four_year_plan.post_graduation.education_path}`);
  console.log(`Timeline: ${recommendations.four_year_plan.post_graduation.timeline}`);
  console.log(`Estimated Cost: ${recommendations.four_year_plan.post_graduation.estimated_cost}\n`);
  
  console.log('🎯 Deterministic Test:');
  console.log('Running same input twice to verify deterministic output...');
  const recommendations2 = RecommendationEngine.generateRecommendations(testProfile);
  
  const match1 = recommendations.career_recommendations.best_fit[0];
  const match2 = recommendations2.career_recommendations.best_fit[0];
  
  if (match1?.career.name === match2?.career.name && match1?.score === match2?.score) {
    console.log('✅ PASS: Deterministic output verified');
  } else {
    console.log('❌ FAIL: Output not deterministic');
    console.log(`First run: ${match1?.career.name} (${match1?.score}%)`);
    console.log(`Second run: ${match2?.career.name} (${match2?.score}%)`);
  }
  
} catch (error) {
  console.error('❌ Test failed:', error.message);
  console.error(error.stack);
}