const { Pool } = require('pg');
require('dotenv').config({ path: './backend/.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function compareUsers() {
  try {
    const users = ['geostar0211@gmail.com', 'stud@gmail.com'];
    
    console.log('\n🔍 COMPARING TWO USERS\n');
    console.log('='.repeat(80));
    
    for (const email of users) {
      console.log(`\n📧 USER: ${email}`);
      console.log('-'.repeat(80));
      
      // Get user
      const userResult = await pool.query(`
        SELECT id, email, first_name, last_name, role, created_at
        FROM users
        WHERE email = $1
      `, [email]);

      if (userResult.rows.length === 0) {
        console.log('❌ User not found\n');
        continue;
      }

      const user = userResult.rows[0];
      console.log(`✅ User ID: ${user.id}`);
      console.log(`   Name: ${user.first_name} ${user.last_name}`);
      console.log(`   Created: ${user.created_at}`);

      // Check profile
      const profileResult = await pool.query(`
        SELECT grade, zip_code
        FROM student_profiles
        WHERE user_id = $1
      `, [user.id]);

      if (profileResult.rows.length > 0) {
        const profile = profileResult.rows[0];
        console.log(`   Grade: ${profile.grade || '❌ NOT SET'}`);
        console.log(`   ZIP: ${profile.zip_code || '❌ NOT SET'}`);
      } else {
        console.log('   ⚠️  No profile');
      }

      // Check assessment sessions
      const sessionsResult = await pool.query(`
        SELECT 
          id,
          status,
          started_at,
          completed_at
        FROM assessment_sessions
        WHERE user_id = $1
        ORDER BY started_at DESC
      `, [user.id]);

      console.log(`\n   📝 Assessment Sessions: ${sessionsResult.rows.length}`);
      
      if (sessionsResult.rows.length > 0) {
        sessionsResult.rows.forEach((session, idx) => {
          console.log(`      ${idx + 1}. Session ${session.id}`);
          console.log(`         Status: ${session.status}`);
          console.log(`         Started: ${session.started_at}`);
          console.log(`         Completed: ${session.completed_at || 'NOT COMPLETED'}`);
        });

        // Check recommendations for latest session
        const latestSession = sessionsResult.rows[0];
        const recsResult = await pool.query(`
          SELECT COUNT(*) as count
          FROM career_recommendations
          WHERE session_id = $1
        `, [latestSession.id]);

        console.log(`\n      Latest session has ${recsResult.rows[0].count} recommendations`);
      } else {
        console.log('      ❌ NO SESSIONS IN DATABASE');
      }

      console.log('');
    }

    console.log('='.repeat(80));
    console.log('\n📊 COMPARISON SUMMARY:\n');
    console.log('If geostar0211@gmail.com has NO sessions but stud@gmail.com has sessions,');
    console.log('then geostar0211@gmail.com completed assessment BEFORE the fix.');
    console.log('Their data is only in localStorage and needs to be retaken.\n');

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

compareUsers();
