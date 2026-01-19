const { Pool } = require('pg');
require('dotenv').config({ path: './backend/.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkStudentProfiles() {
  try {
    console.log('🔍 Checking Student Profiles in PostgreSQL Database\n');

    // Get all students with their profiles
    const result = await pool.query(`
      SELECT 
        u.id,
        u.email,
        u.first_name,
        u.last_name,
        u.role,
        sp.grade,
        sp.zip_code,
        sp.school_name
      FROM users u
      LEFT JOIN student_profiles sp ON u.id = sp.user_id
      WHERE u.role = 'student'
      ORDER BY u.id DESC
      LIMIT 10
    `);

    console.log(`Found ${result.rows.length} student(s):\n`);
    
    result.rows.forEach((row, index) => {
      console.log(`Student ${index + 1}:`);
      console.log(`  ID: ${row.id}`);
      console.log(`  Email: ${row.email}`);
      console.log(`  Name: ${row.first_name} ${row.last_name}`);
      console.log(`  Grade: ${row.grade || '❌ NOT SET'}`);
      console.log(`  ZIP Code: ${row.zip_code || '❌ NOT SET'}`);
      console.log(`  School: ${row.school_name || 'NOT SET'}`);
      console.log('');
    });

    if (result.rows.length === 0) {
      console.log('⚠️  No students found in database');
    } else {
      const studentsWithoutGrade = result.rows.filter(r => !r.grade);
      const studentsWithoutZip = result.rows.filter(r => !r.zip_code);
      
      console.log('\n📊 Summary:');
      if (studentsWithoutGrade.length > 0) {
        console.log(`  ⚠️  ${studentsWithoutGrade.length} student(s) missing grade`);
      }
      if (studentsWithoutZip.length > 0) {
        console.log(`  ⚠️  ${studentsWithoutZip.length} student(s) missing ZIP code`);
      }
      
      if (studentsWithoutGrade.length === 0 && studentsWithoutZip.length === 0) {
        console.log('  ✅ All students have grade and ZIP code set');
      }
    }

    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
  }
}

checkStudentProfiles();
