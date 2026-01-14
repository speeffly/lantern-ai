const fetch = require('node-fetch');

async function testProfileData() {
  try {
    // You'll need to replace this with a real token from your browser
    const token = 'YOUR_TOKEN_HERE';
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(`${apiUrl}/api/auth-db/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    console.log('📊 Profile Response:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.success && data.data) {
      console.log('\n🔍 Checking key fields:');
      console.log('- grade:', data.data.grade);
      console.log('- zipCode:', data.data.zipCode);
      console.log('- profile.grade:', data.data.profile?.grade);
      console.log('- profile.zip_code:', data.data.profile?.zip_code);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

console.log('🧪 Testing Profile Data Structure');
console.log('⚠️  Please update the token in this script with a real token from your browser');
console.log('    1. Open browser DevTools (F12)');
console.log('    2. Go to Application > Local Storage');
console.log('    3. Copy the "token" value');
console.log('    4. Replace YOUR_TOKEN_HERE in this script\n');

// testProfileData();
