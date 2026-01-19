# SendGrid Email Verification Setup

## 🚀 Quick Setup Guide

### Step 1: Create SendGrid Account
1. Go to [SendGrid.com](https://sendgrid.com)
2. Sign up for a free account (100 emails/day free tier)
3. Verify your email address

### Step 2: Create API Key
1. Log into SendGrid dashboard
2. Go to **Settings** → **API Keys**
3. Click **Create API Key**
4. Choose **Restricted Access**
5. Give it a name like "Lantern AI Email Verification"
6. Under **Mail Send**, select **Full Access**
7. Click **Create & View**
8. **Copy the API key immediately** (you won't see it again!)

### Step 3: Configure Domain Authentication (Recommended)
1. Go to **Settings** → **Sender Authentication**
2. Click **Authenticate Your Domain**
3. Follow the DNS setup instructions for your domain
4. This improves email deliverability and removes "via sendgrid.net"

### Step 4: Update Environment Variables
Add these to your `backend/.env` file:

```bash
# Email Configuration (SendGrid)
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.your-actual-api-key-here
FROM_EMAIL=noreply@yourdomain.com

# Optional: Enable sandbox mode for testing
SENDGRID_SANDBOX=true  # Set to false for production
```

### Step 5: Test Email Verification

#### Option A: Test via API
```bash
curl -X POST http://localhost:3002/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User",
    "role": "student"
  }'
```

#### Option B: Test via Frontend
1. Go to your registration page
2. Create a new account
3. Check your email for the verification message

## 📧 Email Features Included

### Professional Email Template
- ✅ Responsive HTML design
- ✅ Lantern AI branding
- ✅ Clear call-to-action button
- ✅ Fallback text version
- ✅ Mobile-friendly layout

### Security Features
- ✅ 24-hour token expiration
- ✅ One-time use tokens
- ✅ Secure token generation
- ✅ Database cleanup of expired tokens

### User Experience
- ✅ Automatic email sending on registration
- ✅ Resend verification option
- ✅ Clear error messages
- ✅ Verification status checking

## 🔧 Configuration Options

### Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `EMAIL_PROVIDER` | Yes | Set to "sendgrid" | `sendgrid` |
| `SENDGRID_API_KEY` | Yes | Your SendGrid API key | `SG.abc123...` |
| `FROM_EMAIL` | Yes | Sender email address | `noreply@lanternai.com` |
| `SENDGRID_SANDBOX` | No | Enable sandbox mode for testing | `true` |

### SendGrid Features Used
- **Click Tracking**: Enabled for analytics
- **Open Tracking**: Enabled for delivery confirmation
- **Sandbox Mode**: Available for testing without sending real emails

## 🛠️ Troubleshooting

### Common Issues

#### 1. "Unauthorized" Error
- **Cause**: Invalid API key
- **Solution**: Double-check your API key in `.env`

#### 2. "Forbidden" Error  
- **Cause**: API key doesn't have Mail Send permissions
- **Solution**: Create new API key with Full Access to Mail Send

#### 3. Emails Going to Spam
- **Cause**: Domain not authenticated
- **Solution**: Set up domain authentication in SendGrid

#### 4. "From email not verified" Error
- **Cause**: Sender email not verified with SendGrid
- **Solution**: Verify your sender email in SendGrid dashboard

### Debug Mode
Set `NODE_ENV=development` to see detailed email logs:

```bash
📧 SendGrid verification email sent:
   To: user@example.com
   Token: abc123...
   URL: http://localhost:3000/verify-email?token=abc123...
   Message ID: abc123...
```

## 📊 Monitoring & Analytics

### SendGrid Dashboard
- View email delivery statistics
- Monitor bounce and spam rates
- Track click and open rates
- Review suppression lists

### Application Logs
- Email sending success/failure
- Token generation and verification
- User verification status

## 🚀 Production Deployment

### Before Going Live
1. ✅ Set up domain authentication
2. ✅ Configure proper FROM_EMAIL with your domain
3. ✅ Set `SENDGRID_SANDBOX=false`
4. ✅ Test with real email addresses
5. ✅ Monitor initial email delivery rates

### Scaling Considerations
- **Free Tier**: 100 emails/day
- **Essentials**: $14.95/month for 50,000 emails
- **Pro**: $89.95/month for 1.5M emails

## 🔐 Security Best Practices

### API Key Security
- ✅ Use restricted API keys (not full access)
- ✅ Store API keys in environment variables
- ✅ Never commit API keys to version control
- ✅ Rotate API keys regularly

### Email Security
- ✅ Use HTTPS for verification links
- ✅ Implement token expiration
- ✅ Validate email addresses before sending
- ✅ Monitor for abuse and spam reports

## 📞 Support

### SendGrid Support
- Documentation: [docs.sendgrid.com](https://docs.sendgrid.com)
- Support: Available with paid plans
- Community: SendGrid Community Forum

### Lantern AI Implementation
- Check logs for detailed error messages
- Verify environment variables are set correctly
- Test with sandbox mode first
- Contact development team for assistance

---

**Status**: ✅ SendGrid email verification is now configured and ready to use!

*Setup completed: January 18, 2026*