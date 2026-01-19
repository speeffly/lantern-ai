const fs = require('fs');
const path = require('path');

console.log('🗄️ CLEANING UP DATABASE FILES');
console.log('='.repeat(50));

// Database files found
const dbFiles = [
  { path: 'backend/database.sqlite', name: 'database.sqlite (root)' },
  { path: 'backend/data/lantern_ai.db', name: 'lantern_ai.db (data dir)' },
  { path: 'backend/data/lantern_ai.db-shm', name: 'lantern_ai.db-shm (SQLite shared memory)' },
  { path: 'backend/data/lantern_ai.db-wal', name: 'lantern_ai.db-wal (SQLite WAL file)' }
];

console.log('\n📊 DATABASE FILES ANALYSIS:');
dbFiles.forEach(file => {
  if (fs.existsSync(file.path)) {
    const stats = fs.statSync(file.path);
    const sizeKB = Math.round(stats.size / 1024);
    const modified = stats.mtime.toISOString().split('T')[0];
    console.log(`   📄 ${file.name}: ${sizeKB} KB (modified: ${modified})`);
  } else {
    console.log(`   ❌ ${file.name}: Not found`);
  }
});

// Based on the code analysis, the active database should be:
// - Development: ./data/lantern_ai.db
// - Production: ./lantern_ai.db or /tmp/lantern_ai.db
// The database.sqlite in backend root appears to be outdated

console.log('\n🎯 DATABASE USAGE ANALYSIS:');
console.log('✅ ACTIVE DATABASE FILES:');
console.log('   📄 backend/data/lantern_ai.db - Primary database (development)');
console.log('   📄 backend/data/lantern_ai.db-shm - SQLite shared memory file (active)');
console.log('   📄 backend/data/lantern_ai.db-wal - SQLite write-ahead log (active)');

console.log('\n❌ OUTDATED DATABASE FILES:');
console.log('   📄 backend/database.sqlite - Old database file (appears unused)');

// Create cleanup directory for database files
const cleanupDbDir = 'cleanup/outdated-database-files';
if (!fs.existsSync(cleanupDbDir)) {
  fs.mkdirSync(cleanupDbDir, { recursive: true });
}

// Move outdated database file
console.log('\n🗂️ MOVING OUTDATED DATABASE FILES:');
const outdatedDbFile = 'backend/database.sqlite';

if (fs.existsSync(outdatedDbFile)) {
  try {
    const stats = fs.statSync(outdatedDbFile);
    const sizeKB = Math.round(stats.size / 1024);
    
    console.log(`   📦 Moving database.sqlite (${sizeKB} KB)`);
    
    const targetPath = path.join(cleanupDbDir, 'database.sqlite');
    fs.renameSync(outdatedDbFile, targetPath);
    
    console.log(`   ✅ Moved: database.sqlite to ${cleanupDbDir}`);
  } catch (error) {
    console.log(`   ❌ Failed to move database.sqlite: ${error.message}`);
  }
} else {
  console.log('   ℹ️ database.sqlite not found (already cleaned?)');
}

// Verify active database files
console.log('\n🔍 VERIFYING ACTIVE DATABASE FILES:');
const activeDbFiles = [
  'backend/data/lantern_ai.db',
  'backend/data/lantern_ai.db-shm', 
  'backend/data/lantern_ai.db-wal'
];

activeDbFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const stats = fs.statSync(file);
    const sizeKB = Math.round(stats.size / 1024);
    console.log(`   ✅ ${path.basename(file)}: ${sizeKB} KB`);
  } else {
    console.log(`   ❌ ${path.basename(file)}: Missing`);
  }
});

console.log('\n📊 DATABASE CLEANUP SUMMARY:');
console.log('✅ Active database files preserved in backend/data/');
console.log('❌ Outdated database.sqlite moved to cleanup directory');
console.log('🔧 SQLite WAL and SHM files maintained for performance');

console.log('\n💡 DATABASE FILE EXPLANATION:');
console.log('📄 lantern_ai.db - Main SQLite database file');
console.log('📄 lantern_ai.db-shm - Shared memory file (SQLite performance)');
console.log('📄 lantern_ai.db-wal - Write-Ahead Log file (SQLite transactions)');
console.log('📦 database.sqlite - Old/unused database file (moved to cleanup)');

console.log('\n🎉 DATABASE CLEANUP COMPLETE!');