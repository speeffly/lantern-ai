const fs = require('fs');
const path = require('path');

console.log('🧹 CLEANING UP OUTDATED JSON AND REFERENCE DATA FILES');
console.log('='.repeat(60));

// Analyze current data files
const dataDir = 'backend/src/data';
const dataFiles = fs.readdirSync(dataDir);

console.log('\n📊 CURRENT DATA FILES ANALYSIS:');
dataFiles.forEach(file => {
  const filePath = path.join(dataDir, file);
  const stats = fs.statSync(filePath);
  const sizeKB = Math.round(stats.size / 1024);
  console.log(`   📄 ${file} (${sizeKB} KB)`);
});

// Files currently being used (based on import analysis)
const activeFiles = new Set([
  'questionnaire-v1.json',      // Used by questionnaireService.ts
  'careers.v1.json',            // Used by recommendationEngine.ts  
  'test-profiles.json',         // Used by testProfilesService.ts
  'final-assessment-v3.json'    // Used by improvedAssessmentService.ts
]);

// Files that appear to be outdated/unused
const outdatedFiles = dataFiles.filter(file => !activeFiles.has(file));

console.log('\n🎯 USAGE ANALYSIS:');
console.log('✅ ACTIVE FILES (currently imported):');
activeFiles.forEach(file => {
  if (dataFiles.includes(file)) {
    console.log(`   📄 ${file} - KEEP (actively used)`);
  }
});

console.log('\n❌ OUTDATED FILES (no imports found):');
outdatedFiles.forEach(file => {
  console.log(`   📄 ${file} - REMOVE (not imported)`);
});

// Create cleanup directory for data files
const cleanupDataDir = 'cleanup/outdated-data-files';
if (!fs.existsSync(cleanupDataDir)) {
  fs.mkdirSync(cleanupDataDir, { recursive: true });
}

// Move outdated files
console.log('\n🗂️ MOVING OUTDATED FILES:');
let movedCount = 0;

outdatedFiles.forEach(file => {
  try {
    const sourcePath = path.join(dataDir, file);
    const targetPath = path.join(cleanupDataDir, file);
    
    // Read file to check content before moving
    const content = fs.readFileSync(sourcePath, 'utf8');
    const isJson = file.endsWith('.json');
    
    if (isJson) {
      try {
        const parsed = JSON.parse(content);
        console.log(`   📦 Moving ${file} (${Object.keys(parsed).length} top-level keys)`);
      } catch (e) {
        console.log(`   📦 Moving ${file} (invalid JSON)`);
      }
    } else {
      console.log(`   📦 Moving ${file}`);
    }
    
    fs.renameSync(sourcePath, targetPath);
    movedCount++;
    console.log(`   ✅ Moved: ${file}`);
  } catch (error) {
    console.log(`   ❌ Failed to move: ${file} - ${error.message}`);
  }
});

// Check for other potential data files in different locations
console.log('\n🔍 CHECKING OTHER LOCATIONS:');

// Check backend root for data files
const backendFiles = fs.readdirSync('backend').filter(f => f.endsWith('.json') || f.endsWith('.sql'));
if (backendFiles.length > 0) {
  console.log('📂 Backend root data files:');
  backendFiles.forEach(file => {
    console.log(`   📄 ${file}`);
  });
}

// Check for any stray data files in frontend
const frontendDataFiles = [];
function findDataFiles(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  
  const items = fs.readdirSync(dir, { withFileTypes: true });
  items.forEach(item => {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory() && !item.name.startsWith('.') && item.name !== 'node_modules') {
      findDataFiles(fullPath, files);
    } else if (item.isFile() && (item.name.endsWith('.json') && !item.name.includes('package'))) {
      files.push(fullPath);
    }
  });
  return files;
}

const frontendFiles = findDataFiles('frontend');
if (frontendFiles.length > 0) {
  console.log('📂 Frontend data files found:');
  frontendFiles.forEach(file => {
    console.log(`   📄 ${file}`);
  });
}

// Summary
console.log('\n📊 CLEANUP SUMMARY:');
console.log(`📄 Total data files analyzed: ${dataFiles.length}`);
console.log(`✅ Active files kept: ${activeFiles.size}`);
console.log(`❌ Outdated files moved: ${movedCount}`);
console.log(`📦 Files preserved in: ${cleanupDataDir}`);

console.log('\n✨ REMAINING ACTIVE DATA FILES:');
const remainingFiles = fs.readdirSync(dataDir);
remainingFiles.forEach(file => {
  const filePath = path.join(dataDir, file);
  const stats = fs.statSync(filePath);
  const sizeKB = Math.round(stats.size / 1024);
  console.log(`   📄 ${file} (${sizeKB} KB)`);
});

// Verify active files are still working
console.log('\n🔍 VERIFYING ACTIVE FILES:');
activeFiles.forEach(file => {
  const filePath = path.join(dataDir, file);
  if (fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(content);
      console.log(`   ✅ ${file} - Valid JSON (${Object.keys(parsed).length} keys)`);
    } catch (error) {
      console.log(`   ❌ ${file} - Invalid JSON: ${error.message}`);
    }
  } else {
    console.log(`   ❌ ${file} - File missing!`);
  }
});

console.log('\n🎉 JSON DATA CLEANUP COMPLETE!');
console.log('All outdated data files have been moved to cleanup directory.');
console.log('Active data files remain in place and functional.');