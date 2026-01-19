const https = require('https');

// Debug assessment detection issue
async function debugAssessmentDetection() {
  console.log('🔍 DEBUGGING ASSESSMENT DETECTION ISSUE');
  console.log('='.repeat(60));

  // Test the counselor stats endpoint to see detailed debug logs
  console.log('\n1️⃣ Testing counselor stats endpoint...');
  await testCounselorStats();

  console.log('\n2️⃣ Testing individual student data...');
  await testStudentData();

  console.log('\n3️⃣ Analyzing assessment session structure...');
  await analyzeAssessmentSessions();
}

async function testCounselorStats() {
  // You'll need to get a valid counselor token
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
          console.log('📊 Stats Response Status:', res.statusCode);
          
          if (jsonBody.success) {
            const stats = jsonBody.data;
            console.log('📊 Current Stats:', {
              totalStudents: stats.totalStudents,
              studentsWithAssessments: stats.studentsWithAssessments,
              assessmentCompletionRate: stats.assessmentCompletionRate
            });
            
            console.log('\n🔍 Key Questions to Answer:');
            console.log('1. Are students found? ->', stats.totalStudents > 0 ? '✅ YES' : '❌ NO');
            console.log('2. Are assessment sessions found? -> Check Render logs for "assessment sessions:" messages');
            console.log('3. What status values are in sessions? -> Check Render logs for "session details:" messages');
            console.log('4. Do sessions have answers? -> Check Render logs for "has X answers" messages');
            console.log('5. Are career recommendations found? -> Check Render logs for "career recommendations:" messages');
            
          } else {
            console.log('❌ Stats API failed:', jsonBody.error);
          }

          resolve(jsonBody);
        } catch (e) {
          console.log('❌ Failed to parse response:', body);
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function testStudentData() {
  console.log('\n🔍 EXPECTED DEBUG LOG PATTERNS TO LOOK FOR:');
  console.log('='.repeat(50));
  
  console.log('\n📋 In Render logs, look for these patterns:');
  console.log('1. "📊 DEBUG - Checking student X (email@domain.com)"');
  console.log('2. "📊 DEBUG - Student X assessment sessions: Y"');
  console.log('3. "📊 DEBUG - Student X session details: [...]"');
  console.log('4. "📊 DEBUG - Student X session Y has Z answers"');
  console.log('5. "📊 DEBUG - Student X completion method: [method] ✅"');
  console.log('6. "📊 DEBUG - Student X career recommendations: Y"');
  
  console.log('\n🎯 WHAT EACH PATTERN TELLS US:');
  console.log('Pattern 1: Confirms students are being processed');
  console.log('Pattern 2: Shows if assessment sessions exist (should be > 0)');
  console.log('Pattern 3: Shows actual session data structure and status values');
  console.log('Pattern 4: Shows if sessions have answers (indicates completion)');
  console.log('Pattern 5: Shows which detection method works (if any)');
  console.log('Pattern 6: Shows if career recommendations exist');
  
  console.log('\n⚠️ TROUBLESHOOTING SCENARIOS:');
  console.log('Scenario A: No sessions found (sessions: 0)');
  console.log('  -> Student never took assessment OR assessment data in different table');
  console.log('');
  console.log('Scenario B: Sessions found but wrong status values');
  console.log('  -> Status might be "in_progress", "abandoned", etc. instead of "completed"');
  console.log('');
  console.log('Scenario C: Sessions found but no completed_at timestamp');
  console.log('  -> Assessment might be incomplete or timestamp not set');
  console.log('');
  console.log('Scenario D: Sessions found but no answers');
  console.log('  -> Assessment started but not finished OR answers in different table');
  console.log('');
  console.log('Scenario E: No career recommendations');
  console.log('  -> Assessment completed but recommendations not generated');
}

async function analyzeAssessmentSessions() {
  console.log('\n🔍 ASSESSMENT SESSION ANALYSIS GUIDE:');
  console.log('='.repeat(50));
  
  console.log('\n📊 EXPECTED SESSION STRUCTURE:');
  console.log('Each session should have:');
  console.log('- id: unique identifier');
  console.log('- status: "completed", "in_progress", "abandoned", etc.');
  console.log('- completed_at: timestamp when completed (or null)');
  console.log('- started_at: timestamp when started');
  console.log('- session_token: unique session identifier');
  
  console.log('\n🎯 DETECTION METHOD PRIORITY:');
  console.log('Method 1: status === "completed" OR completed_at !== null');
  console.log('Method 2: Session has answers in assessment_answers table');
  console.log('Method 3: Student has career recommendations (indicates completion)');
  console.log('Method 4: Fallback - any session indicates some completion');
  
  console.log('\n🔧 DEBUGGING STEPS:');
  console.log('1. Check Render logs after calling /api/counselor/stats');
  console.log('2. Look for the debug patterns listed above');
  console.log('3. Identify which method should work based on actual data');
  console.log('4. If needed, adjust detection logic based on findings');
  
  console.log('\n📋 COMMON ISSUES AND SOLUTIONS:');
  console.log('Issue: Sessions exist but status is not "completed"');
  console.log('Solution: Add the actual status value to detection logic');
  console.log('');
  console.log('Issue: completed_at is always null even for completed assessments');
  console.log('Solution: Rely on answer count or career recommendations instead');
  console.log('');
  console.log('Issue: Assessment answers in different table or structure');
  console.log('Solution: Update query to match actual database schema');
  console.log('');
  console.log('Issue: Career recommendations not generated for completed assessments');
  console.log('Solution: Use answer count as primary detection method');
}

// Instructions
console.log(`
🔧 ASSESSMENT DETECTION DEBUGGING INSTRUCTIONS
==============================================

📋 SETUP:
1. Get a valid counselor authentication token
2. Replace 'your_counselor_token_here' with the actual token
3. Run this script to see analysis guide
4. Call the counselor stats API to trigger debug logs
5. Check Render logs for detailed debugging information

🎯 GOAL:
Identify why the comprehensive assessment detection is showing 0% completion
when we know at least one student has completed the assessment.

🔍 WHAT TO LOOK FOR:
- Are students being found and processed?
- Are assessment sessions being retrieved?
- What are the actual status values in sessions?
- Do sessions have answers in the database?
- Are career recommendations being generated?

📊 EXPECTED OUTCOME:
After running this debugging process, we should know:
1. The exact data structure of assessment sessions
2. Which detection method should work
3. What needs to be adjusted in the detection logic
4. Why the current logic is returning 0%

⚠️ NEXT STEPS AFTER DEBUGGING:
Based on the findings, we'll either:
- Adjust the status values we're checking for
- Fix the answer count query
- Update the career recommendation detection
- Identify missing data or incorrect table relationships
`);

// Uncomment to run debugging (after setting up token)
// debugAssessmentDetection();