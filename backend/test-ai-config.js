// Simple test to verify AI provider configuration
require('dotenv').config();

console.log('🧪 AI Provider Configuration Test');
console.log('='.repeat(40));

console.log('Environment Variables:');
console.log('  AI_PROVIDER:', process.env.AI_PROVIDER || 'not set (defaults to openai)');
console.log('  USE_REAL_AI:', process.env.USE_REAL_AI || 'not set');
console.log('  OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'Present' : 'Missing');
console.log('  GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'Present' : 'Missing');

// Validate configuration
const aiProvider = (process.env.AI_PROVIDER || 'openai').toLowerCase();
const useRealAI = process.env.USE_REAL_AI === 'true';

console.log('\nConfiguration Status:');
console.log('  Selected Provider:', aiProvider);
console.log('  Real AI Enabled:', useRealAI);

if (useRealAI) {
  if (aiProvider === 'openai' && process.env.OPENAI_API_KEY) {
    console.log('  ✅ OpenAI configuration valid');
  } else if (aiProvider === 'gemini' && process.env.GEMINI_API_KEY) {
    console.log('  ✅ Gemini configuration valid');
  } else {
    console.log('  ❌ Configuration invalid - missing API key for', aiProvider);
  }
} else {
  console.log('  ℹ️ Using fallback mode (no AI API required)');
}

console.log('\n🏁 Configuration test complete');