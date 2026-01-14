const { Pool } = require('pg');
require('dotenv').config({ path: './backend/.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkUserAssessment() {
  try {
    const email = 'geostar0211@gmail.com';
    
    console.log(`\n🔍 Checking assessment data for: ${email}\n`);

    // 1. Find the user
    const userResult = await pool.query(`
      SELECT id, email, first_name, last_name, role
      FROM users
      WHERE email = $1
    `, [email]);

    if (userResult.rows.length === 0) {
      console.log('❌ User not found');
      await pool.end();
      return;
    }

    const user = userResult.rows[0];
    console.log('✅ User found:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Name: ${user.first_name} ${user.last_name}`);
    console.log(`   Role: ${user.role}\n`);

    // 2. Check student profile
    const profileResult = await pool.query(`
      SELECT grade, zip_code, school_name
      FROM student_profiles
      WHERE user_id = $1
    `, [user.id]);

    if (profileResult.rows.length > 0) {
      const profile = profileResult.rows[0];
      console.log('📋 Student Profile:');
      console.log(`   Grade: ${profile.grade || '❌ NOT SET'}`);
      console.log(`   ZIP Code: ${profile.zip_code || '❌ NOT SET'}`);
      console.log(`   School: ${profile.school_name || 'NOT SET'}\n`);
    } else {
      console.log('⚠️  No student profile found\n');
    }

    // 3. Check assessment sessions
    const sessionsResult = await pool.query(`
      SELECT 
        id,
        session_token,
        status,
        zip_code,
        created_at,
        completed_at
      FROM assessment_sessions
      WHERE user_id = $1
      ORDER BY created_at DESC
    `, [user.id]);

    console.log(`📝 Assessment Sessions: ${sessionsResult.rows.length} found\n`);
    
    if (sessionsResult.rows.length > 0) {
      sessionsResult.rows.forEach((session, index) => {
        console.log(`Session ${index + 1}:`);
        console.log(`   ID: ${session.id}`);
        console.log(`   Token: ${session.session_token}`);
        console.log(`   Status: ${session.status}`);
        console.log(`   ZIP Code: ${session.zip_code || 'NOT SET'}`);
        console.log(`   Created: ${session.created_at}`);
        console.log(`   Completed: ${session.completed_at || 'NOT COMPLETED'}\n`);
      });

      // 4. Check career recommendations for the most recent session
      const latestSession = sessionsResult.rows[0];
      const recommendationsResult = await pool.query(`
        SELECT 
          id,
          career_id,
          match_score,
          match_reason,
          created_at
        FROM career_recommendations
        WHERE session_id = $1
        ORDER BY match_score DESC
      `, [latestSession.id]);

      console.log(`🎯 Career Recommendations: ${recommendationsResult.rows.length} found\n`);
      
      if (recommendationsResult.rows.length > 0) {
        console.log('Top recommendations:');
        recommendationsResult.rows.slice(0, 3).forEach((rec, index) => {
          console.log(`   ${index + 1}. Career ID: ${rec.career_id}, Score: ${rec.match_score}`);
        });
        console.log('');
      }

      // 5. Check assessment answers
      const answersResult = await pool.query(`
        SELECT COUNT(*) as answer_count
        FROM assessment_answers
        WHERE session_id = $1
      `, [latestSession.id]);

      console.log(`💬 Assessment Answers: ${answersResult.rows[0].answer_count} answers stored\n`);

    } else {
      console.log('⚠️  No assessment sessions found for this user\n');
    }

    // Summary
    console.log('📊 SUMMARY:');
    console.log(`   User exists: ✅`);
    console.log(`   Profile exists: ${profileResult.rows.length > 0 ? '✅' : '❌'}`);
    console.log(`   Assessment sessions: ${sessionsResult.rows.length}`);
    console.log(`   Completed sessions: ${sessionsResult.rows.filter(s => s.status === 'completed').length}`);
    
    if (sessionsResult.rows.length > 0) {
      const latestSession = sessionsResult.rows[0];
      console.log(`\n   Latest session status: ${latestSession.status}`);
      console.log(`   Latest session completed: ${latestSession.completed_at ? '✅' : '❌'}`);
    }

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

checkUserAssessment();
