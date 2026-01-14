/**
 * Test script to verify AI environment variables are loaded correctly
 * Run: node test-ai-env-debug.js
 */

require('dotenv').config({ path: './backend/.env' });

console.log('\n' + '='.repeat(80));
console.log('🔍 AI ENVIRONMENT VARIABLES DEBUG');
console.log('='.repeat(80));

console.log('\n📋 Environment Variables Status:');
console.log('   - NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('   - USE_REAL_AI:', process.env.USE_REAL_AI || 'not set');
console.log('   - AI_PROVIDER:', process.env.AI_PROVIDER || 'not set');

console.log('\n🔑 API Keys Status:');
console.log('   - OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY);
console.log('   - OPENAI_API_KEY length:', process.env.OPENAI_API_KEY?.length || 0);
console.log('   - OPENAI_API_KEY preview:', process.env.OPENAI_API_KEY?.substring(0, 20) + '...' || 'NOT SET');
console.log('   - OPENAI_API_KEY starts with sk-:', process.env.OPENAI_API_KEY?.startsWith('sk-') || false);

console.log('\n   - GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);
console.log('   - GEMINI_API_KEY length:', process.env.GEMINI_API_KEY?.length || 0);

console.log('\n🎯 AI Configuration Analysis:');

const useRealAI = process.env.USE_REAL_AI === 'true';
const aiProvider = (process.env.AI_PROVIDER || 'openai').toLowerCase();
const hasOpenAIKey = !!process.env.OPENAI_API_KEY;
const hasGeminiKey = !!process.env.GEMINI_API_KEY;

console.log('   - USE_REAL_AI parsed as boolean:', useRealAI);
console.log('   - AI_PROVIDER normalized:', aiProvider);

console.log('\n✅ Configuration Check:');

if (!useRealAI) {
  console.log('   ❌ USE_REAL_AI is not set to "true"');
  console.log('   → AI will use fallback mode');
} else {
  console.log('   ✅ USE_REAL_AI is enabled');
}

if (aiProvider === 'openai') {
  if (hasOpenAIKey) {
    console.log('   ✅ OpenAI provider selected and API key is present');
    console.log('   → AI should work with OpenAI');
  } else {
    console.log('   ❌ OpenAI provider selected but API key is missing');
    console.log('   → AI will fail and use fallback mode');
  }
} else if (aiProvider === 'gemini') {
  if (hasGeminiKey) {
    console.log('   ✅ Gemini provider selected and API key is present');
    console.log('   → AI should work with Gemini');
  } else {
    console.log('   ❌ Gemini provider selected but API key is missing');
    console.log('   → AI will fail and use fallback mode');
  }
} else {
  console.log('   ⚠️  Unknown AI provider:', aiProvider);
}

console.log('\n🧪 Quick OpenAI API Key Validation:');

if (process.env.OPENAI_API_KEY) {
  const key = process.env.OPENAI_API_KEY;
  
  // Basic format checks
  const checks = {
    'Starts with sk-': key.startsWith('sk-'),
    'Has reasonable length': key.length > 40 && key.length < 200,
    'Contains only valid chars': /^[a-zA-Z0-9_-]+$/.test(key),
    'Has project prefix': key.startsWith('sk-proj-'),
  };
  
  console.log('   Format checks:');
  Object.entries(checks).forEach(([check, passed]) => {
    console.log(`      ${passed ? '✅' : '❌'} ${check}`);
  });
  
  if (Object.values(checks).every(v => v)) {
    console.log('\n   ✅ API key format looks valid!');
    console.log('   → If AI still fails, the key might be expired or invalid');
  } else {
    console.log('\n   ⚠️  API key format looks suspicious');
    console.log('   → Check if you copied the full key correctly');
  }
} else {
  console.log('   ❌ No OpenAI API key to validate');
}

console.log('\n📝 Recommendations:');

if (!useRealAI) {
  console.log('   1. Set USE_REAL_AI=true in backend/.env');
}

if (!hasOpenAIKey && aiProvider === 'openai') {
  console.log('   2. Add OPENAI_API_KEY=sk-... to backend/.env');
  console.log('      Get a key from: https://platform.openai.com/api-keys');
}

if (useRealAI && hasOpenAIKey) {
  console.log('   ✅ Configuration looks good!');
  console.log('   → If AI still fails, check backend console logs for detailed error messages');
  console.log('   → The API key might be expired or have insufficient credits');
}

console.log('\n' + '='.repeat(80));
console.log('🔍 DEBUG COMPLETE');
console.log('='.repeat(80) + '\n');
