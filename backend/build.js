#!/usr/bin/env node

/**
 * Simple build script for Render deployment
 * Ensures TypeScript compilation works correctly
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Starting Lantern AI Backend Build...');

try {
  // Check if TypeScript is available
  console.log('📦 Checking TypeScript installation...');
  execSync('npx tsc --version', { stdio: 'inherit' });

  // Clean dist directory
  console.log('🧹 Cleaning dist directory...');
  const distPath = path.join(__dirname, 'dist');
  if (fs.existsSync(distPath)) {
    fs.rmSync(distPath, { recursive: true, force: true });
  }

  // Compile TypeScript
  console.log('🔨 Compiling TypeScript...');
  execSync('npx tsc', { stdio: 'inherit' });

  // Verify compilation
  const indexPath = path.join(__dirname, 'dist', 'index.js');
  if (!fs.existsSync(indexPath)) {
    throw new Error('Compilation failed: dist/index.js not found');
  }

  console.log('✅ Build completed successfully!');
  console.log('📁 Output directory: ./dist');
  console.log('🚀 Ready for deployment!');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}