/**
 * Database Statistics Checker
 * Run this from the backend directory: node check-database.js
 */

require('dotenv').config();
const { Pool } = require('pg');

async function checkDatabase() {
  console.log('📊 Checking database statistics...\n');
  
  // Create database connection
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const client = await pool.connect();
    console.log('✅ Connected to database\n');

    console.log('📋 Table Statistics:');
    console.log('===================');

    const tables = [
      { name: 'users', description: 'User accounts' },
      { name: 'email_verification_tokens', description: 'Email verification tokens' },
      { name: 'student_profiles', description: 'Student profiles' },
      { name: 'counselor_profiles', description: 'Counselor profiles' },
      { name: 'parent_profiles', description: 'Parent profiles' },
      { name: 'user_relationships', description: 'User relationships' },
      { name: 'assessment_sessions', description: 'Assessment sessions' },
      { name: 'career_recommendations', description: 'Career recommendations' },
      { name: 'action_plans', description: 'Action plans' }
    ];

    let totalRecords = 0;

    for (const table of tables) {
      try {
        const result = await client.query(`SELECT COUNT(*) as count FROM ${table.name}`);
        const count = parseInt(result.rows[0].count);
        totalRecords += count;
        
        const status = count === 0 ? '(empty)' : '';
        console.log(`${table.name.padEnd(25)} : ${count.toString().padStart(6)} records ${status}`);
      } catch (error) {
        console.log(`${table.name.padEnd(25)} : ${' '.repeat(6)}Table not found`);
      }
    }

    console.log('='.repeat(50));
    console.log(`${'Total records'.padEnd(25)} : ${totalRecords.toString().padStart(6)}`);

    // Check recent activity
    console.log('\n📅 Recent Activity:');
    console.log('==================');

    try {
      const recentUsers = await client.query(`
        SELECT COUNT(*) as count 
        FROM users 
        WHERE created_at > NOW() - INTERVAL '24 hours'
      `);
      console.log(`Users registered today: ${recentUsers.rows[0].count}`);
    } catch (error) {
      console.log('Recent users: Unable to check');
    }

    try {
      const recentSessions = await client.query(`
        SELECT COUNT(*) as count 
        FROM assessment_sessions 
        WHERE created_at > NOW() - INTERVAL '24 hours'
      `);
      console.log(`Assessments today: ${recentSessions.rows[0].count}`);
    } catch (error) {
      console.log('Recent assessments: Unable to check');
    }

    // Check email verification status
    console.log('\n📧 Email Verification Status:');
    console.log('============================');

    try {
      const verifiedUsers = await client.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN email_verified = true THEN 1 END) as verified,
          COUNT(CASE WHEN email_verified = false THEN 1 END) as unverified
        FROM users
      `);
      
      const stats = verifiedUsers.rows[0];
      console.log(`Total users: ${stats.total}`);
      console.log(`Verified emails: ${stats.verified}`);
      console.log(`Unverified emails: ${stats.unverified}`);
      
      if (stats.total > 0) {
        const verificationRate = ((stats.verified / stats.total) * 100).toFixed(1);
        console.log(`Verification rate: ${verificationRate}%`);
      }
    } catch (error) {
      console.log('Email verification: Unable to check');
    }

    client.release();
    
    if (totalRecords === 0) {
      console.log('\n✅ Database is empty and ready for new registrations');
    } else {
      console.log(`\n📊 Database contains ${totalRecords} total records`);
    }

  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    await pool.end();
  }
}

// Run the check
checkDatabase();