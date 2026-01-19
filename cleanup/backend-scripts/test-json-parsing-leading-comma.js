const fs = require('fs');
const path = require('path');

// Test the specific JSON parsing issue we're seeing
function testLeadingCommaFix() {
  console.log('🧪 Testing Leading Comma JSON Parsing Fix');
  console.log('='.repeat(80));
  
  // Test cases based on the actual error we're seeing
  const testCases = [
    {
      name: 'Leading comma after opening brace (main issue)',
      input: `{,
  "academicPlan": {
    "currentYear": [
      {
        "courseName": "Biology",
        "reasoning": "Understanding foundational concepts in life sciences",
        "careerConnection": "Directly relevant to healthcare careers"
      }
    ]
  }
}`,
      expectedError: 'Expected property name or \'}\' in JSON at position 4'
    },
    {
      name: 'Multiple leading commas',
      input: `{,,
  "academicPlan": {
    "currentYear": []
  }
}`,
      expectedError: 'Expected property name or \'}\''
    },
    {
      name: 'Leading comma with whitespace',
      input: `{ ,
  "academicPlan": {
    "currentYear": []
  }
}`,
      expectedError: 'Expected property name or \'}\''
    },
    {
      name: 'Leading comma in array',
      input: `{
  "academicPlan": {
    "currentYear": [,
      {
        "courseName": "Biology"
      }
    ]
  }
}`,
      expectedError: 'Unexpected token'
    }
  ];

  // Import the JSON fixing function (simulate it here)
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
      
      // Step 3: Fix common JSON issues that cause parsing errors
      jsonString = jsonString
        // CRITICAL FIX: Remove leading commas after opening braces (main issue causing the error)
        .replace(/{\s*,+\s*/g, '{')
        .replace(/\[\s*,+\s*/g, '[')
        // Fix specific pattern that AI generates: {, "property"
        .replace(/{\s*,\s*"/g, '{"')
        .replace(/\[\s*,\s*"/g, '["')
        // Fix leading commas at start of lines
        .replace(/^\s*,/gm, '')
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
        .replace(/([^,}\]]\s*)(\s*"[^"]*"\s*:)/g, '$1,$2');

      // Try to parse and fix specific errors iteratively
      let attempts = 0;
      const maxAttempts = 5;
      
      while (attempts < maxAttempts) {
        try {
          JSON.parse(jsonString);
          console.log(`✅ JSON cleanup successful after ${attempts + 1} attempt(s)`);
          return jsonString;
        } catch (parseError) {
          attempts++;
          console.log(`🔧 Parse attempt ${attempts} failed, applying targeted fixes...`);
          
          if (parseError instanceof SyntaxError) {
            const errorMessage = parseError.message;
            console.log(`   Error: ${errorMessage}`);
            
            // Fix specific error: Expected property name or '}'
            if (errorMessage.includes("Expected property name or '}'")) {
              console.log('   🔧 Fixing leading comma issue more aggressively...');
              jsonString = jsonString
                .replace(/{\s*,+/g, '{')
                .replace(/,\s*}/g, '}')
                .replace(/,\s*,+/g, ',')
                .replace(/{\s*,\s*"/g, '{"')
                .replace(/\[\s*,\s*"/g, '["')
                .replace(/^\s*,/gm, '')
                .replace(/{\s*,+\s*/g, '{')
                .replace(/\[\s*,+\s*/g, '[');
            }
          }
        }
      }
      
      return jsonString;
      
    } catch (error) {
      console.error('❌ JSON cleanup failed:', error);
      return '{"academicPlan":{"currentYear":[],"nextYear":[],"longTerm":[]},"careerPathway":{"steps":[],"timeline":"2-4 years","requirements":[]},"skillGaps":[],"actionItems":[]}';
    }
  }

  // Test each case
  testCases.forEach((testCase, index) => {
    console.log(`\n${index + 1}. Testing: ${testCase.name}`);
    console.log('Input JSON:');
    console.log(testCase.input.substring(0, 100) + '...');
    
    // First, verify the input actually causes the expected error
    try {
      JSON.parse(testCase.input);
      console.log('⚠️ Input JSON is already valid - test case may be incorrect');
    } catch (originalError) {
      console.log(`✅ Confirmed original error: ${originalError.message}`);
      
      // Now test our fix
      try {
        const fixed = fixMalformedJSON(testCase.input);
        const parsed = JSON.parse(fixed);
        console.log('✅ JSON parsing fix SUCCESSFUL!');
        console.log('Fixed JSON structure:', Object.keys(parsed));
        
        if (parsed.academicPlan) {
          console.log('   - academicPlan found:', Object.keys(parsed.academicPlan));
        }
      } catch (fixError) {
        console.log('❌ JSON parsing fix FAILED:', fixError.message);
        console.log('Fixed JSON preview:', fixMalformedJSON(testCase.input).substring(0, 200));
      }
    }
  });

  console.log('\n' + '='.repeat(80));
  console.log('🎯 SUMMARY');
  console.log('='.repeat(80));
  console.log('The enhanced JSON parsing fix should now handle:');
  console.log('✅ Leading commas after opening braces: {, "property"');
  console.log('✅ Multiple leading commas: {,, "property"');
  console.log('✅ Leading commas with whitespace: { , "property"');
  console.log('✅ Leading commas in arrays: [, "item"');
  console.log('✅ Commas at start of lines');
  console.log('\nThis should resolve the "Expected property name or \'}\'" error.');
}

// Run the test
testLeadingCommaFix();