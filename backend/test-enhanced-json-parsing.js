console.log('🧪 Testing Enhanced JSON Parsing');
console.log('='.repeat(50));

// Test cases based on actual production errors
const testCases = [
  {
    name: 'Leading comma error',
    input: `{,"academicPlan": {"currentYear": [{"courseName": "Biology and Chemistry","reasoning": "Building a strong foundation in science"}]}}`,
    expectedError: 'Expected property name or \'}\' in JSON at position 4'
  },
  {
    name: 'Missing comma between properties',
    input: `{"academicPlan": {"currentYear": [{"courseName": "Biology""reasoning": "Foundation"}]}}`,
    expectedError: 'Expected \',\' or \'}\' after property value'
  },
  {
    name: 'Missing comma in array',
    input: `{"academicPlan": {"currentYear": [{"courseName": "Biology"}{"courseName": "Chemistry"}]}}`,
    expectedError: 'Expected \',\' or \']\' after array element'
  },
  {
    name: 'Unescaped quotes',
    input: `{"academicPlan": {"currentYear": [{"courseName": "Biology "Advanced" Course"}]}}`,
    expectedError: 'Unexpected token'
  },
  {
    name: 'Multiple issues combined',
    input: `{,"academicPlan": {"currentYear": [{"courseName": "Biology""reasoning": "Foundation"}{"courseName": "Chemistry"}],"nextYear": []}}`,
    expectedError: 'Multiple parsing errors'
  }
];

// Enhanced JSON fixing function (simplified version for testing)
function fixMalformedJSON(aiResponse) {
  try {
    console.log('🔧 Starting comprehensive JSON cleanup...');
    
    // Step 1: Initial cleanup
    let cleaned = aiResponse
      .replace(/```json\s*/gi, '')
      .replace(/```\s*$/g, '')
      .replace(/```/g, '')
      .replace(/^[^{]*/, '')
      .replace(/}[^}]*$/, '}')
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      .trim();

    let jsonStart = cleaned.indexOf('{');
    let jsonEnd = cleaned.lastIndexOf('}');
    
    if (jsonStart === -1 || jsonEnd === -1 || jsonStart >= jsonEnd) {
      throw new Error('No valid JSON structure found');
    }
    
    let jsonString = cleaned.substring(jsonStart, jsonEnd + 1);
    
    // Step 2: Fix common JSON issues
    jsonString = jsonString
      // Fix leading commas after opening braces (common AI error)
      .replace(/{\s*,/g, '{')
      .replace(/\[\s*,/g, '[')
      // Fix missing quotes around property names
      .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":')
      // Fix trailing commas
      .replace(/,(\s*[}\]])/g, '$1')
      // Fix multiple consecutive commas
      .replace(/,\s*,+/g, ',')
      // Fix missing commas between properties
      .replace(/"\s*\n\s*"/g, '",\n"')
      .replace(/}\s*\n\s*"/g, '},\n"')
      .replace(/]\s*\n\s*"/g, '],\n"')
      .replace(/([^,}\]]\s*)(\s*"[^"]*"\s*:)/g, '$1,$2')
      // Fix array elements without commas
      .replace(/}\s*{/g, '},{')
      .replace(/]\s*\[/g, '],[')
      // Fix missing commas after array elements
      .replace(/}\s*]/g, '}]')
      .replace(/"\s*]/g, '"]');

    // Step 3: Balance braces and brackets
    const openBraces = (jsonString.match(/{/g) || []).length;
    const closeBraces = (jsonString.match(/}/g) || []).length;
    const openBrackets = (jsonString.match(/\[/g) || []).length;
    const closeBrackets = (jsonString.match(/\]/g) || []).length;
    
    for (let i = closeBraces; i < openBraces; i++) {
      jsonString += '}';
    }
    
    for (let i = closeBrackets; i < openBrackets; i++) {
      jsonString += ']';
    }

    // Step 4: Iterative error fixing
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      try {
        JSON.parse(jsonString);
        console.log(`✅ JSON cleanup successful after ${attempts + 1} attempt(s)`);
        return jsonString;
      } catch (parseError) {
        attempts++;
        console.log(`🔧 Parse attempt ${attempts} failed: ${parseError.message}`);
        
        if (parseError instanceof SyntaxError) {
          const errorMessage = parseError.message;
          
          // Fix specific errors
          if (errorMessage.includes("Expected property name or '}'")) {
            jsonString = jsonString
              .replace(/{\s*,/g, '{')
              .replace(/,\s*}/g, '}')
              .replace(/,\s*,/g, ',');
          }
          
          if (errorMessage.includes("Expected ',' or '}'")) {
            const positionMatch = errorMessage.match(/position (\d+)/);
            if (positionMatch) {
              const position = parseInt(positionMatch[1]);
              const beforeError = jsonString.substring(0, position);
              const afterError = jsonString.substring(position);
              
              if (afterError.match(/^\s*"/)) {
                jsonString = beforeError + ',' + afterError;
              } else if (afterError.match(/^\s*}/)) {
                const cleanAfter = afterError.replace(/^[^"}]*/, '');
                jsonString = beforeError + cleanAfter;
              }
            } else {
              jsonString = jsonString
                .replace(/([^,}\]]\s*)(\s*"[^"]*"\s*:)/g, '$1,$2')
                .replace(/,\s*,/g, ',');
            }
          }
          
          if (errorMessage.includes("Expected ',' or ']'")) {
            jsonString = jsonString
              .replace(/([^,\]]\s*)(\s*[{\[])/g, '$1,$2')
              .replace(/,\s*,/g, ',');
          }
        }
      }
    }
    
    console.log('⚠️ JSON cleanup partially successful');
    return jsonString;
    
  } catch (error) {
    console.error('❌ JSON cleanup failed:', error);
    return '{"academicPlan":{"currentYear":[],"nextYear":[],"longTerm":[]},"careerPathway":{"steps":[],"timeline":"2-4 years","requirements":[]},"skillGaps":[],"actionItems":[]}';
  }
}

// Run tests
console.log('\n🧪 Running JSON parsing tests...\n');

testCases.forEach((testCase, index) => {
  console.log(`Test ${index + 1}: ${testCase.name}`);
  console.log(`Input: ${testCase.input.substring(0, 80)}...`);
  
  // First, verify the input actually fails to parse
  try {
    JSON.parse(testCase.input);
    console.log('⚠️ Warning: Test input is already valid JSON');
  } catch (error) {
    console.log(`✅ Confirmed error: ${error.message.substring(0, 60)}...`);
  }
  
  // Test our fix
  try {
    const fixed = fixMalformedJSON(testCase.input);
    const parsed = JSON.parse(fixed);
    console.log('✅ Successfully fixed and parsed JSON');
    console.log(`Fixed: ${fixed.substring(0, 80)}...`);
    
    // Verify structure
    if (parsed.academicPlan) {
      console.log('✅ Academic plan structure preserved');
    }
  } catch (error) {
    console.log(`❌ Fix failed: ${error.message}`);
  }
  
  console.log('-'.repeat(50));
});

console.log('\n🎉 Enhanced JSON parsing test completed!');
console.log('\nKey improvements:');
console.log('- Fixes leading commas after opening braces');
console.log('- Handles missing commas between properties');
console.log('- Fixes array element separation issues');
console.log('- Iterative error fixing with multiple attempts');
console.log('- Position-specific error correction');
console.log('- Comprehensive fallback strategies');