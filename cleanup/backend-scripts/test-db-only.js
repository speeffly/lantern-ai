// Simple PostgreSQL connection test (no server startup)
require('dotenv').config();
const { Pool } = require('pg');

async function testDatabaseOnly() {
  console.log('🐘 Testing PostgreSQL connection only...');
  
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL not found in environment variables');
    return;
  }
  
  console.log('🔗 Database URL configured ✅');

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
    max: 2, // Small pool for testing
    connectionTimeoutMillis: 10000,
  });

  try {
    console.log('🔌 Testing connection...');
    const client = await pool.connect();
    console.log('✅ PostgreSQL connection successful!');
    
    // Test basic query
    const result = await client.query('SELECT NOW() as current_time');
    console.log('⏰ Current time:', result.rows[0].current_time);
    
    // Test table creation (simple)
    await client.query(`
      CREATE TABLE IF NOT EXISTS test_simple (
        id SERIAL PRIMARY KEY,
        message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Simple table creation successful!');
    
    // Test insert
    const insertResult = await client.query(`
      INSERT INTO test_simple (message) VALUES ($1) RETURNING id
    `, ['Connection test - ' + new Date().toISOString()]);
    console.log('✅ Insert successful! ID:', insertResult.rows[0].id);
    
    // Clean up
    await client.query('DROP TABLE IF EXISTS test_simple');
    console.log('✅ Cleanup successful!');
    
    client.release();
    console.log('\n🎉 PostgreSQL database connection is WORKING!');
    console.log('✅ Your local server CAN connect to Render PostgreSQL!');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('🔍 Error code:', error.code);
  } finally {
    await pool.end();
  }
}

testDatabaseOnly();