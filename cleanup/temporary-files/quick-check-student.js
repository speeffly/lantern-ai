const { Pool } = require('pg');
require('dotenv').config({ path: './backend/.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function check() {
  try {
    const result = await pool.query(`
      SELECT 
        u.id, u.email, u.first_name, u.last_name,
        sp.grade, sp.zip_code
      FROM users u
      LEFT JOIN student_profiles sp ON u.id = sp.user_id
      WHERE u.role = 'student'
      ORDER BY u.id DESC
      LIMIT 5
    `);

    console.log('\n📊 Recent Students:\n');
    result.rows.forEach(r => {
      console.log(`${r.email}`);
      console.log(`  Grade: ${r.grade || '❌ NOT SET'}`);
      console.log(`  ZIP: ${r.zip_code || '❌ NOT SET'}\n`);
    });

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌', error.message);
    await pool.end();
    process.exit(1);
  }
}

check();
