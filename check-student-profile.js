const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'lantern.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Checking Student Profiles in Database\n');

// Get all students
db.all(`
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
  LIMIT 5
`, [], (err, rows) => {
  if (err) {
    console.error('❌ Error:', err);
    db.close();
    return;
  }

  console.log(`Found ${rows.length} student(s):\n`);
  
  rows.forEach((row, index) => {
    console.log(`Student ${index + 1}:`);
    console.log(`  ID: ${row.id}`);
    console.log(`  Email: ${row.email}`);
    console.log(`  Name: ${row.first_name} ${row.last_name}`);
    console.log(`  Grade: ${row.grade || 'NOT SET'}`);
    console.log(`  ZIP Code: ${row.zip_code || 'NOT SET'}`);
    console.log(`  School: ${row.school_name || 'NOT SET'}`);
    console.log('');
  });

  if (rows.length === 0) {
    console.log('⚠️  No students found in database');
  } else {
    const studentsWithoutGrade = rows.filter(r => !r.grade);
    const studentsWithoutZip = rows.filter(r => !r.zip_code);
    
    if (studentsWithoutGrade.length > 0) {
      console.log(`⚠️  ${studentsWithoutGrade.length} student(s) missing grade`);
    }
    if (studentsWithoutZip.length > 0) {
      console.log(`⚠️  ${studentsWithoutZip.length} student(s) missing ZIP code`);
    }
    
    if (studentsWithoutGrade.length === 0 && studentsWithoutZip.length === 0) {
      console.log('✅ All students have grade and ZIP code set');
    }
  }

  db.close();
});
