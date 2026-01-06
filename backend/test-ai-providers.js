// Test script to validate AI provider configuration and functionality
require('dotenv').config();

async function testAIProviders() {
  console.log('🧪 Testing AI Provider Configuration');
  console.log('='.repeat(50));

  // Test environment variables
  console.log('\n📋 Environment Variables:');
  console.log('   - AI_PROVIDER:', process.env.AI_PROVIDER || 'not set (defaults to openai)');
  console.log('   - USE_REAL_AI:', process.env.USE_REAL_AI || 'not set');
  console.log('   - OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? `Present (${process.env.OPENAI_API_KEY.length} chars)` : 'Missing');
  console.log('   - GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? `Present (${process.env.GEMINI_API_KEY.length} chars)` : 'Missing');

  // Test OpenAI if configured
  if (process.env.OPENAI_API_KEY) {
    console.log('\n🔵 Testing OpenAI Connection...');
    try {
      const OpenAI = require('openai');
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant."
          },
          {
            role: "user",
            content: "Say 'OpenAI connection test successful' in exactly those words."
          }
        ],
        max_tokens: 50,
        temperature: 0,
      });

      const response = completion.choices[0]?.message?.content || '';
      console.log('   ✅ OpenAI Response:', response.trim());
      console.log('   ✅ OpenAI connection successful');
    } catch (error) {
      console.log('   ❌ OpenAI connection failed:', error.message);
    }
  } else {
    console.log('\n🔵 OpenAI: Skipped (no API key)');
  }

  // Test Gemini if configured
  if (process.env.GEMINI_API_KEY) {
    console.log('\n🟢 Testing Gemini Connection...');
    try {
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const result = await model.generateContent("Say 'Gemini connection test successful' in exactly those words.");
      const response = result.response.text();
      console.log('   ✅ Gemini Response:', response.trim());
      console.log('   ✅ Gemini connection successful');
    } catch (error) {
      console.log('   ❌ Gemini connection failed:', error.message);
    }
  } else {
    console.log('\n🟢 Gemini: Skipped (no API key)');
  }

  // Test AI provider selection logic
  console.log('\n🤖 Testing AI Provider Selection Logic...');
  try {
    // Import the AI service (need to build first)
    console.log('   Note: Run "npm run build" first to test the AI service directly');
    
    // Simulate provider selection
    const aiProvider = (process.env.AI_PROVIDER || 'openai').toLowerCase();
    console.log('   - Selected provider:', aiProvider);
    
    if (aiProvider === 'openai' && !process.env.OPENAI_API_KEY) {
      console.log('   ❌ OpenAI selected but API key missing');
    } else if (aiProvider === 'gemini' && !process.env.GEMINI_API_KEY) {
      console.log('   ❌ Gemini selected but API key missing');
    } else if (!['openai', 'gemini'].includes(aiProvider)) {
      console.log('   ❌ Invalid AI provider:', aiProvider);
    } else {
      console.log('   ✅ AI provider configuration valid');
    }
  } catch (error) {
    console.log('   ❌ AI provider selection test failed:', error.message);
  }

  // Configuration recommendations
  console.log('\n💡 Configuration Recommendations:');
  
  if (!process.env.AI_PROVIDER) {
    console.log('   - Set AI_PROVIDER=openai or AI_PROVIDER=gemini');
  }
  
  if (!process.env.USE_REAL_AI) {
    console.log('   - Set USE_REAL_AI=true to enable AI recommendations');
  }
  
  if (!process.env.OPENAI_API_KEY && !process.env.GEMINI_API_KEY) {
    console.log('   - Configure at least one AI provider API key');
    console.log('   - OpenAI: Get key from https://platform.openai.com/api-keys');
    console.log('   - Gemini: Get key from https://makersuite.google.com/app/apikey');
  }

  console.log('\n' + '='.repeat(50));
  console.log('🏁 AI Provider test complete');
}

// Run the test
testAIProviders().catch(console.error);