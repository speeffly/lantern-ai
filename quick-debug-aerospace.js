const axios = require('axios');

async function quickDebug() {
  try {
    console.log('🔍 Quick Debug: Testing Aerospace Engineer Bug');
    
    // Test 1: Check if careers endpoint is working
    console.log('\n1. Testing careers endpoint...');
    const response = await axios.get('http://localhost:3002/api/careers/all');
    
    if (response.data.success) {
      const careers = response.data.data;
      console.log('   Total careers:', careers.length);
      
      // Look for Aerospace Engineer
      const aerospace = careers.find(c => c.title === 'Aerospace Engineer');
      console.log('   Aerospace Engineer found:', !!aerospace);
      if (aerospace) {
        console.log('   Details:', {
          id: aerospace.id,
          title: aerospace.title,
          sector: aerospace.sector,
          salary: aerospace.averageSalary
        });
      }
      
      // Look for Photographer
      const photographer = careers.find(c => c.title === 'Photographer');
      console.log('   Photographer found:', !!photographer);
      if (photographer) {
        console.log('   Details:', {
          id: photographer.id,
          title: photographer.title,
          sector: photographer.sector,
          salary: photographer.averageSalary
        });
      }
      
      // Show all engineering careers
      const engineeringCareers = careers.filter(c => 
        c.title.toLowerCase().includes('engineer') || 
        c.sector === 'Infrastructure' ||
        c.sector === 'Technology'
      );
      console.log('\n   Engineering/Tech careers found:');
      engineeringCareers.forEach(career => {
        console.log(`   - ${career.title} (${career.sector})`);
      });
      
    } else {
      console.log('   ❌ Failed to get careers:', response.data.error);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('   Backend not running on port 3002');
    }
  }
}

quickDebug();