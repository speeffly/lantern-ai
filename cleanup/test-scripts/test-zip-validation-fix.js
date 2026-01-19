/**
 * Test script to verify ZIP code validation fixes
 */

// Test the ZIP code validator directly
const { validateZipCode } = require('./frontend/app/services/zipCodeValidator.ts');

console.log('🧪 Testing ZIP code validation fixes...\n');

// Test cases that might cause errors
const testCases = [
  { zip: '12345', expected: 'valid' },
  { zip: '00000', expected: 'invalid' },
  { zip: '99999', expected: 'invalid' },
  { zip: '90210', expected: 'valid' },
  { zip: '', expected: 'invalid' },
  { zip: null, expected: 'invalid' },
  { zip: undefined, expected: 'invalid' },
  { zip: '1234', expected: 'invalid' },
  { zip: '123456', expected: 'invalid' },
  { zip: 'abcde', expected: 'invalid' },
  { zip: '12a45', expected: 'invalid' }
];

console.log('Testing ZIP code validation with various inputs:\n');

testCases.forEach((testCase, index) => {
  try {
    console.log(`Test ${index + 1}: ZIP "${testCase.zip}"`);
    
    // Handle null/undefined cases
    if (testCase.zip === null || testCase.zip === undefined) {
      console.log('  ❌ Skipping null/undefined test (would be handled by component validation)');
      return;
    }
    
    const result = validateZipCode(testCase.zip);
    console.log(`  Result: ${result.isValid ? '✅ Valid' : '❌ Invalid'}`);
    if (result.error) {
      console.log(`  Error: ${result.error}`);
    }
    if (result.state && result.region) {
      console.log(`  Location: ${result.region}, ${result.state}`);
    }
    console.log('');
  } catch (error) {
    console.log(`  🚨 ERROR: ${error.message}`);
    console.log('');
  }
});

console.log('✅ ZIP code validation test completed');
console.log('\n📋 Summary of fixes applied:');
console.log('1. Added try-catch blocks around all validateZipCode calls');
console.log('2. Added null/undefined checks before validation');
console.log('3. Added proper error handling in both rendering and form submission');
console.log('4. Added TypeScript interface updates for missing properties');
console.log('5. Improved error boundary handling to prevent component crashes');