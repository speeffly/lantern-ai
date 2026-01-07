const axios = require('axios');

const BASE_URL = 'https://lantern-ai.onrender.com';

async function testDynamicSalaryIntegration() {
  console.log('🧪 Testing Dynamic Salary Integration in Counselor Assessment');
  console.log('='.repeat(80));
  
  try {
    // Test counselor assessment with sample data
    const assessmentData = {
      grade: 11,
      zipCode: '78724',
      workEnvironment: 'Indoors - offices, hospitals, schools',
      handsOnPreference: 'Prefer working with people and helping them',
      problemSolving: 'Helping people with their challenges',
      helpingOthers: 'Very important - I want to directly help people',
      educationCommitment: '2-4 years of college or technical school',
      incomeImportance: 'Somewhat important - I want a comfortable living',
      jobSecurity: 'Very important - I want a stable, secure job',
      subjectsStrengths: ['Math', 'Science (Biology, Chemistry, Physics)', 'Health'],
      interestsPassions: 'I am passionate about helping people and interested in healthcare careers. I enjoy science and want to make a difference in my community.',
      workExperience: 'I have volunteered at the local hospital for 6 months and helped with community health fairs.',
      personalTraits: ['Compassionate and caring', 'Patient and persistent', 'Detail-oriented and organized'],
      inspirationRoleModels: 'My aunt who is a nurse inspires me because she helps people every day and makes a real difference in their lives.',
      legacyImpact: 'I want to be remembered as someone who helped heal people and made them feel better during difficult times.'
    };

    console.log('📋 Submitting counselor assessment...');
    console.log('Student Profile:');
    console.log('- Grade:', assessmentData.grade);
    console.log('- ZIP Code:', assessmentData.zipCode);
    console.log('- Career Interest:', 'Healthcare');
    console.log('- Education Goal:', assessmentData.educationCommitment);
    
    const response = await axios.post(`${BASE_URL}/api/counselor-assessment/submit`, {
      responses: assessmentData
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 60000 // 60 second timeout
    });

    if (response.data.success) {
      console.log('\n✅ Assessment completed successfully!');
      
      const recommendations = response.data.data.recommendations;
      
      console.log('\n' + '='.repeat(80));
      console.log('📊 DYNAMIC SALARY INTEGRATION RESULTS');
      console.log('='.repeat(80));
      
      // Check if we have job matches with salary data
      if (recommendations.topJobMatches && recommendations.topJobMatches.length > 0) {
        console.log(`\n🎯 Top ${Math.min(5, recommendations.topJobMatches.length)} Career Matches:`);
        
        recommendations.topJobMatches.slice(0, 5).forEach((job, index) => {
          console.log(`\n${index + 1}. ${job.career.title}`);
          console.log(`   - Match Score: ${job.matchScore}%`);
          console.log(`   - Sector: ${job.career.sector}`);
          console.log(`   - Average Salary: $${job.career.averageSalary.toLocaleString()}`);
          console.log(`   - Required Education: ${job.career.requiredEducation}`);
          
          if (job.localOpportunities) {
            console.log(`   - Local Average Salary: $${job.localOpportunities.averageLocalSalary.toLocaleString()}`);
            console.log(`   - Estimated Local Jobs: ${job.localOpportunities.estimatedJobs}`);
            console.log(`   - Distance from Student: ${job.localOpportunities.distanceFromStudent} miles`);
            console.log(`   - Top Local Employers: ${job.localOpportunities.topEmployers.join(', ')}`);
          }
          
          // Check if this career has dynamic salary data
          const salaryDifference = job.localOpportunities ? 
            job.localOpportunities.averageLocalSalary - job.career.averageSalary : 0;
          
          if (Math.abs(salaryDifference) > 1000) {
            console.log(`   💰 DYNAMIC SALARY DETECTED: Local salary differs by $${Math.abs(salaryDifference).toLocaleString()}`);
            console.log(`      ${salaryDifference > 0 ? '📈 Higher' : '📉 Lower'} than national average`);
          }
        });
      }
      
      // Check AI recommendations for local job data
      if (recommendations.aiRecommendations && recommendations.aiRecommendations.localJobs) {
        console.log(`\n🤖 AI Recommendations - Local Jobs Found: ${recommendations.aiRecommendations.localJobs.length}`);
        
        if (recommendations.aiRecommendations.localJobs.length > 0) {
          console.log('\n📍 Sample Local Job Opportunities:');
          recommendations.aiRecommendations.localJobs.slice(0, 3).forEach((job, index) => {
            console.log(`${index + 1}. ${job.title} at ${job.company}`);
            console.log(`   - Location: ${job.location}`);
            console.log(`   - Distance: ${job.distance} miles`);
            console.log(`   - Salary: ${job.salary}`);
            console.log(`   - Source: ${job.source}`);
          });
        }
      }
      
      console.log('\n' + '='.repeat(80));
      console.log('🔍 INTEGRATION STATUS ANALYSIS');
      console.log('='.repeat(80));
      
      // Analyze if dynamic salary integration is working
      let dynamicSalaryDetected = false;
      let realJobsDetected = false;
      
      if (recommendations.topJobMatches) {
        recommendations.topJobMatches.forEach(job => {
          if (job.localOpportunities) {
            const salaryDiff = Math.abs(job.localOpportunities.averageLocalSalary - job.career.averageSalary);
            if (salaryDiff > 1000) {
              dynamicSalaryDetected = true;
            }
          }
        });
      }
      
      if (recommendations.aiRecommendations && recommendations.aiRecommendations.localJobs) {
        const adzunaJobs = recommendations.aiRecommendations.localJobs.filter(job => 
          job.source && job.source.includes('Adzuna')
        );
        if (adzunaJobs.length > 0) {
          realJobsDetected = true;
        }
      }
      
      console.log('✅ Assessment Results:');
      console.log(`   - Dynamic Salary Calculation: ${dynamicSalaryDetected ? '✅ WORKING' : '⚠️ NOT DETECTED'}`);
      console.log(`   - Real Job Data Integration: ${realJobsDetected ? '✅ WORKING' : '⚠️ NOT DETECTED'}`);
      console.log(`   - Career Matches Generated: ${recommendations.topJobMatches ? recommendations.topJobMatches.length : 0}`);
      console.log(`   - AI Recommendations: ${recommendations.aiRecommendations ? '✅ Generated' : '❌ Missing'}`);
      
      if (dynamicSalaryDetected) {
        console.log('\n🎉 SUCCESS: Dynamic salary calculation is integrated and working!');
        console.log('   The system is using real Adzuna job data to calculate local salaries.');
      } else {
        console.log('\n⚠️ WARNING: Dynamic salary calculation may not be fully integrated.');
        console.log('   Check the server logs for detailed salary calculation debugging output.');
      }
      
    } else {
      console.log('❌ Assessment failed:', response.data.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testDynamicSalaryIntegration();