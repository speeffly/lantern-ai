// Test script to verify counselor authentication
const API_URL = 'https://lantern-ai.onrender.com';

async function testCounselorAuth() {
    console.log('🔍 Testing Counselor Authentication...');
    
    // Test login with a counselor account
    const loginData = {
        email: 'counselor@test.com', // Replace with actual counselor email
        password: 'password123'      // Replace with actual password
    };
    
    console.log('\n📋 Step 1: Testing counselor login');
    console.log(`🔗 URL: ${API_URL}/api/auth-db/login`);
    
    try {
        const loginResponse = await fetch(`${API_URL}/api/auth-db/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });
        
        const loginResult = await loginResponse.json();
        
        console.log(`📊 Login Status: ${loginResponse.status}`);
        console.log(`✅ Login Success: ${loginResult.success}`);
        
        if (!loginResult.success) {
            console.log(`❌ Login Error: ${loginResult.error}`);
            return;
        }
        
        const token = loginResult.data.token;
        const user = loginResult.data.user;
        
        console.log(`👤 User Role: ${user.role}`);
        console.log(`📧 User Email: ${user.email}`);
        console.log(`🎫 Token: ${token.substring(0, 20)}...`);
        
        // Test profile retrieval
        console.log('\n📋 Step 2: Testing profile retrieval');
        console.log(`🔗 URL: ${API_URL}/api/auth-db/profile`);
        
        const profileResponse = await fetch(`${API_URL}/api/auth-db/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const profileResult = await profileResponse.json();
        
        console.log(`📊 Profile Status: ${profileResponse.status}`);
        console.log(`✅ Profile Success: ${profileResult.success}`);
        
        if (profileResult.success) {
            console.log(`👤 Profile Data:`, {
                id: profileResult.data.id,
                email: profileResult.data.email,
                firstName: profileResult.data.firstName || profileResult.data.first_name,
                lastName: profileResult.data.lastName || profileResult.data.last_name,
                role: profileResult.data.role,
                hasProfile: !!profileResult.data.profile
            });
            
            if (profileResult.data.profile) {
                console.log(`📋 Counselor Profile:`, profileResult.data.profile);
            }
        } else {
            console.log(`❌ Profile Error: ${profileResult.error}`);
        }
        
        // Test token verification
        console.log('\n📋 Step 3: Testing token verification');
        
        // Simulate what the frontend does
        const testEndpoints = [
            '/api/auth-db/profile',
            '/api/auth-db/related-users'
        ];
        
        for (const endpoint of testEndpoints) {
            console.log(`\n🔗 Testing: ${API_URL}${endpoint}`);
            
            const testResponse = await fetch(`${API_URL}${endpoint}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const testResult = await testResponse.json();
            
            console.log(`📊 Status: ${testResponse.status}`);
            console.log(`✅ Success: ${testResult.success}`);
            
            if (!testResult.success) {
                console.log(`❌ Error: ${testResult.error}`);
            }
        }
        
    } catch (error) {
        console.log(`❌ Network error: ${error.message}`);
    }
}

// Test with sample counselor data
async function testCounselorRegistration() {
    console.log('\n🔍 Testing Counselor Registration...');
    
    const registrationData = {
        email: `counselor.test.${Date.now()}@example.com`,
        password: 'password123',
        firstName: 'Test',
        lastName: 'Counselor',
        role: 'counselor',
        phone: '555-0123',
        schoolDistrict: 'Test District',
        specializations: ['Career Guidance', 'Academic Planning'],
        yearsExperience: 5,
        licenseNumber: 'LIC123456',
        bio: 'Experienced career counselor'
    };
    
    console.log(`🔗 URL: ${API_URL}/api/auth-db/register`);
    
    try {
        const response = await fetch(`${API_URL}/api/auth-db/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(registrationData)
        });
        
        const result = await response.json();
        
        console.log(`📊 Registration Status: ${response.status}`);
        console.log(`✅ Registration Success: ${result.success}`);
        
        if (result.success) {
            console.log(`👤 Created User:`, {
                id: result.data.user.id,
                email: result.data.user.email,
                role: result.data.user.role
            });
            console.log(`🎫 Token: ${result.data.token.substring(0, 20)}...`);
        } else {
            console.log(`❌ Registration Error: ${result.error}`);
        }
        
    } catch (error) {
        console.log(`❌ Network error: ${error.message}`);
    }
}

// Run tests
console.log('🚀 Starting Counselor Authentication Tests...');
testCounselorRegistration()
    .then(() => testCounselorAuth())
    .catch(console.error);