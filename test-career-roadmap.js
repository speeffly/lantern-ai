const axios = require('axios');

async function testCareerRoadmap() {
  console.log('🗺️ Testing Career Roadmap Generation');
  console.log('====================================');
  
  try {
    // Test data for roadmap generation
    const testData = {
      career: {
        title: 'Software Engineer',
        sector: 'technology',
        requiredEducation: 'Bachelor\'s degree',
        averageSalary: 85000,
        description: 'Design, develop, and maintain software applications and systems'
      },
      studentData: {
        grade: 11,
        zipCode: '12345',
        courseHistory: {
          'Math': 'AP Calculus BC, AP Statistics, Honors Algebra II',
          'Science (Biology, Chemistry, Physics)': 'AP Computer Science A, Honors Physics, Honors Chemistry',
          'Technology / Computer Science': 'AP Computer Science A, Web Development, Robotics'
        },
        academicPerformance: {
          'Math': 'excellent',
          'Science (Biology, Chemistry, Physics)': 'good',
          'Technology / Computer Science': 'excellent'
        },
        supportLevel: 'high',
        educationCommitment: 'bachelors'
      }
    };

    console.log('📝 Test career:', testData.career.title);
    console.log('👤 Student: Grade', testData.studentData.grade, 'ZIP', testData.studentData.zipCode);
    console.log('📚 Course history subjects:', Object.keys(testData.studentData.courseHistory).length);
    
    console.log('\n🚀 Generating career roadmap...');
    
    const response = await axios.post('http://localhost:3002/api/career-roadmap/generate', testData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      console.log('✅ Career roadmap generated successfully!');
      
      const roadmap = response.data.data;
      
      console.log('\n📊 Roadmap Overview:');
      console.log('- Career:', roadmap.careerTitle);
      console.log('- Time to Career:', roadmap.overview.totalTimeToCareer);
      console.log('- Estimated Cost:', `$${roadmap.overview.estimatedTotalCost.toLocaleString()}`);
      console.log('- Difficulty Level:', roadmap.overview.difficultyLevel);
      console.log('- Job Availability:', roadmap.overview.jobAvailability);
      
      console.log('\n🎓 High School Phase:');
      console.log('- Timeframe:', roadmap.detailedPath.highSchoolPhase.timeframe);
      console.log('- Required Courses:', roadmap.detailedPath.highSchoolPhase.requiredCourses.length);
      console.log('- Skills to Focus:', roadmap.detailedPath.highSchoolPhase.skillsToFocus.length);
      
      console.log('\n🏫 Post-Secondary Phase:');
      console.log('- Education Type:', roadmap.detailedPath.postSecondaryPhase.educationType);
      console.log('- Estimated Cost:', `$${roadmap.detailedPath.postSecondaryPhase.estimatedCost?.toLocaleString() || 'N/A'}`);
      console.log('- Programs:', roadmap.detailedPath.postSecondaryPhase.specificPrograms.length);
      
      console.log('\n💼 Early Career Phase:');
      console.log('- Entry Positions:', roadmap.detailedPath.earlyCareerPhase.entryLevelPositions.length);
      console.log('- Certifications:', roadmap.detailedPath.earlyCareerPhase.certifications.length);
      
      console.log('\n📈 Advancement Phase:');
      console.log('- Career Progression:', roadmap.detailedPath.advancementPhase.careerProgression.length);
      console.log('- Leadership Opportunities:', roadmap.detailedPath.advancementPhase.leadershipOpportunities.length);
      
      console.log('\n🎯 Personalized Recommendations:');
      console.log('- Strengths to Leverage:', roadmap.personalizedRecommendations.strengthsToLeverage.length);
      console.log('- Areas for Improvement:', roadmap.personalizedRecommendations.areasForImprovement.length);
      console.log('- Specific Actions:', roadmap.personalizedRecommendations.specificActions.length);
      
      console.log('\n🌍 Local Context:');
      console.log('- Nearby Schools:', roadmap.localContext.nearbySchools.length);
      console.log('- Local Employers:', roadmap.localContext.localEmployers.length);
      console.log('- Regional Opportunities:', roadmap.localContext.regionalOpportunities.length);
      
      console.log('\n✅ Career roadmap test completed successfully!');
      
    } else {
      console.log('❌ Roadmap generation failed:', response.data.error);
    }

  } catch (error) {
    console.log('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.status) {
      console.log('Status:', error.response.status);
    }
  }
}

async function testBatchRoadmaps() {
  console.log('\n🗺️ Testing Batch Career Roadmap Generation');
  console.log('==========================================');
  
  try {
    const testData = {
      careers: [
        {
          title: 'Software Engineer',
          sector: 'technology',
          requiredEducation: 'Bachelor\'s degree',
          averageSalary: 85000,
          description: 'Design and develop software applications'
        },
        {
          title: 'Registered Nurse',
          sector: 'healthcare',
          requiredEducation: 'Bachelor\'s degree',
          averageSalary: 75000,
          description: 'Provide patient care and medical support'
        }
      ],
      studentData: {
        grade: 11,
        zipCode: '12345',
        courseHistory: {
          'Math': 'AP Calculus BC, Honors Algebra II',
          'Science (Biology, Chemistry, Physics)': 'AP Biology, Honors Chemistry'
        },
        academicPerformance: {
          'Math': 'good',
          'Science (Biology, Chemistry, Physics)': 'excellent'
        },
        supportLevel: 'moderate',
        educationCommitment: 'bachelors'
      }
    };

    console.log('📝 Generating roadmaps for', testData.careers.length, 'careers...');
    
    const response = await axios.post('http://localhost:3002/api/career-roadmap/batch-generate', testData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      console.log('✅ Batch roadmap generation completed!');
      console.log('📊 Results:');
      console.log('- Total Requested:', response.data.data.totalRequested);
      console.log('- Total Generated:', response.data.data.totalGenerated);
      console.log('- Success Rate:', `${Math.round((response.data.data.totalGenerated / response.data.data.totalRequested) * 100)}%`);
      
      response.data.data.roadmaps.forEach((roadmap, index) => {
        console.log(`\n${index + 1}. ${roadmap.careerTitle}:`);
        console.log('   - Time to Career:', roadmap.overview.totalTimeToCareer);
        console.log('   - Difficulty:', roadmap.overview.difficultyLevel);
        console.log('   - Job Market:', roadmap.overview.jobAvailability);
      });
      
    } else {
      console.log('❌ Batch generation failed:', response.data.error);
    }

  } catch (error) {
    console.log('❌ Batch test failed:', error.response?.data || error.message);
  }
}

// Run tests
async function runTests() {
  await testCareerRoadmap();
  await new Promise(resolve => setTimeout(resolve, 2000)); // Wait between tests
  await testBatchRoadmaps();
}

runTests();