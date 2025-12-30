// Test PostgreSQL connection to Render database
require('dotenv').config();
const { Pool } = require('pg');

async function testPostgreSQLConnection() {
  console.log('🐘 Testing PostgreSQL connection to Render...');
  
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL not found in environment variables');
    return;
  }
  
  console.log('🔗 Database URL configured ✅');
  console.log('🔗 Host:', databaseUrl.split('@')[1].split('/')[0]);

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false } // Required for Render PostgreSQL
  });

  try {
    console.log('🔌 Attempting to connect...');
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL successfully!');
    
    // Test basic query
    console.log('🔍 Testing basic query...');
    const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
    console.log('✅ Query successful!');
    console.log('⏰ Current time:', result.rows[0].current_time);
    console.log('🐘 PostgreSQL version:', result.rows[0].pg_version.substring(0, 50) + '...');
    
    // Test table operations
    console.log('🔧 Testing table operations...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS connection_test (
        id SERIAL PRIMARY KEY,
        message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table creation successful!');
    
    // Insert test data
    const insertResult = await client.query(`
      INSERT INTO connection_test (message) VALUES ($1) RETURNING id
    `, ['Local connection test - ' + new Date().toISOString()]);
    console.log('✅ Insert operation successful! ID:', insertResult.rows[0].id);
    
    // Query test data
    const selectResult = await client.query('SELECT * FROM connection_test ORDER BY created_at DESC LIMIT 1');
    console.log('✅ Select operation successful!');
    console.log('📄 Latest record:', selectResult.rows[0]);
    
    // Clean up
    await client.query('DROP TABLE IF EXISTS connection_test');
    console.log('✅ Cleanup successful!');
    
    client.release();
    console.log('\n🎉 PostgreSQL connection test PASSED!');
    console.log('✅ Your local server CAN connect to Render PostgreSQL database!');
    
  } catch (error) {
    console.error('❌ PostgreSQL connection test FAILED:', error.message);
    console.error('🔍 Full error:', error);
  } finally {
    await pool.end();
    console.log('🔌 Connection pool closed');
  }
}

testPostgreSQLConnection();