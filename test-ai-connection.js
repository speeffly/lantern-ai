/**
 * Test AI Connection
 * This script tests if the AI providers are working correctly
 */

const { CleanAIRecommendationService } = require('./backend/dist/services/cleanAIRecommendationService');

async function testAIConnection() {
  console.log('🔍 Testing AI Connection...\n');
  
  // Check environment variables
  console.log('📋 Environment Check:');
  console.log(`   USE_REAL_AI: ${process.env.USE_REAL_AI}`);
  console.log(`   AI_PROVIDER: ${process.env.AI_PROVIDER}`);
  console.log(`   OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? 'Set (' + process.env.OPENAI_API_KEY.substring(0, 10) + '...)' : 'Not set'}`);
  console.log(`   GEMINI_API_KEY: ${process.env.GEMINI_API_KEY ? 'Set' : 'Not set'}\n`);
  
  // Test simple AI call
  try {
    console.log('🤖 Testing AI Call...');
    const testPrompt = 'Return a simple JSON object with a "test" field set to "success": {"test": "success"}';
    
    const response = await CleanAIRecommendationService.callAI(testPrompt);
    console.log('✅ AI Response received:');
    console.log(response);
    
    // Try to parse as JSON
    try {
      const parsed = JSON.parse(response);
      console.log('✅ JSON parsing successful:', parsed);
    } catch (parseError) {
      console.log('❌ JSON parsing failed:', parseError.message);
      console.log('Raw response:', response);
    }
    
  } catch (error) {
    console.log('❌ AI Call failed:');
    console.log('   Error:', error.message);
    console.log('   Stack:', error.stack);
  }
}

// Load environment variables
require('dotenv').config({ path: './backend/.env' });

testAIConnection().catch(console.error);