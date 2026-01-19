const axios = require('axios');

// Debug AI configuration
async function debugAIConfig() {
  console.log('🔧 Debugging AI Configuration...\n');

  const baseURL = process.env.NODE_ENV === 'production' 
    ? 'https://lantern-ai-backend.onrender.com'
    : 'http://localhost:3001';

  try {
    console.log('🚀 Checking AI configuration via debug endpoint...');

    // Try to call a debug endpoint to check AI config
    const response = await axios.get(`${baseURL}/api/debug`, {
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.data) {
      console.log('\n✅ Debug Response Received:');
      console.log(JSON.stringify(response.data, null, 2));
      
      // Check environment variables
      if (response.data.environment) {
        console.log('\n🔧 ENVIRONMENT VARIABLES:');
        console.log('-'.repeat(50));
        console.log(`USE_REAL_AI: ${response.data.environment.USE_REAL_AI}`);
        console.log(`AI_PROVIDER: ${response.data.environment.AI_PROVIDER}`);
        console.log(`OPENAI_API_KEY: ${response.data.environment.OPENAI_API_KEY ? 'SET' : 'NOT SET'}`);
        console.log(`GEMINI_API_KEY: ${response.data.environment.GEMINI_API_KEY ? 'SET' : 'NOT SET'}`);
        
        // Analysis
        if (response.data.environment.USE_REAL_AI === 'true') {
          console.log('\n✅ USE_REAL_AI is correctly set to true');
          
          const provider = response.data.environment.AI_PROVIDER || 'openai';
          console.log(`🤖 AI Provider: ${provider}`);
          
          if (provider === 'openai') {
            if (response.data.environment.OPENAI_API_KEY) {
              console.log('✅ OpenAI API key is configured');
            } else {
              console.log('❌ OpenAI API key is missing!');
            }
          } else if (provider === 'gemini') {
            if (response.data.environment.GEMINI_API_KEY) {
              console.log('✅ Gemini API key is configured');
            } else {
              console.log('❌ Gemini API key is missing!');
            }
          }
        } else {
          console.log('❌ USE_REAL_AI is not set to true');
          console.log('   This explains why you\'re getting fallback recommendations');
        }
      }
    }

  } catch (error) {
    if (error.response?.status === 404) {
      console.log('⚠️  Debug endpoint not available, trying alternative approach...');
      
      // Try to make a test AI call to see what happens
      try {
        console.log('\n🧪 Making test AI call to check configuration...');
        
        const testResponse = await axios.post(`${baseURL}/api/test-ai`, {
          profile: { interests: ['Creative'] },
          answers: [{ questionId: 'interests', answer: 'Creative' }],
          zipCode: '12345',
          currentGrade: 11
        }, {
          timeout: 60000,
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (testResponse.data.success) {
          console.log('✅ Test AI call succeeded');
          
          // Check if the response indicates fallback or real AI
          const recommendations = testResponse.data.recommendations;
          if (recommendations && recommendations.careerPathway) {
            const hasGenericSteps = recommendations.careerPathway.steps?.some(step => 
              step.includes('Complete high school with strong grades') ||
              step.includes('Pursue relevant training') ||
              step.includes('Enter chosen career field')
            );
            
            if (hasGenericSteps) {
              console.log('❌ SYSTEM IS USING FALLBACK RECOMMENDATIONS');
              console.log('   Possible causes:');
              console.log('   1. USE_REAL_AI environment variable is not set to "true"');
              console.log('   2. AI API key is missing or invalid');
              console.log('   3. AI API call is failing and falling back silently');
            } else {
              console.log('✅ SYSTEM IS USING REAL AI');
              console.log('   The issue may be in the AI prompt or parsing logic');
            }
          }
        } else {
          console.log('❌ Test AI call failed:', testResponse.data.error);
        }

      } catch (testError) {
        console.error('❌ Test AI call error:', testError.response?.data || testError.message);
      }
    } else {
      console.error('❌ Debug error:', error.response?.data || error.message);
    }
  }

  console.log('\n🏁 AI Configuration Debug Complete!');
  console.log('\nKey Points to Check:');
  console.log('1. Ensure USE_REAL_AI=true in environment variables');
  console.log('2. Ensure AI_PROVIDER is set (openai or gemini)');
  console.log('3. Ensure the corresponding API key is set and valid');
  console.log('4. Check server logs for AI API errors');
}

// Run the debug
debugAIConfig().catch(console.error);