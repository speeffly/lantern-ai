#!/usr/bin/env node

/**
 * Test script to verify counselor functionality build
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Counselor Functionality Build...');

try {
  // Test TypeScript compilation
  console.log('📦 Testing TypeScript compilation...');
  execSync('npx tsc --noEmit', { stdio: 'inherit' });
  console.log('✅ TypeScript compilation successful!');

  // Test if counselor routes can be imported
  console.log('🔧 Testing counselor routes import...');
  const counselorRoutes = require('./src/routes/counselor.ts');
  console.log('✅ Counselor routes import successful!');

  // Test if counselor service can be imported
  console.log('🔧 Testing counselor service import...');
  const { CounselorService } = require('./src/services/counselorService.ts');
  console.log('✅ Counselor service import successful!');

  console.log('🎉 All counselor functionality tests passed!');
  console.log('🚀 Ready for deployment!');

} catch (error) {
  console.error('❌ Test failed:', error.message);
  process.exit(1);
}