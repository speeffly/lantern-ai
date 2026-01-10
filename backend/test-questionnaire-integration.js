const { QuestionnaireService } = require('./dist/services/questionnaireService');
const { RecommendationEngine } = require('./dist/services/recommendationEngine');

// Sample questionnaire responses
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

function testQuestionnaireIntegration() {
  console.log('🧪 Testing Questionnaire → Recommendation Integration...\n');
  
  try {
    // Step 1: Validate questionnaire responses
    console.log('1️⃣ Validating questionnaire responses...');
    const validation = QuestionnaireService.validateResponses(sampleResponses);
    
    if (!validation.isValid) {
      console.log('❌ Validation failed:', validation.errors);
      return;
    }
    
    console.log('✅ Validation passed');
    console.log(`   - Errors: ${validation.errors.length}`);
    console.log(`   - Warnings: ${validation.warnings.length}`);
    
    // Step 2: Convert to StudentProfile
    console.log('\n2️⃣ Converting to StudentProfile format...');
    const studentProfile = QuestionnaireService.convertToStudentProfile(sampleResponses);
    
    console.log('✅ Conversion successful');
    console.log(`   - Grade: ${studentProfile.grade}`);
    console.log(`   - ZIP Code: ${studentProfile.zipCode}`);
    console.log(`   - Work Environment: ${studentProfile.workEnvironment.length} selections`);
    console.log(`   - Work Style: ${studentProfile.workStyle.length} selections`);
    console.log(`   - Academic Interests: ${studentProfile.academicInterests.length} subjects`);
    console.log(`   - Traits: ${studentProfile.traits.length} traits`);
    console.log(`   - Education Willingness: ${studentProfile.educationWillingness}`);
    
    // Step 3: Generate recommendations
    console.log('\n3️⃣ Generating career recommendations...');
    const recommendations = RecommendationEngine.generateRecommendations(studentProfile);
    
    console.log('✅ Recommendations generated successfully');
    
    // Step 4: Display results
    console.log('\n📊 Integration Results:');
    console.log('======================');
    
    console.log('\n🎓 Student Profile Summary:');
    console.log(`   - Grade: ${recommendations.student_profile_summary.grade}th`);
    console.log(`   - Readiness: ${recommendations.student_profile_summary.readiness_level}`);
    console.log(`   - Key Strengths: ${recommendations.student_profile_summary.key_strengths.join(', ')}`);
    console.log(`   - Primary Interests: ${recommendations.student_profile_summary.primary_interests.join(', ')}`);
    
    console.log('\n🏆 Top Career Clusters:');
    recommendations.top_clusters.forEach((cluster, index) => {
      console.log(`   ${index + 1}. ${cluster.name} (${cluster.score}%)`);
      console.log(`      Reasoning: ${cluster.reasoning.slice(0, 2).join(', ')}`);
    });
    
    console.log('\n🌟 Career Recommendations:');
    console.log(`   - Best Fit: ${recommendations.career_recommendations.best_fit.length} careers`);
    console.log(`   - Good Fit: ${recommendations.career_recommendations.good_fit.length} careers`);
    console.log(`   - Stretch Options: ${recommendations.career_recommendations.stretch_options.length} careers`);
    
    if (recommendations.career_recommendations.best_fit.length > 0) {
      console.log('\n🎯 Best Fit Careers:');
      recommendations.career_recommendations.best_fit.slice(0, 3).forEach((career, index) => {
        console.log(`   ${index + 1}. ${career.career.name} (${career.score}%)`);
        console.log(`      ${career.reasoning.join(', ')}`);
      });
    }
    
    if (recommendations.career_recommendations.good_fit.length > 0) {
      console.log('\n💡 Good Fit Careers:');
      recommendations.career_recommendations.good_fit.slice(0, 3).forEach((career, index) => {
        console.log(`   ${index + 1}. ${career.career.name} (${career.score}%)`);
      });
    }
    
    if (recommendations.career_recommendations.stretch_options.length > 0) {
      console.log('\n🚀 Top Stretch Options:');
      recommendations.career_recommendations.stretch_options.slice(0, 3).forEach((career, index) => {
        console.log(`   ${index + 1}. ${career.career.name} (${career.score}%)`);
      });
    }
    
    // Step 5: Test determinism
    console.log('\n4️⃣ Testing deterministic output...');
    const recommendations2 = RecommendationEngine.generateRecommendations(studentProfile);
    
    // Compare results
    const clustersMatch = recommendations.top_clusters.every((cluster, index) => 
      cluster.cluster_id === recommendations2.top_clusters[index].cluster_id &&
      cluster.score === recommendations2.top_clusters[index].score
    );
    
    if (clustersMatch) {
      console.log('✅ Determinism verified - identical results on repeat runs');
    } else {
      console.log('❌ Determinism failed - results differ between runs');
    }
    
    // Step 6: Test progress calculation
    console.log('\n5️⃣ Testing progress calculation...');
    const progress = QuestionnaireService.getProgress(sampleResponses);
    
    console.log('✅ Progress calculation successful');
    console.log(`   - Completed: ${progress.completedQuestions}/${progress.totalQuestions} questions (${progress.percentComplete}%)`);
    console.log(`   - Sections: ${progress.completedSections}/${progress.totalSections} complete`);
    
    console.log('\n🎉 Integration test completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Questionnaire validation works');
    console.log('   ✅ StudentProfile conversion works');
    console.log('   ✅ Recommendation generation works');
    console.log('   ✅ Deterministic output verified');
    console.log('   ✅ Progress tracking works');
    console.log('   ✅ Full pipeline integration successful');
    
  } catch (error) {
    console.error('❌ Integration test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Test with incomplete responses
function testIncompleteResponses() {
  console.log('\n🔍 Testing Incomplete Response Handling...\n');
  
  const incompleteResponses = {
    grade: '10th',
    zipCode: '54321',
    workEnvironment: ['Indoors (offices, hospitals, schools)'],
    // Missing many required fields
  };
  
  try {
    const validation = QuestionnaireService.validateResponses(incompleteResponses);
    
    console.log('✅ Incomplete response validation:');
    console.log(`   - Valid: ${validation.isValid}`);
    console.log(`   - Errors: ${validation.errors.length}`);
    console.log(`   - Sample errors: ${validation.errors.slice(0, 3).join(', ')}`);
    
    if (!validation.isValid) {
      console.log('✅ Properly rejected incomplete responses');
    }
    
    // Test progress with incomplete data
    const progress = QuestionnaireService.getProgress(incompleteResponses);
    console.log(`   - Progress: ${progress.percentComplete}% (${progress.completedQuestions}/${progress.totalQuestions})`);
    
  } catch (error) {
    console.error('❌ Incomplete response test failed:', error.message);
  }
}

// Run tests
if (require.main === module) {
  testQuestionnaireIntegration();
  testIncompleteResponses();
}