const fs = require('fs');

console.log('🔍 VERIFYING CODEBASE CLEANUP');
console.log('='.repeat(50));

// Check root directory
const rootItems = fs.readdirSync('.', { withFileTypes: true });
const rootFiles = rootItems.filter(item => item.isFile()).map(item => item.name);
const rootDirs = rootItems.filter(item => item.isDirectory()).map(item => item.name);

console.log('\n📁 ROOT DIRECTORY STATUS:');
console.log(`Files: ${rootFiles.length}`);
console.log(`Directories: ${rootDirs.length}`);

console.log('\n📄 Root Files:');
rootFiles.forEach(file => console.log(`   ✅ ${file}`));

console.log('\n📂 Root Directories:');
rootDirs.forEach(dir => console.log(`   📁 ${dir}`));

// Check essential files exist
const essentialFiles = [
  '.gitignore',
  'README.md', 
  'package.json',
  'package-lock.json',
  'amplify.yml',
  'render.yaml',
  'ecosystem.config.js'
];

console.log('\n🎯 ESSENTIAL FILES CHECK:');
essentialFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`   ${exists ? '✅' : '❌'} ${file}`);
});

// Check cleanup directory
console.log('\n🧹 CLEANUP DIRECTORY:');
if (fs.existsSync('cleanup')) {
  const cleanupDirs = fs.readdirSync('cleanup', { withFileTypes: true })
    .filter(item => item.isDirectory())
    .map(item => item.name);
  
  cleanupDirs.forEach(dir => {
    const count = fs.readdirSync(`cleanup/${dir}`).length;
    console.log(`   📦 ${dir}: ${count} files`);
  });
} else {
  console.log('   ❌ Cleanup directory not found');
}

// Check backend and frontend
console.log('\n🔧 BACKEND STATUS:');
const backendFiles = fs.readdirSync('backend', { withFileTypes: true })
  .filter(item => item.isFile())
  .map(item => item.name);
console.log(`   Files: ${backendFiles.length}`);
console.log(`   Essential configs: ${backendFiles.includes('package.json') ? '✅' : '❌'}`);

console.log('\n🎨 FRONTEND STATUS:');
const frontendFiles = fs.readdirSync('frontend', { withFileTypes: true })
  .filter(item => item.isFile())
  .map(item => item.name);
console.log(`   Files: ${frontendFiles.length}`);
console.log(`   Essential configs: ${frontendFiles.includes('package.json') ? '✅' : '❌'}`);

// Final assessment
const isClean = rootFiles.length <= 10 && 
               essentialFiles.every(f => fs.existsSync(f)) &&
               fs.existsSync('cleanup');

console.log('\n🏆 CLEANUP VERIFICATION:');
console.log(`   Status: ${isClean ? '✅ CLEAN' : '❌ NEEDS ATTENTION'}`);
console.log(`   Root files: ${rootFiles.length <= 10 ? '✅' : '❌'} (${rootFiles.length}/10 max)`);
console.log(`   Essential files: ${essentialFiles.every(f => fs.existsSync(f)) ? '✅' : '❌'}`);
console.log(`   Cleanup preserved: ${fs.existsSync('cleanup') ? '✅' : '❌'}`);

if (isClean) {
  console.log('\n🎉 CODEBASE CLEANUP SUCCESSFUL!');
  console.log('   • Root directory is clean and organized');
  console.log('   • All essential files are present');
  console.log('   • Historical files are preserved in cleanup/');
  console.log('   • Project is ready for development');
} else {
  console.log('\n⚠️ CLEANUP VERIFICATION FAILED');
  console.log('   Please review the issues above');
}