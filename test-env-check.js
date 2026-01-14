/**
 * Quick environment variable check
 */

require('dotenv').config({ path: './backend/.env' });

console.log('🔍 Environment Variable Check\n');
console.log('='.repeat(50));
console.log('USE_REAL_AI:', process.env.USE_REAL_AI);
console.log('AI_PROVIDER:', process.env.AI_PROVIDER);
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? `${process.env.OPENAI_API_KEY.substring(0, 20)}...` : 'NOT SET');
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'SET' : 'NOT SET');
console.log('='.repeat(50));

// Check the actual boolean evaluation
console.log('\n📊 Boolean Evaluation:');
console.log('USE_REAL_AI === "true":', process.env.USE_REAL_AI === 'true');
console.log('typeof USE_REAL_AI:', typeof process.env.USE_REAL_AI);
console.log('='.repeat(50));

// Check if OpenAI key is valid format
if (process.env.OPENAI_API_KEY) {
  const key = process.env.OPENAI_API_KEY;
  console.log('\n🔑 OpenAI Key Analysis:');
  console.log('Length:', key.length);
  console.log('Starts with sk-:', key.startsWith('sk-'));
  console.log('Contains spaces:', key.includes(' '));
  console.log('First 30 chars:', key.substring(0, 30));
  console.log('='.repeat(50));
}
