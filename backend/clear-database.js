/**
 * Simple Database Clearing Script
 * Run this from the backend directory: node clear-database.js
 */

require('dotenv').config();
const { Pool } = require('pg');

async function clearDatabase() {
  console.log('🗑️ Clearing accounts database...\n');
  
  // Create database connection
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    // Test connection
    console.log('🔧 Connecting to database...');
    const client = await pool.connect();
    console.log('✅ Connected successfully\n');

    // Get current counts
    console.log('📊 Current database state:');
    try {
      const userCount = await client.query('SELECT COUNT(*) as count FROM users');
      console.log(`   Users: ${userCount.rows[0].count}`);
    } catch (e) {
      console.log('   Users table: Not found');
    }

    try {
      const tokenCount = await client.query('SELECT COUNT(*) as count FROM email_verification_tokens');
      console.log(`   Email tokens: ${tokenCount.rows[0].count}`);
    } catch (e) {
      console.log('   Email tokens table: Not found');
    }

    console.log('\n🔄 Starting cleanup...');

    // Clear tables in safe order
    const tablesToClear = [
      'email_verification_tokens',
      'assessment_sessions', 
      'user_relationships',
      'student_profiles',
      'counselor_profiles', 
      'parent_profiles',
      'career_recommendations',
      'action_plans',
      'users'
    ];

    let totalDeleted = 0;

    for (const table of tablesToClear) {
      try {
        const result = await client.query(`DELETE FROM ${table}`);
        const deleted = result.rowCount || 0;
        if (deleted > 0) {
          console.log(`   ✅ ${table}: ${deleted} records deleted`);
          totalDeleted += deleted;
        }
      } catch (error) {
        console.log(`   ⚠️ ${table}: Table not found or already empty`);
      }
    }

    // Reset sequences
    console.log('\n🔄 Resetting ID sequences...');
    const sequences = [
      'users_id_seq',
      'email_verification_tokens_id_seq',
      'assessment_sessions_id_seq',
      'user_relationships_id_seq'
    ];

    for (const seq of sequences) {
      try {
        await client.query(`ALTER SEQUENCE ${seq} RESTART WITH 1`);
        console.log(`   ✅ ${seq} reset`);
      } catch (error) {
        // Sequence might not exist, that's ok
      }
    }

    client.release();
    
    console.log(`\n🎉 Cleanup completed!`);
    console.log(`   Total records deleted: ${totalDeleted}`);
    console.log('   Database is ready for fresh registrations');

  } catch (error) {
    console.error('❌ Error clearing database:', error);
  } finally {
    await pool.end();
  }
}

// Run the cleanup
clearDatabase();