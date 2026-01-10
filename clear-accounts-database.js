/**
 * Clear Accounts Database Script
 * 
 * This script safely clears all user accounts and related data from the database.
 * Use with caution - this will permanently delete all user data!
 */

const { DatabaseServicePG } = require('./backend/dist/services/databaseServicePG');

async function clearAccountsDatabase() {
  console.log('🗑️ Starting database cleanup process...\n');
  
  try {
    // Initialize database connection
    console.log('🔧 Initializing database connection...');
    await DatabaseServicePG.initialize();
    console.log('✅ Database connection established\n');

    // Get current counts before deletion
    console.log('📊 Current database state:');
    const userCount = await DatabaseServicePG.query('SELECT COUNT(*) as count FROM users');
    const tokenCount = await DatabaseServicePG.query('SELECT COUNT(*) as count FROM email_verification_tokens');
    const sessionCount = await DatabaseServicePG.query('SELECT COUNT(*) as count FROM assessment_sessions');
    const relationshipCount = await DatabaseServicePG.query('SELECT COUNT(*) as count FROM user_relationships');
    
    console.log(`   Users: ${userCount.rows[0].count}`);
    console.log(`   Email verification tokens: ${tokenCount.rows[0].count}`);
    console.log(`   Assessment sessions: ${sessionCount.rows[0].count}`);
    console.log(`   User relationships: ${relationshipCount.rows[0].count}`);
    console.log('');

    if (userCount.rows[0].count === 0) {
      console.log('✅ Database is already empty - no cleanup needed');
      return;
    }

    // Confirm deletion (in production, you might want to add a confirmation prompt)
    console.log('⚠️ WARNING: This will permanently delete all user data!');
    console.log('🔄 Proceeding with cleanup in 3 seconds...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Start transaction for safe deletion
    console.log('🔄 Starting database cleanup transaction...');
    await DatabaseServicePG.query('BEGIN');

    try {
      // Delete in correct order to respect foreign key constraints
      
      // 1. Delete email verification tokens
      console.log('🗑️ Clearing email verification tokens...');
      const deletedTokens = await DatabaseServicePG.query('DELETE FROM email_verification_tokens');
      console.log(`   ✅ Deleted ${deletedTokens.rowCount} email verification tokens`);

      // 2. Delete assessment sessions and related data
      console.log('🗑️ Clearing assessment sessions...');
      const deletedSessions = await DatabaseServicePG.query('DELETE FROM assessment_sessions');
      console.log(`   ✅ Deleted ${deletedSessions.rowCount} assessment sessions`);

      // 3. Delete user relationships
      console.log('🗑️ Clearing user relationships...');
      const deletedRelationships = await DatabaseServicePG.query('DELETE FROM user_relationships');
      console.log(`   ✅ Deleted ${deletedRelationships.rowCount} user relationships`);

      // 4. Delete student profiles
      console.log('🗑️ Clearing student profiles...');
      const deletedStudentProfiles = await DatabaseServicePG.query('DELETE FROM student_profiles');
      console.log(`   ✅ Deleted ${deletedStudentProfiles.rowCount} student profiles`);

      // 5. Delete counselor profiles
      console.log('🗑️ Clearing counselor profiles...');
      const deletedCounselorProfiles = await DatabaseServicePG.query('DELETE FROM counselor_profiles');
      console.log(`   ✅ Deleted ${deletedCounselorProfiles.rowCount} counselor profiles`);

      // 6. Delete parent profiles
      console.log('🗑️ Clearing parent profiles...');
      const deletedParentProfiles = await DatabaseServicePG.query('DELETE FROM parent_profiles');
      console.log(`   ✅ Deleted ${deletedParentProfiles.rowCount} parent profiles`);

      // 7. Delete career recommendations
      console.log('🗑️ Clearing career recommendations...');
      try {
        const deletedRecommendations = await DatabaseServicePG.query('DELETE FROM career_recommendations');
        console.log(`   ✅ Deleted ${deletedRecommendations.rowCount} career recommendations`);
      } catch (error) {
        console.log('   ⚠️ Career recommendations table not found or already empty');
      }

      // 8. Delete action plans
      console.log('🗑️ Clearing action plans...');
      try {
        const deletedActionPlans = await DatabaseServicePG.query('DELETE FROM action_plans');
        console.log(`   ✅ Deleted ${deletedActionPlans.rowCount} action plans`);
      } catch (error) {
        console.log('   ⚠️ Action plans table not found or already empty');
      }

      // 9. Finally, delete users (this should cascade to any remaining related data)
      console.log('🗑️ Clearing users...');
      const deletedUsers = await DatabaseServicePG.query('DELETE FROM users');
      console.log(`   ✅ Deleted ${deletedUsers.rowCount} users`);

      // Commit the transaction
      await DatabaseServicePG.query('COMMIT');
      console.log('✅ Transaction committed successfully\n');

      // Reset sequences to start from 1 again
      console.log('🔄 Resetting ID sequences...');
      try {
        await DatabaseServicePG.query('ALTER SEQUENCE users_id_seq RESTART WITH 1');
        await DatabaseServicePG.query('ALTER SEQUENCE email_verification_tokens_id_seq RESTART WITH 1');
        await DatabaseServicePG.query('ALTER SEQUENCE assessment_sessions_id_seq RESTART WITH 1');
        await DatabaseServicePG.query('ALTER SEQUENCE user_relationships_id_seq RESTART WITH 1');
        console.log('✅ ID sequences reset successfully');
      } catch (error) {
        console.log('⚠️ Some sequences could not be reset (this is normal if tables don\'t exist)');
      }

      // Verify cleanup
      console.log('\n📊 Post-cleanup database state:');
      const finalUserCount = await DatabaseServicePG.query('SELECT COUNT(*) as count FROM users');
      const finalTokenCount = await DatabaseServicePG.query('SELECT COUNT(*) as count FROM email_verification_tokens');
      
      console.log(`   Users: ${finalUserCount.rows[0].count}`);
      console.log(`   Email verification tokens: ${finalTokenCount.rows[0].count}`);

      console.log('\n🎉 Database cleanup completed successfully!');
      console.log('✅ All user accounts and related data have been removed');
      console.log('✅ ID sequences have been reset');
      console.log('✅ Database is ready for fresh user registrations');

    } catch (error) {
      // Rollback transaction on error
      await DatabaseServicePG.query('ROLLBACK');
      console.error('❌ Error during cleanup, transaction rolled back:', error);
      throw error;
    }

  } catch (error) {
    console.error('❌ Database cleanup failed:', error);
    process.exit(1);
  }
}

// Additional utility functions

async function showDatabaseStats() {
  console.log('📊 Current Database Statistics:');
  console.log('==============================\n');
  
  try {
    await DatabaseServicePG.initialize();
    
    const tables = [
      'users',
      'email_verification_tokens', 
      'student_profiles',
      'counselor_profiles',
      'parent_profiles',
      'user_relationships',
      'assessment_sessions'
    ];

    for (const table of tables) {
      try {
        const result = await DatabaseServicePG.query(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`${table.padEnd(25)}: ${result.rows[0].count} records`);
      } catch (error) {
        console.log(`${table.padEnd(25)}: Table not found`);
      }
    }
    
    console.log('');
  } catch (error) {
    console.error('❌ Failed to get database stats:', error);
  }
}

async function clearSpecificTable(tableName) {
  console.log(`🗑️ Clearing table: ${tableName}`);
  
  try {
    await DatabaseServicePG.initialize();
    const result = await DatabaseServicePG.query(`DELETE FROM ${tableName}`);
    console.log(`✅ Deleted ${result.rowCount} records from ${tableName}`);
  } catch (error) {
    console.error(`❌ Failed to clear ${tableName}:`, error);
  }
}

// Command line interface
const command = process.argv[2];

switch (command) {
  case 'clear':
    clearAccountsDatabase();
    break;
  case 'stats':
    showDatabaseStats();
    break;
  case 'clear-table':
    const tableName = process.argv[3];
    if (!tableName) {
      console.log('Usage: node clear-accounts-database.js clear-table <table_name>');
      process.exit(1);
    }
    clearSpecificTable(tableName);
    break;
  default:
    console.log('🗑️ Database Cleanup Utility');
    console.log('===========================\n');
    console.log('Usage:');
    console.log('  node clear-accounts-database.js clear        - Clear all user accounts');
    console.log('  node clear-accounts-database.js stats        - Show database statistics');
    console.log('  node clear-accounts-database.js clear-table <name> - Clear specific table');
    console.log('');
    console.log('Examples:');
    console.log('  node clear-accounts-database.js clear');
    console.log('  node clear-accounts-database.js stats');
    console.log('  node clear-accounts-database.js clear-table users');
    console.log('');
    console.log('⚠️ WARNING: The clear command will permanently delete all user data!');
    break;
}

module.exports = {
  clearAccountsDatabase,
  showDatabaseStats,
  clearSpecificTable
};