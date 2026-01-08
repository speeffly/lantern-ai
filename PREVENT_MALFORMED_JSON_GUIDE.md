# How to Prevent Malformed JSON from AI

## Problem
AI models (OpenAI, Gemini) sometimes generate malformed JSON that fails to parse, causing the system to fall back to generic recommendations instead of using the AI-generated content.

## Root Causes of Malformed JSON
1. **Trailing commas** after last array/object items
2. **Unescaped quotes** inside string values
3. **Single quotes** instead of double quotes
4. **Comments or explanations** mixed with JSON
5. **Line breaks** inside string values
6. **Missing closing brackets/braces**
7. **Incorrect data types** (strings without quotes)

## Prevention Strategies Implemented

### 1. Enhanced Prompt Instructions
Added comprehensive JSON formatting requirements to both OpenAI and Gemini prompts:

```
JSON FORMATTING REQUIREMENTS - CRITICAL:
1. Respond with ONLY valid JSON - no text before or after
2. Use double quotes for all strings - never single quotes
3. No trailing commas after the last item in arrays or objects
4. Escape quotes inside strings with backslash: "He said \"hello\""
5. No comments or explanations - pure JSON only
6. Ensure all brackets and braces are properly closed
7. Use proper JSON data types: strings in quotes, numbers without quotes, booleans as true/false
8. No line breaks inside string values - use \\n if needed

MANDATORY: Test your JSON before responding - it must parse without errors.
```

### 2. OpenAI-Specific Improvements
- **Lower temperature**: Changed from 0.7 to 0.3 for more consistent formatting
- **JSON response format**: Added `response_format: { type: "json_object" }` to force JSON output
- **Enhanced system prompt**: Added explicit JSON-only instruction

### 3. Model-Specific Optimizations

#### For OpenAI (GPT-3.5/GPT-4):
```typescript
response_format: { type: "json_object" }, // Forces JSON response
temperature: 0.3, // More consistent formatting
```

#### For Gemini:
```typescript
// Use specific generation config for JSON
const generationConfig = {
  temperature: 0.3,
  topK: 1,
  topP: 0.8,
  maxOutputTokens: 4000,
};
```

### 4. Prompt Engineering Best Practices

#### ✅ Good Prompt Structure:
```
SYSTEM: You are a career coach. Respond with valid JSON only.

USER: [Context]

JSON FORMATTING REQUIREMENTS:
[Detailed formatting rules]

MANDATORY: Test your JSON before responding.

Provide response in this exact format:
{
  "property": "value"
}
```

#### ❌ Poor Prompt Structure:
```
Generate career recommendations in JSON format.
```

### 5. Additional Prevention Techniques

#### A. Use Examples in Prompts
Show the AI exactly what valid JSON looks like:

```
EXAMPLE OF VALID JSON:
{
  "careerPathway": {
    "steps": [
      "Complete high school with focus on Biology courses",
      "Pursue Associate degree in Nursing"
    ],
    "timeline": "4 years",
    "requirements": ["High school diploma", "Nursing license"]
  }
}
```

#### B. Validate Template Structure
Ensure the JSON template in the prompt is itself valid:

```javascript
// Test the template before using it in prompts
const template = {
  "academicPlan": { "currentYear": [] },
  "careerPathway": { "steps": [], "timeline": "", "requirements": [] }
};
console.log(JSON.stringify(template)); // Must not throw error
```

#### C. Use Structured Prompts
Break down complex requests into structured sections:

```
1. STUDENT ANALYSIS: [context]
2. FORMATTING RULES: [JSON requirements]  
3. OUTPUT TEMPLATE: [exact JSON structure]
4. VALIDATION: Test your JSON before responding
```

## Advanced Techniques

### 1. JSON Schema Validation
Add JSON schema to prompts for complex structures:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["academicPlan", "careerPathway"],
  "properties": {
    "academicPlan": {
      "type": "object",
      "required": ["currentYear"]
    }
  }
}
```

### 2. Multi-Step Validation
```
Step 1: Generate content
Step 2: Format as JSON
Step 3: Validate JSON syntax
Step 4: Return only if valid
```

### 3. Fallback Prompts
If first attempt fails, try simpler structure:

```
SIMPLIFIED REQUEST: Generate only the career pathway steps as a JSON array:
["step1", "step2", "step3"]
```

## Implementation Checklist

### ✅ Prompt Improvements
- [x] Added detailed JSON formatting requirements
- [x] Specified exact data types and quoting rules
- [x] Added validation instruction
- [x] Removed ambiguous language

### ✅ API Configuration
- [x] Lowered temperature for consistency
- [x] Added JSON response format (OpenAI)
- [x] Enhanced system prompts

### ✅ Error Prevention
- [x] Clear examples of valid JSON
- [x] Explicit rules about common errors
- [x] Mandatory validation instruction

### 🔄 Future Improvements
- [ ] Add JSON schema to prompts
- [ ] Implement multi-step validation
- [ ] Create fallback simplified prompts
- [ ] Add response validation before parsing

## Testing the Improvements

### Test Script
```javascript
// Test if AI generates valid JSON
const response = await callAI(prompt);
try {
  JSON.parse(response);
  console.log('✅ Valid JSON generated');
} catch (error) {
  console.log('❌ Invalid JSON:', error.message);
}
```

### Success Metrics
- **JSON Parse Success Rate**: Should be >95%
- **Fallback Usage**: Should be <5%
- **Content Quality**: AI-generated content preserved
- **Response Time**: No significant increase

## Common JSON Errors and Prevention

### Error: Trailing Comma
```json
// ❌ Bad
{
  "steps": ["step1", "step2",],
  "timeline": "4 years",
}

// ✅ Good  
{
  "steps": ["step1", "step2"],
  "timeline": "4 years"
}
```

### Error: Unescaped Quotes
```json
// ❌ Bad
{
  "description": "He said "hello" to me"
}

// ✅ Good
{
  "description": "He said \"hello\" to me"
}
```

### Error: Single Quotes
```json
// ❌ Bad
{
  'property': 'value'
}

// ✅ Good
{
  "property": "value"
}
```

## Monitoring and Maintenance

### Log JSON Errors
```javascript
catch (parseError) {
  console.error('JSON Parse Error:', parseError.message);
  console.error('Raw Response:', response.substring(0, 500));
  // Send to monitoring system
}
```

### Track Success Rates
```javascript
const metrics = {
  totalRequests: 0,
  successfulParses: 0,
  fallbackUsed: 0
};
```

### Regular Prompt Updates
- Monitor error patterns
- Update prompts based on common failures
- Test new AI model versions
- Refine formatting requirements

This comprehensive approach should significantly reduce malformed JSON responses and improve the reliability of AI-generated career pathways.