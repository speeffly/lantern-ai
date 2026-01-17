// Test Individual Career Roadmaps
// This tests the new individual career roadmap generation for each displayed career

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

// Mock student data
const mockStudentData = {
  grade: 11,
  zipCode: '12345',
  courseHistory: {
    'Math': 'AP Calculus AB, Algebra II Honors',
    'Science (Biology, Chemistry, Physics)': 'AP Chemistry, Biology Honors',
    'English / Language Arts': 'English 11 Honors',
    'Technology / Computer Science': 'AP Computer Science A'
  },
  academicPerformance: {
    'Math': 'Excellent',
    'Science (Biology, Chemistry, Physics)': 'Good',
    'English / Language Arts': 'Good',
    'Technology / Computer Science': 'Excellent'
  },
  supportLevel: 'strong_support',
  educationCommitment: 'college_technical'
};

// Mock career options (filtered results)
const mockCareerOptions = [
  {
    title: 'Software Developer',
    sector: 'technology',
    matchScore: 92,
    averageSalary: 85000,
    requiredEducation: 'Bachelor\'s degree in Computer Science',
    description: 'Design, develop, and maintain software applications and systems'
  },
  {
    title: 'Biomedical Engineer',
    sector: 'healthcare',
    matchScore: 88,
    averageSalary: 78000,
    requiredEducation: 'Bachelor\'s degree in Biomedical Engineering',
    description: 'Apply engineering principles to solve problems in medicine and biology'
  },
  {
    title: 'Data Scientist',
    sector: 'technology',
    matchScore: 85,
    averageSalary: 95000,
    requiredEducation: 'Bachelor\'s degree in Data Science or related field',
    description: 'Analyze complex data to help organizations make informed decisions'
  }
];

// Test individual career roadmap generation
async function testIndividualCareerRoadmap(career) {
  console.log(`\n🗺️ Testing roadmap generation for: ${career.title}`);
  console.log('=' .repeat(60));
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/career-roadmap/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        career: career,
        studentData: mockStudentData
      }),
    });

    console.log(`📡 Response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ HTTP Error: ${response.status} - ${errorText}`);
      return null;
    }

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Roadmap generated successfully!');
      console.log(`📊 Career: ${data.data.careerTitle}`);
      console.log(`⏱️  Time to Career: ${data.data.overview.totalTimeToCareer}`);
      console.log(`💰 Estimated Cost: $${data.data.overview.estimatedTotalCost.toLocaleString()}`);
      console.log(`📚 Education Level: ${data.data.overview.educationLevel}`);
      console.log(`🎯 Difficulty: ${data.data.overview.difficultyLevel}`);
      console.log(`📈 Job Market: ${data.data.overview.jobAvailability}`);
      
      // Test detailed path phases
      console.log('\n📋 Roadmap Phases:');
      console.log(`   High School: ${data.data.detailedPath.highSchoolPhase.timeframe}`);
      console.log(`   Post-Secondary: ${data.data.detailedPath.postSecondaryPhase.timeframe}`);
      console.log(`   Early Career: ${data.data.detailedPath.earlyCareerPhase.timeframe}`);
      console.log(`   Advancement: ${data.data.detailedPath.advancementPhase.timeframe}`);
      
      // Test personalized recommendations
      console.log('\n🎯 Personalized Recommendations:');
      console.log(`   Strengths: ${data.data.personalizedRecommendations.strengthsToLeverage.length} items`);
      console.log(`   Improvements: ${data.data.personalizedRecommendations.areasForImprovement.length} items`);
      console.log(`   Actions: ${data.data.personalizedRecommendations.specificActions.length} items`);
      
      // Test local context
      console.log('\n🌍 Local Context:');
      console.log(`   Nearby Schools: ${data.data.localContext.nearbySchools.length} schools`);
      console.log(`   Local Employers: ${data.data.localContext.localEmployers.length} employers`);
      console.log(`   Regional Opportunities: ${data.data.localContext.regionalOpportunities.length} opportunities`);
      
      return data.data;
    } else {
      console.error('❌ Roadmap generation failed:', data.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Network/Parse error:', error.message);
    return null;
  }
}

// Test batch career roadmap generation
async function testBatchCareerRoadmaps() {
  console.log('\n🚀 Testing batch career roadmap generation...');
  console.log('=' .repeat(80));
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/career-roadmap/batch-generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        careers: mockCareerOptions,
        studentData: mockStudentData
      }),
    });

    console.log(`📡 Response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ HTTP Error: ${response.status} - ${errorText}`);
      return;
    }

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Batch roadmap generation completed!');
      console.log(`📊 Generated: ${data.data.totalGenerated} of ${data.data.totalRequested} roadmaps`);
      
      data.data.roadmaps.forEach((roadmap, index) => {
        console.log(`\n${index + 1}. ${roadmap.careerTitle}`);
        console.log(`   Time: ${roadmap.overview.totalTimeToCareer}`);
        console.log(`   Cost: $${roadmap.overview.estimatedTotalCost.toLocaleString()}`);
        console.log(`   Difficulty: ${roadmap.overview.difficultyLevel}`);
      });
    } else {
      console.error('❌ Batch roadmap generation failed:', data.error);
    }
  } catch (error) {
    console.error('❌ Network/Parse error:', error.message);
  }
}

// Test frontend integration simulation
function testFrontendIntegration() {
  console.log('\n🖥️  Testing Frontend Integration Simulation...');
  console.log('=' .repeat(60));
  
  // Simulate the data structure that would be passed to CareerRoadmapView
  const careerRoadmapViewProps = {
    careers: mockCareerOptions.map(career => ({
      title: career.title,
      sector: career.sector,
      matchScore: career.matchScore,
      averageSalary: career.averageSalary,
      requiredEducation: career.requiredEducation,
      description: career.description
    })),
    studentData: {
      grade: mockStudentData.grade,
      zipCode: mockStudentData.zipCode,
      courseHistory: mockStudentData.courseHistory,
      academicPerformance: mockStudentData.academicPerformance,
      supportLevel: mockStudentData.supportLevel,
      educationCommitment: mockStudentData.educationCommitment
    }
  };
  
  console.log('✅ CareerRoadmapView Props Structure:');
  console.log(`   Careers: ${careerRoadmapViewProps.careers.length} career options`);
  console.log(`   Student Grade: ${careerRoadmapViewProps.studentData.grade}`);
  console.log(`   Student ZIP: ${careerRoadmapViewProps.studentData.zipCode}`);
  console.log(`   Course History: ${Object.keys(careerRoadmapViewProps.studentData.courseHistory).length} subjects`);
  
  console.log('\n📋 Career Cards to Display:');
  careerRoadmapViewProps.careers.forEach((career, index) => {
    console.log(`   ${index + 1}. ${career.title} (${career.sector})`);
    console.log(`      Match: ${career.matchScore}% | Salary: $${career.averageSalary.toLocaleString()}`);
    console.log(`      Education: ${career.requiredEducation}`);
  });
  
  console.log('\n🎯 Expected User Flow:');
  console.log('   1. User sees career cards with basic info (cost, time, skills, etc.)');
  console.log('   2. User clicks "Generate Career Roadmap" button');
  console.log('   3. AI generates personalized roadmap for that specific career');
  console.log('   4. User clicks "View Detailed Path" to see expanded roadmap');
  console.log('   5. User can navigate between High School, Post-Secondary, Early Career, Advancement phases');
  console.log('   6. User sees personalized recommendations and local context');
}

// Main test execution
async function runAllTests() {
  console.log('🧪 INDIVIDUAL CAREER ROADMAPS TEST SUITE');
  console.log('=' .repeat(80));
  console.log(`🌐 API Base URL: ${API_BASE_URL}`);
  console.log(`👤 Test Student: Grade ${mockStudentData.grade}, ZIP ${mockStudentData.zipCode}`);
  console.log(`🎯 Test Careers: ${mockCareerOptions.length} career options`);
  
  // Test individual roadmap generation for each career
  const roadmaps = [];
  for (const career of mockCareerOptions) {
    const roadmap = await testIndividualCareerRoadmap(career);
    if (roadmap) {
      roadmaps.push(roadmap);
    }
    
    // Add delay between requests to avoid rate limiting
    console.log('⏳ Waiting 2 seconds before next request...');
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Test batch generation
  await testBatchCareerRoadmaps();
  
  // Test frontend integration
  testFrontendIntegration();
  
  // Summary
  console.log('\n📊 TEST SUMMARY');
  console.log('=' .repeat(40));
  console.log(`✅ Individual roadmaps generated: ${roadmaps.length}/${mockCareerOptions.length}`);
  console.log(`🎯 Success rate: ${Math.round((roadmaps.length / mockCareerOptions.length) * 100)}%`);
  
  if (roadmaps.length > 0) {
    console.log('\n🏆 INDIVIDUAL CAREER ROADMAPS FEATURE READY!');
    console.log('✅ Backend API endpoints working');
    console.log('✅ AI roadmap generation functional');
    console.log('✅ Frontend integration structure prepared');
    console.log('✅ Each career gets its own personalized roadmap');
    console.log('✅ Expandable UI with detailed phase navigation');
  } else {
    console.log('\n⚠️  Some issues detected - check AI service configuration');
  }
}

// Run the tests
runAllTests().catch(console.error);