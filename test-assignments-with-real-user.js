#!/usr/bin/env node

/**
 * Test assignments API with a real user from the database
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const API_URL = process.env.API_URL || 'http://localhost:3002';

async function getTestUser() {
  const dbPath = path.join(__dirname, 'backend', 'data', 'lantern_ai.db');
  
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        reject(err);
        return;
      }
    });

    // Get a student user
    db.get(`SELECT * FROM users WHERE role = 'student' LIMIT 1`, (err, user) => {
      if (err) {
        db.close();
        reject(err);
        return;
      }

      db.close();
      resolve(user);
    });
  });
}

async function testWithRealUser() {
  console.log('🧪 Testing Student Assignments API with Real User');
  console.log('=' .repeat(60));

  try {
    // Get a test user from the database
    console.log('1. Getting test user from database...');
    const user = await getTestUser();
    
    if (!user) {
      console.log('❌ No student users found in database');
      return;
    }

    console.log('✅ Found test user:', user.email, '(ID:', user.id, ')');

    // Try to login with this user (we don't know the password, so we'll create a token manually)
    // For testing, let's try a common password or create a new user
    console.log('\n2. Creating a new test student for testing...');
    
    const testEmail = 'assignments.test@example.com';
    const testPassword = 'testpass123';
    
    const registerResponse = await fetch(`${API_URL}/api/auth-db/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        firstName: 'Assignment',
        lastName: 'Tester',
        role: 'student'
      })
    });

    const registerData = await registerResponse.json();
    console.log('Register response:', registerData);

    // Login to get token
    console.log('\n3. Logging in to get token...');
    const loginResponse = await fetch(`${API_URL}/api/auth-db/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword
      })
    });

    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);

    if (!loginData.success || !loginData.data?.token) {
      console.error('❌ Failed to get token');
      return;
    }

    const token = loginData.data.token;
    console.log('✅ Got token successfully');

    // Test assignments API
    console.log('\n4. Testing assignments API...');
    const assignmentsResponse = await fetch(`${API_URL}/api/student/assignments`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('Status:', assignmentsResponse.status);
    
    if (assignmentsResponse.ok) {
      const assignmentsData = await assignmentsResponse.json();
      console.log('Response:', assignmentsData);
      
      if (assignmentsData.success) {
        console.log('✅ SUCCESS! Assignments API is working correctly');
        console.log(`📊 Found ${assignmentsData.data.length} assignments`);
        
        if (assignmentsData.data.length === 0) {
          console.log('✅ Empty assignments - frontend should show "No Assignments Yet"');
        }
      } else {
        console.error('❌ API returned success: false');
      }
    } else {
      const errorData = await assignmentsResponse.text();
      console.error('❌ HTTP Error:', assignmentsResponse.status, errorData);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testWithRealUser().catch(console.error);