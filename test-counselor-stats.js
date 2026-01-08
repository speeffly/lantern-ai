const https = require('https');

// Test counselor stats calculation
async function testCounselorStats() {
  console.log('📊 TESTING COUNSELOR STATS CALCULATION');
  console.log('='.repeat(50));

  // You'll need to get a valid counselor token first
  const COUNSELOR_TOKEN = 'your_counselor_token_here'; // Replace with actual token

  const options = {
    hostname: 'lantern-ai.onrender.com',
    path: '/api/counselor/stats',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${COUNSELOR_TOKEN}`,
      'Content-Type': 'application/json'
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          console.log('📊 Stats API Response Status:', res.statusCode);
          console.log('📊 Stats API Response:', JSON.stringify(jsonBody, null, 2));

          if (jsonBody.success && jsonBody.data) {
            const stats = jsonBody.data;
            
            console.log('\n📋 COUNSELOR STATISTICS ANALYSIS:');
            console.log('='.repeat(40));
            
            console.log(`\n👥 STUDENTS:`);
            console.log(`   Total Students: ${stats.totalStudents}`);
            console.log(`   Students with Assessments: ${stats.studentsWithAssessments}`);
            console.log(`   Students with Career Plans: ${stats.studentsWithCareerPlans}`);
            
            console.log(`\n📝 ASSESSMENTS:`);
            console.log(`   Assessment Completion Rate: ${stats.assessmentCompletionRate}%`);
            console.log(`   Calculation: ${stats.studentsWithAssessments}/${stats.totalStudents} = ${stats.totalStudents > 0 ? Math.round((stats.studentsWithAssessments / stats.totalStudents) * 100) : 0}%`);
            
            console.log(`\n🎯 CAREER PLANS:`);
            console.log(`   Career Plan Completion Rate: ${stats.careerPlanCompletionRate}%`);
            console.log(`   Calculation: ${stats.studentsWithCareerPlans}/${stats.totalStudents} = ${stats.totalStudents > 0 ? Math.round((stats.studentsWithCareerPlans / stats.totalStudents) * 100) : 0}%`);
            
            console.log(`\n📋 ASSIGNMENTS:`);
            console.log(`   Total Assignments: ${stats.totalAssignments}`);
            console.log(`   Completed Assignments: ${stats.completedAssignments}`);
            console.log(`   Assignment Completion Rate: ${stats.assignmentCompletionRate}%`);
            console.log(`   Calculation: ${stats.completedAssignments}/${stats.totalAssignments} = ${stats.totalAssignments > 0 ? Math.round((stats.completedAssignments / stats.totalAssignments) * 100) : 0}%`);
            
            // Verify calculations
            console.log(`\n🔍 CALCULATION VERIFICATION:`);
            const expectedAssessmentRate = stats.totalStudents > 0 ? Math.round((stats.studentsWithAssessments / stats.totalStudents) * 100) : 0;
            const expectedCareerPlanRate = stats.totalStudents > 0 ? Math.round((stats.studentsWithCareerPlans / stats.totalStudents) * 100) : 0;
            const expectedAssignmentRate = stats.totalAssignments > 0 ? Math.round((stats.completedAssignments / stats.totalAssignments) * 100) : 0;
            
            console.log(`   Assessment Rate - Expected: ${expectedAssessmentRate}%, Actual: ${stats.assessmentCompletionRate}% ${expectedAssessmentRate === stats.assessmentCompletionRate ? '✅' : '❌'}`);
            console.log(`   Career Plan Rate - Expected: ${expectedCareerPlanRate}%, Actual: ${stats.careerPlanCompletionRate}% ${expectedCareerPlanRate === stats.careerPlanCompletionRate ? '✅' : '❌'}`);
            console.log(`   Assignment Rate - Expected: ${expectedAssignmentRate}%, Actual: ${stats.assignmentCompletionRate}% ${expectedAssignmentRate === stats.assignmentCompletionRate ? '✅' : '❌'}`);
            
            if (stats.totalStudents === 0) {
              console.log(`\n⚠️ WARNING: No students found for this counselor`);
              console.log(`   This could mean:`);
              console.log(`   1. Counselor has no students assigned`);
              console.log(`   2. Student-counselor relationships not set up`);
              console.log(`   3. Authentication issue with counselor ID`);
            }
            
            if (stats.studentsWithAssessments === 0 && stats.totalStudents > 0) {
              console.log(`\n⚠️ WARNING: No students have completed assessments`);
              console.log(`   This could mean:`);
              console.log(`   1. Students haven't taken assessments yet`);
              console.log(`   2. Assessment completion logic is incorrect`);
              console.log(`   3. Assessment data not being found properly`);
            }
            
          } else {
            console.log('❌ Stats API call failed:', jsonBody.error);
          }

          resolve(jsonBody);
        } catch (e) {
          console.log('❌ Failed to parse stats response:', body);
          reject(e);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Stats API request error:', error.message);
      reject(error);
    });

    req.end();
  });
}

// Test individual data queries
async function testIndividualQueries() {
  console.log('\n🔍 TESTING INDIVIDUAL DATA QUERIES');
  console.log('='.repeat(50));

  // Test students query
  console.log('\n1️⃣ Testing students list...');
  await testStudentsList();

  // Test assessment sessions
  console.log('\n2️⃣ Testing assessment sessions...');
  await testAssessmentSessions();

  // Test career recommendations
  console.log('\n3️⃣ Testing career recommendations...');
  await testCareerRecommendations();
}

async function testStudentsList() {
  const COUNSELOR_TOKEN = 'your_counselor_token_here'; // Replace with actual token

  const options = {
    hostname: 'lantern-ai.onrender.com',
    path: '/api/counselor/students',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${COUNSELOR_TOKEN}`,
      'Content-Type': 'application/json'
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          console.log('📊 Students API Response:', jsonBody.success ? 'Success' : 'Failed');
          
          if (jsonBody.success && jsonBody.data) {
            console.log(`   Found ${jsonBody.data.length} students`);
            jsonBody.data.forEach((student, index) => {
              console.log(`   ${index + 1}. ${student.email} (ID: ${student.id})`);
            });
          } else {
            console.log('   Error:', jsonBody.error);
          }
          
          resolve(jsonBody);
        } catch (e) {
          console.log('❌ Failed to parse students response');
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function testAssessmentSessions() {
  // This would require direct database access or a specific endpoint
  console.log('ℹ️ Assessment sessions testing requires database access');
  console.log('   Check Render logs for "📊 DEBUG - Student X assessment sessions" messages');
}

async function testCareerRecommendations() {
  // This would require direct database access or a specific endpoint
  console.log('ℹ️ Career recommendations testing requires database access');
  console.log('   Check Render logs for "📊 DEBUG - Student X career recommendations" messages');
}

// Run tests
async function runAllTests() {
  try {
    await testCounselorStats();
    await testIndividualQueries();
    
    console.log('\n✅ COUNSELOR STATS TESTING COMPLETE');
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('❌ Testing failed:', error);
  }
}

// Instructions
console.log(`
📋 COUNSELOR STATS TESTING INSTRUCTIONS
=======================================

🔧 SETUP:
1. Get a valid counselor authentication token
2. Replace 'your_counselor_token_here' with the actual token
3. Ensure counselor has students assigned
4. Run this script to test stats calculation

🎯 WHAT THIS TESTS:
- Counselor stats API endpoint response
- Percentage calculation verification
- Individual data query results
- Identifies potential issues with data retrieval

⚠️ PREREQUISITES:
- Valid counselor account and token
- Students assigned to the counselor
- Some students should have completed assessments
- Some students should have career recommendations

🔍 DEBUGGING STEPS:
1. Run this script to see current stats
2. Check Render logs for detailed debugging info
3. Compare expected vs actual percentage calculations
4. Identify which data queries are returning empty results

📊 EXPECTED ISSUES TO LOOK FOR:
- Zero students found (relationship issue)
- Students found but no assessments (assessment completion logic)
- Students found but no career plans (career recommendation logic)
- Calculations correct but percentages wrong (rounding issue)
`);

// Uncomment to run tests (after setting up token)
// runAllTests();