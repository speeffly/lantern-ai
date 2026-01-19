const fs = require('fs');
const path = require('path');

console.log('🧹 CLEANING UP BACKEND AND FRONTEND DIRECTORIES');
console.log('='.repeat(60));

// Backend cleanup
console.log('\n📂 BACKEND CLEANUP:');

// Files to keep in backend
const keepInBackend = new Set([
  '.env',
  '.env.example',
  '.gitignore',
  'package.json',
  'package-lock.json',
  'tsconfig.json',
  'database.sqlite',
  'Dockerfile',
  'nixpacks.toml',
  'railway.json',
  'serverless.yml',
  'jest.config.js',
  'build.js'
]);

// Get backend files
const backendFiles = fs.readdirSync('backend', { withFileTypes: true })
  .filter(item => item.isFile())
  .map(item => item.name);

// Create backend cleanup directory
const backendCleanupDir = 'cleanup/backend-scripts';
if (!fs.existsSync(backendCleanupDir)) {
  fs.mkdirSync(backendCleanupDir, { recursive: true });
}

// Move unnecessary backend files
const backendFilesToMove = backendFiles.filter(file => !keepInBackend.has(file));
console.log(`Moving ${backendFilesToMove.length} files from backend:`);

backendFilesToMove.forEach(file => {
  try {
    const sourcePath = path.join('backend', file);
    const targetPath = path.join(backendCleanupDir, file);
    fs.renameSync(sourcePath, targetPath);
    console.log(`   ✅ Moved: ${file}`);
  } catch (error) {
    console.log(`   ❌ Failed to move: ${file} - ${error.message}`);
  }
});

// Frontend cleanup
console.log('\n📂 FRONTEND CLEANUP:');

// Files to keep in frontend
const keepInFrontend = new Set([
  '.env.local',
  '.env.local.example',
  '.env.production',
  '.gitignore',
  '.nvmrc',
  'package.json',
  'package-lock.json',
  'tsconfig.json',
  'tsconfig.tsbuildinfo',
  'next-env.d.ts',
  'next.config.js',
  'postcss.config.js',
  'tailwind.config.js'
]);

// Get frontend files
const frontendFiles = fs.readdirSync('frontend', { withFileTypes: true })
  .filter(item => item.isFile())
  .map(item => item.name);

// Create frontend cleanup directory
const frontendCleanupDir = 'cleanup/frontend-test-files';
if (!fs.existsSync(frontendCleanupDir)) {
  fs.mkdirSync(frontendCleanupDir, { recursive: true });
}

// Move unnecessary frontend files
const frontendFilesToMove = frontendFiles.filter(file => !keepInFrontend.has(file));
console.log(`Moving ${frontendFilesToMove.length} files from frontend:`);

frontendFilesToMove.forEach(file => {
  try {
    const sourcePath = path.join('frontend', file);
    const targetPath = path.join(frontendCleanupDir, file);
    fs.renameSync(sourcePath, targetPath);
    console.log(`   ✅ Moved: ${file}`);
  } catch (error) {
    console.log(`   ❌ Failed to move: ${file} - ${error.message}`);
  }
});

// Clean up unnecessary directories
console.log('\n🗂️ CLEANING UP BUILD DIRECTORIES:');

const dirsToClean = [
  'backend/dist',
  'frontend/.next',
  'frontend/out'
];

dirsToClean.forEach(dir => {
  if (fs.existsSync(dir)) {
    try {
      fs.rmSync(dir, { recursive: true, force: true });
      console.log(`   ✅ Removed: ${dir}`);
    } catch (error) {
      console.log(`   ❌ Failed to remove: ${dir} - ${error.message}`);
    }
  } else {
    console.log(`   ℹ️ Not found: ${dir}`);
  }
});

console.log('\n📊 CLEANUP SUMMARY:');
console.log(`🔧 Backend files moved: ${backendFilesToMove.length}`);
console.log(`🎨 Frontend files moved: ${frontendFilesToMove.length}`);
console.log(`🗂️ Build directories cleaned: ${dirsToClean.length}`);

console.log('\n✨ REMAINING BACKEND FILES:');
const remainingBackendFiles = fs.readdirSync('backend', { withFileTypes: true })
  .filter(item => item.isFile())
  .map(item => item.name)
  .sort();

remainingBackendFiles.forEach(file => {
  console.log(`   📄 ${file}`);
});

console.log('\n✨ REMAINING FRONTEND FILES:');
const remainingFrontendFiles = fs.readdirSync('frontend', { withFileTypes: true })
  .filter(item => item.isFile())
  .map(item => item.name)
  .sort();

remainingFrontendFiles.forEach(file => {
  console.log(`   📄 ${file}`);
});

console.log('\n🎉 BACKEND AND FRONTEND CLEANUP COMPLETE!');