/**
 * Migration script to add full_recommendations column to career_recommendations table
 * Run this once to update existing database
 */

const { Client } = require('pg');
require('dotenv').config();

async function migrate() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Check if column already exists
    const checkColumn = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'career_recommendations' 
      AND column_name = 'full_recommendations'
    `);

    if (checkColumn.rows.length > 0) {
      console.log('✅ Column full_recommendations already exists');
      await client.end();
      return;
    }

    // Add the column
    console.log('📝 Adding full_recommendations column...');
    await client.query(`
      ALTER TABLE career_recommendations 
      ADD COLUMN full_recommendations TEXT
    `);

    console.log('✅ Successfully added full_recommendations column');
    console.log('');
    console.log('IMPORTANT: Users will need to retake assessments to populate this field.');
    console.log('Old assessments will still work but may not have all data (parentSummary, counselorNotes, etc.)');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await client.end();
    console.log('✅ Database connection closed');
  }
}

migrate()
  .then(() => {
    console.log('✅ Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });
