const { Pool } = require('pg');
require('dotenv').config({ path: './backend/.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function diagnoseAssessmentIssue() {
  try {
    const email = 'geostar0211@gmail.com';
    
    console.log('\n🔍 ASSESSMENT DIAGNOSTIC REPORT');
    console.log('================================\n');
    console.log(`User: ${email}\n`);

    // 1. Check if user exists
    console.log('STEP 1: Checking user account...');
    const userResult = await pool.query(`
      SELECT id, email, first_name, last_name, role, created_at
      FROM users
      WHERE email = $1
    `, [email]);

    if (userResult.rows.length === 0) {
      console.log('❌ ISSUE: User account not found in database');
      console.log('   ACTION: User needs to register first\n');
      await pool.end();
      return;
    }

    const user = userResult.rows[0];
    console.log(`✅ User account found (ID: ${user.id})`);
    console.log(`   Name: ${user.first_name} ${user.last_name}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Created: ${user.created_at}\n`);

    // 2. Check student profile
    console.log('STEP 2: Checking student profile...');
    const profileResult = await pool.query(`
      SELECT grade, zip_code, school_name, created_at, updated_at
      FROM student_profiles
      WHERE user_id = $1
    `, [user.id]);

    if (profileResult.rows.length === 0) {
      console.log('⚠️  WARNING: No student profile found');
      console.log('   This is unusual but not critical\n');
    } else {
      const profile = profileResult.rows[0];
      console.log('✅ Student profile exists');
      console.log(`   Grade: ${profile.grade || 'NOT SET'}`);
      console.log(`   ZIP Code: ${profile.zip_code || 'NOT SET'}`);
      console.log(`   Last updated: ${profile.updated_at}\n`);
    }

    // 3. Check assessment sessions
    console.log('STEP 3: Checking assessment sessions...');
    const sessionsResult = await pool.query(`
      SELECT 
        id,
        session_token,
        status,
        zip_code,
        started_at,
        completed_at,
        expires_at
      FROM assessment_sessions
      WHERE user_id = $1
      ORDER BY started_at DESC
    `, [user.id]);

    if (sessionsResult.rows.length === 0) {
      console.log('❌ ISSUE: No assessment sessions found');
      console.log('   CAUSE: Assessment was never submitted to database');
      console.log('   POSSIBLE REASONS:');
      console.log('      - Assessment was only saved to localStorage');
      console.log('      - Submission failed due to network error');
      console.log('      - Backend was not running during submission');
      console.log('   ACTION: User needs to retake the assessment\n');
      await pool.end();
      return;
    }

    console.log(`✅ Found ${sessionsResult.rows.length} assessment session(s)\n`);
    
    const completedSessions = sessionsResult.rows.filter(s => s.status === 'completed');
    const inProgressSessions = sessionsResult.rows.filter(s => s.status === 'in_progress');
    
    console.log(`   Completed: ${completedSessions.length}`);
    console.log(`   In Progress: ${inProgressSessions.length}\n`);

    if (completedSessions.length === 0) {
      console.log('❌ ISSUE: No completed assessment sessions');
      console.log('   All sessions are still "in_progress"');
      console.log('   CAUSE: Assessment was started but never completed');
      console.log('   ACTION: User needs to complete the assessment\n');
    }

    // Show details of each session
    for (let i = 0; i < sessionsResult.rows.length; i++) {
      const session = sessionsResult.rows[i];
      console.log(`   Session ${i + 1}:`);
      console.log(`      ID: ${session.id}`);
      console.log(`      Status: ${session.status}`);
      console.log(`      Started: ${session.started_at}`);
      console.log(`      Completed: ${session.completed_at || 'NOT COMPLETED'}`);
      console.log(`      Expires: ${session.expires_at}`);
      
      // Check if expired
      const now = new Date();
      const expiresAt = new Date(session.expires_at);
      if (expiresAt < now) {
        console.log(`      ⚠️  EXPIRED (${Math.floor((now - expiresAt) / (1000 * 60 * 60))} hours ago)`);
      }
      console.log('');
    }

    // 4. Check career recommendations for completed sessions
    if (completedSessions.length > 0) {
      console.log('STEP 4: Checking career recommendations...');
      
      for (const session of completedSessions) {
        const recommendationsResult = await pool.query(`
          SELECT 
            id,
            career_id,
            match_score,
            created_at
          FROM career_recommendations
          WHERE session_id = $1
          ORDER BY match_score DESC
        `, [session.id]);

        console.log(`   Session ${session.id}:`);
        if (recommendationsResult.rows.length === 0) {
          console.log(`      ❌ ISSUE: No career recommendations found`);
          console.log(`      CAUSE: Recommendations were not saved to database`);
          console.log(`      ACTION: User needs to retake assessment\n`);
        } else {
          console.log(`      ✅ ${recommendationsResult.rows.length} career recommendations found`);
          console.log(`      Top 3 careers:`);
          recommendationsResult.rows.slice(0, 3).forEach((rec, idx) => {
            console.log(`         ${idx + 1}. Career ID: ${rec.career_id} (Score: ${rec.match_score})`);
          });
          console.log('');
        }

        // Check assessment answers
        const answersResult = await pool.query(`
          SELECT COUNT(*) as count
          FROM assessment_answers
          WHERE session_id = $1
        `, [session.id]);

        const answerCount = answersResult.rows[0].count;
        console.log(`      Assessment answers: ${answerCount}`);
        if (answerCount === 0) {
          console.log(`      ⚠️  WARNING: No answers stored`);
        }
        console.log('');
      }
    }

    // 5. Final diagnosis
    console.log('\n📋 FINAL DIAGNOSIS:');
    console.log('==================\n');
    
    if (completedSessions.length > 0) {
      const latestCompleted = completedSessions[0];
      
      // Check if it has recommendations
      const recsResult = await pool.query(`
        SELECT COUNT(*) as count
        FROM career_recommendations
        WHERE session_id = $1
      `, [latestCompleted.id]);
      
      const hasRecommendations = recsResult.rows[0].count > 0;
      
      if (hasRecommendations) {
        console.log('✅ STATUS: Assessment data is complete in database');
        console.log(`   Latest completed session: ${latestCompleted.id}`);
        console.log(`   Completed at: ${latestCompleted.completed_at}`);
        console.log(`   Career recommendations: ${recsResult.rows[0].count}`);
        console.log('\n   ISSUE: Frontend is not loading data from database');
        console.log('   POSSIBLE CAUSES:');
        console.log('      1. JWT token is invalid or expired');
        console.log('      2. Frontend is checking localStorage before database');
        console.log('      3. Browser cache needs to be cleared');
        console.log('\n   SOLUTION:');
        console.log('      1. Have user log out and log back in');
        console.log('      2. Clear browser localStorage');
        console.log('      3. Hard refresh the page (Ctrl+Shift+R)');
      } else {
        console.log('❌ STATUS: Assessment completed but recommendations missing');
        console.log('   SOLUTION: User needs to retake the assessment');
      }
    } else {
      console.log('❌ STATUS: No completed assessments in database');
      console.log('   SOLUTION: User needs to take/complete the assessment');
    }

    console.log('\n');
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ DIAGNOSTIC ERROR:', error.message);
    console.error(error);
    await pool.end();
    process.exit(1);
  }
}

diagnoseAssessmentIssue();
