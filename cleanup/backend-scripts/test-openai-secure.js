// Secure OpenAI API test (loads from environment variables only)
require('dotenv').config();

async function testOpenAI() {
  console.log('🤖 Testing OpenAI API connection...');
  
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ OPENAI_API_KEY not found in environment variables');
    console.log('💡 Make sure to set OPENAI_API_KEY in your .env file');
    return;
  }
  
  console.log('🔑 API Key loaded from environment ✅');
  console.log('🔑 API Key length:', apiKey.length, 'characters');

  try {
    console.log('🔌 Testing basic OpenAI API connection...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: 'Hello! This is a test from Lantern AI. Please respond with "OpenAI connection successful!"'
          }
        ],
        max_tokens: 20,
        temperature: 0.1
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ OpenAI API request failed:', response.status, response.statusText);
      console.error('❌ Error details:', errorData);
      return;
    }

    const data = await response.json();
    console.log('✅ OpenAI API connection successful!');
    console.log('🤖 Model used:', data.model);
    console.log('💬 AI Response:', data.choices[0].message.content);
    console.log('📊 Token usage:', data.usage);

  } catch (error) {
    console.error('❌ OpenAI API test failed:', error.message);
  }
}

console.log('🚀 Starting secure OpenAI API test for Lantern AI...\n');
testOpenAI();