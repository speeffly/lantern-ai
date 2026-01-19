const fs = require('fs');
const path = require('path');

console.log('🧹 STARTING COMPREHENSIVE CODEBASE CLEANUP');
console.log('='.repeat(60));

// Files to keep in root directory (essential files only)
const keepInRoot = new Set([
  '.gitignore',
  'README.md',
  'package.json',
  'package-lock.json',
  'amplify.yml',
  'render.yaml',
  'ecosystem.config.js'
]);

// Directories to keep
const keepDirectories = new Set([
  '.git',
  '.vscode',
  'backend',
  'frontend',
  'docs',
  'database',
  'data',
  'node_modules'
]);

// Get all files and directories in root
const rootItems = fs.readdirSync('.', { withFileTypes: true });

// Separate files and directories
const rootFiles = rootItems.filter(item => item.isFile()).map(item => item.name);
const rootDirs = rootItems.filter(item => item.isDirectory()).map(item => item.name);

console.log('\n📊 CLEANUP ANALYSIS:');
console.log(`Total root files: ${rootFiles.length}`);
console.log(`Files to keep: ${Array.from(keepInRoot).length}`);
console.log(`Files to remove: ${rootFiles.filter(f => !keepInRoot.has(f)).length}`);

// Create cleanup directories
const cleanupDirs = {
  'cleanup/documentation': [],
  'cleanup/test-scripts': [],
  'cleanup/deployment-scripts': [],
  'cleanup/debug-scripts': [],
  'cleanup/temporary-files': []
};

// Categorize files for removal
const filesToRemove = rootFiles.filter(file => !keepInRoot.has(file));

filesToRemove.forEach(file => {
  if (file.endsWith('.md')) {
    cleanupDirs['cleanup/documentation'].push(file);
  } else if (file.startsWith('test-') && file.endsWith('.js')) {
    cleanupDirs['cleanup/test-scripts'].push(file);
  } else if (file.startsWith('DEPLOY_') || file.endsWith('.bat') || file.endsWith('.sh')) {
    cleanupDirs['cleanup/deployment-scripts'].push(file);
  } else if (file.startsWith('debug-') || file.startsWith('check-') || file.startsWith('diagnose-')) {
    cleanupDirs['cleanup/debug-scripts'].push(file);
  } else {
    cleanupDirs['cleanup/temporary-files'].push(file);
  }
});

// Create cleanup directories and move files
Object.entries(cleanupDirs).forEach(([dir, files]) => {
  if (files.length > 0) {
    // Create directory if it doesn't exist
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    console.log(`\n📁 Moving ${files.length} files to ${dir}:`);
    files.forEach(file => {
      try {
        fs.renameSync(file, path.join(dir, file));
        console.log(`   ✅ Moved: ${file}`);
      } catch (error) {
        console.log(`   ❌ Failed to move: ${file} - ${error.message}`);
      }
    });
  }
});

// Remove unnecessary directories
const dirsToRemove = rootDirs.filter(dir => !keepDirectories.has(dir));
console.log(`\n🗂️ Removing ${dirsToRemove.length} unnecessary directories:`);
dirsToRemove.forEach(dir => {
  try {
    fs.rmSync(dir, { recursive: true, force: true });
    console.log(`   ✅ Removed directory: ${dir}`);
  } catch (error) {
    console.log(`   ❌ Failed to remove directory: ${dir} - ${error.message}`);
  }
});

console.log('\n🎯 CLEANUP SUMMARY:');
console.log(`📄 Documentation files: ${cleanupDirs['cleanup/documentation'].length} moved`);
console.log(`🧪 Test scripts: ${cleanupDirs['cleanup/test-scripts'].length} moved`);
console.log(`🚀 Deployment scripts: ${cleanupDirs['cleanup/deployment-scripts'].length} moved`);
console.log(`🐛 Debug scripts: ${cleanupDirs['cleanup/debug-scripts'].length} moved`);
console.log(`📦 Temporary files: ${cleanupDirs['cleanup/temporary-files'].length} moved`);
console.log(`🗂️ Directories removed: ${dirsToRemove.length}`);

console.log('\n✨ ROOT DIRECTORY NOW CONTAINS:');
const remainingFiles = fs.readdirSync('.', { withFileTypes: true })
  .filter(item => item.isFile())
  .map(item => item.name)
  .sort();

remainingFiles.forEach(file => {
  console.log(`   📄 ${file}`);
});

console.log('\n🎉 CLEANUP COMPLETE!');
console.log('Root directory is now clean and organized.');
console.log('All removed files are preserved in the cleanup/ directory.');