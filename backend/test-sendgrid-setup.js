#!/usr/bin/env node

/**
 * SendGrid Email Verification Test Script
 * 
 * This script tests the SendGrid email verification setup without
 * requiring a full database or user registration.
 */

require('dotenv').config();
const sgMail = require('@sendgrid/mail');

console.log('🧪 Testing SendGrid Email Verification Setup');
console.log('=' .repeat(50));

// Check environment variables
console.log('📋 Environment Check:');
console.log('   EMAIL_PROVIDER:', process.env.EMAIL_PROVIDER || 'not set');
console.log('   SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY ? 'present' : 'missing');
console.log('   FROM_EMAIL:', process.env.FROM_EMAIL || 'not set');
console.log('   NODE_ENV:', process.env.NODE_ENV || 'development');

if (process.env.EMAIL_PROVIDER !== 'sendgrid') {
  console.log('❌ EMAIL_PROVIDER is not set to "sendgrid"');
  console.log('   Please set EMAIL_PROVIDER=sendgrid in your .env file');
  process.exit(1);
}

if (!process.env.SENDGRID_API_KEY) {
  console.log('❌ SENDGRID_API_KEY is missing');
  console.log('   Please add your SendGrid API key to your .env file');
  console.log('   Get one at: https://app.sendgrid.com/settings/api_keys');
  process.exit(1);
}

if (!process.env.FROM_EMAIL) {
  console.log('❌ FROM_EMAIL is missing');
  console.log('   Please set FROM_EMAIL in your .env file');
  process.exit(1);
}

// Initialize SendGrid
console.log('\n🔧 Initializing SendGrid...');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Test email content
const testEmail = process.argv[2] || 'test@example.com';
const testToken = 'test-token-' + Date.now();
const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${testToken}`;

console.log('📧 Preparing test email:');
console.log('   To:', testEmail);
console.log('   From:', process.env.FROM_EMAIL);
console.log('   Verification URL:', verificationUrl);

const msg = {
  to: testEmail,
  from: {
    email: process.env.FROM_EMAIL,
    name: 'Lantern AI'
  },
  subject: '🧪 Test: Verify Your Lantern AI Account',
  text: `
This is a test email from Lantern AI.

Please verify your email address by visiting this link:
${verificationUrl}

This is a test email - no action is required.

Best regards,
The Lantern AI Team
  `,
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Test Email Verification</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">🏮 Lantern AI</h1>
        <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">🧪 Test Email</p>
      </div>
      
      <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <h2 style="color: #333; margin-top: 0;">SendGrid Test Email</h2>
        
        <p>This is a test email to verify your SendGrid configuration is working correctly.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; font-size: 16px;">
            Test Verification Link
          </a>
        </div>
        
        <div style="border-top: 1px solid #eee; margin-top: 20px; padding-top: 20px; color: #666; font-size: 12px;">
          <p><strong>This is a test email</strong> - no action is required.</p>
          <p>If you received this email, your SendGrid configuration is working correctly!</p>
        </div>
      </div>
    </body>
    </html>
  `,
  // SendGrid specific settings
  trackingSettings: {
    clickTracking: {
      enable: true,
      enableText: false
    },
    openTracking: {
      enable: true
    }
  },
  mailSettings: {
    sandboxMode: {
      enable: process.env.SENDGRID_SANDBOX === 'true'
    }
  }
};

// Send test email
async function sendTestEmail() {
  try {
    console.log('\n📤 Sending test email...');
    
    if (process.env.SENDGRID_SANDBOX === 'true') {
      console.log('🏖️ Sandbox mode enabled - email will not be delivered');
    }
    
    const result = await sgMail.send(msg);
    
    console.log('✅ Test email sent successfully!');
    console.log('   Message ID:', result[0].headers['x-message-id']);
    console.log('   Status Code:', result[0].statusCode);
    
    if (process.env.SENDGRID_SANDBOX === 'true') {
      console.log('\n📝 Note: Sandbox mode is enabled');
      console.log('   The email was processed but not delivered');
      console.log('   Set SENDGRID_SANDBOX=false to send real emails');
    } else {
      console.log('\n📬 Check your email inbox for the test message');
    }
    
    console.log('\n🎉 SendGrid configuration is working correctly!');
    
  } catch (error) {
    console.log('❌ Failed to send test email');
    console.error('Error details:', error);
    
    if (error.response && error.response.body) {
      console.log('\n📋 SendGrid Error Details:');
      console.log(JSON.stringify(error.response.body, null, 2));
      
      const errors = error.response.body.errors;
      if (errors && errors.length > 0) {
        console.log('\n🔍 Common Solutions:');
        errors.forEach((err, index) => {
          console.log(`   ${index + 1}. ${err.message}`);
          
          if (err.message.includes('does not contain a valid address')) {
            console.log('      → Check your FROM_EMAIL format (must be valid email)');
          }
          if (err.message.includes('not verified')) {
            console.log('      → Verify your sender email in SendGrid dashboard');
          }
          if (err.message.includes('Unauthorized')) {
            console.log('      → Check your SENDGRID_API_KEY is correct');
          }
        });
      }
    }
    
    process.exit(1);
  }
}

// Run the test
console.log('\n🚀 Starting SendGrid test...');
sendTestEmail();