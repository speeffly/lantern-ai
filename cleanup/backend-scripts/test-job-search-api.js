// Test script to verify job search API with keywords
const API_URL = 'https://lantern-ai.onrender.com';

async function testJobSearchAPI() {
    console.log('🔍 Testing Job Search API...');
    
    const testCases = [
        {
            name: 'Keywords: construction',
            url: `${API_URL}/api/jobs/search?zipCode=78636&keywords=construction&limit=5`
        },
        {
            name: 'Keywords: healthcare',
            url: `${API_URL}/api/jobs/search?zipCode=78636&keywords=healthcare&limit=5`
        },
        {
            name: 'Career: Construction Worker',
            url: `${API_URL}/api/jobs/search?zipCode=78636&career=Construction%20Worker&limit=5`
        },
        {
            name: 'No filters (entry-level)',
            url: `${API_URL}/api/jobs/search?zipCode=78636&limit=5`
        }
    ];

    for (const testCase of testCases) {
        console.log(`\n📋 Testing: ${testCase.name}`);
        console.log(`🔗 URL: ${testCase.url}`);
        
        try {
            const response = await fetch(testCase.url);
            const data = await response.json();
            
            console.log(`📊 Status: ${response.status}`);
            console.log(`✅ Success: ${data.success}`);
            
            if (data.success) {
                console.log(`📈 Jobs found: ${data.data.length}`);
                if (data.data.length > 0) {
                    console.log(`📝 First job: ${data.data[0].title} at ${data.data[0].company}`);
                }
            } else {
                console.log(`❌ Error: ${data.error}`);
            }
            
        } catch (error) {
            console.log(`❌ Network error: ${error.message}`);
        }
    }
}

// Run the test
testJobSearchAPI().catch(console.error);