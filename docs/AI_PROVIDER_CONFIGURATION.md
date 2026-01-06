# AI Provider Configuration Guide

## Overview

Lantern AI supports multiple AI providers for generating career recommendations. You can choose between **OpenAI** and **Google Gemini** using environment variables, allowing flexibility in AI service selection based on your needs, budget, and preferences.

## Supported AI Providers

### 🔵 **OpenAI (GPT-3.5-turbo)**
- **Model**: gpt-3.5-turbo
- **Strengths**: Excellent reasoning, detailed responses, proven reliability
- **Cost**: Pay-per-token pricing
- **API Key**: Get from [OpenAI Platform](https://platform.openai.com/api-keys)

### 🟢 **Google Gemini (1.5-flash)**
- **Model**: gemini-1.5-flash
- **Strengths**: Fast responses, competitive pricing, Google integration
- **Cost**: Generous free tier, competitive pricing
- **API Key**: Get from [Google AI Studio](https://makersuite.google.com/app/apikey)

## Configuration

### Environment Variables

Add these variables to your `.env` file:

```bash
# AI Provider Selection: 'openai' or 'gemini'
AI_PROVIDER=openai

# OpenAI Configuration
OPENAI_API_KEY=sk-proj-your-openai-key-here

# Google Gemini Configuration  
GEMINI_API_KEY=your-gemini-key-here

# Enable/Disable Real AI (vs fallback mode)
USE_REAL_AI=true
```

### Provider Selection

#### **Option 1: Use OpenAI (Default)**
```bash
AI_PROVIDER=openai
OPENAI_API_KEY=sk-proj-your-openai-key-here
USE_REAL_AI=true
```

#### **Option 2: Use Google Gemini**
```bash
AI_PROVIDER=gemini
GEMINI_API_KEY=your-gemini-key-here
USE_REAL_AI=true
```

#### **Option 3: Fallback Mode (No AI)**
```bash
USE_REAL_AI=false
# AI_PROVIDER can be any value or omitted
```

## API Key Setup

### OpenAI API Key Setup

1. **Create OpenAI Account**
   - Go to [OpenAI Platform](https://platform.openai.com/)
   - Sign up or log in to your account

2. **Generate API Key**
   - Navigate to [API Keys](https://platform.openai.com/api-keys)
   - Click "Create new secret key"
   - Copy the key (starts with `sk-proj-`)

3. **Add Credits**
   - Go to [Billing](https://platform.openai.com/account/billing)
   - Add payment method and credits
   - Minimum $5 recommended for testing

4. **Configure Environment**
   ```bash
   OPENAI_API_KEY=sk-proj-your-actual-key-here
   AI_PROVIDER=openai
   ```

### Google Gemini API Key Setup

1. **Access Google AI Studio**
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Sign in with your Google account

2. **Create API Key**
   - Click "Create API Key"
   - Select or create a Google Cloud project
   - Copy the generated API key

3. **Configure Environment**
   ```bash
   GEMINI_API_KEY=your-actual-gemini-key-here
   AI_PROVIDER=gemini
   ```

## Testing Configuration

### Test Script

Run the AI provider test script to validate your configuration:

```bash
cd backend
node test-ai-providers.js
```

### Expected Output

```
🧪 Testing AI Provider Configuration
==================================================

📋 Environment Variables:
   - AI_PROVIDER: openai
   - USE_REAL_AI: true
   - OPENAI_API_KEY: Present (107 chars)
   - GEMINI_API_KEY: Missing

🔵 Testing OpenAI Connection...
   ✅ OpenAI Response: OpenAI connection test successful
   ✅ OpenAI connection successful

🟢 Gemini: Skipped (no API key)

🤖 Testing AI Provider Selection Logic...
   - Selected provider: openai
   ✅ AI provider configuration valid

🏁 AI Provider test complete
```

## Production Deployment

### Render.com Environment Variables

Add these environment variables in your Render.com service settings:

```bash
AI_PROVIDER=openai
OPENAI_API_KEY=sk-proj-your-production-key
USE_REAL_AI=true
```

### AWS Amplify (Frontend)

The frontend doesn't need AI API keys - all AI processing happens on the backend.

## Provider Comparison

| Feature | OpenAI GPT-3.5-turbo | Google Gemini 1.5-flash |
|---------|----------------------|--------------------------|
| **Response Quality** | Excellent | Very Good |
| **Speed** | Fast | Very Fast |
| **Cost** | $0.50-$1.50 per 1M tokens | Free tier + competitive pricing |
| **Context Length** | 16,385 tokens | 1M+ tokens |
| **Reliability** | Very High | High |
| **Setup Complexity** | Simple | Simple |
| **Free Tier** | $5 credit for new users | Generous free tier |

## Advanced Configuration

### Model Parameters

You can customize AI behavior by modifying the service configuration:

```typescript
// OpenAI Configuration
const AI_CONFIG = {
  openai: {
    model: "gpt-3.5-turbo",
    maxTokens: 4000,
    temperature: 0.7,  // Creativity level (0-1)
    topP: 1.0,         // Nucleus sampling
    frequencyPenalty: 0, // Reduce repetition
    presencePenalty: 0   // Encourage new topics
  },
  gemini: {
    model: "gemini-1.5-flash",
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 4000
  }
};
```

### Fallback Strategy

The system automatically falls back to rule-based recommendations if:
- `USE_REAL_AI=false`
- AI provider is unavailable
- API key is invalid
- API quota exceeded
- Network connectivity issues

## Monitoring & Logging

### AI Provider Logs

The system logs detailed information about AI provider usage:

```
🤖 AI Provider Configuration: { provider: 'openai', available: true }
🔧 AI Mode Configuration:
   - USE_REAL_AI flag: true
   - AI Provider: openai
   - Provider available: true

🚀 Sending request to OpenAI...
✅ OPENAI API RESPONSE RECEIVED
   Response Length: 2847 characters
   Tokens Used: 1234
   Model Used: gpt-3.5-turbo
```

### Error Handling

Common error scenarios and solutions:

```bash
# Invalid API Key
❌ AI Provider 'openai' is not available: OPENAI_API_KEY appears to be invalid

# Missing API Key  
❌ AI Provider 'gemini' is not available: GEMINI_API_KEY environment variable is missing

# Quota Exceeded
❌ OpenAI API Error: You exceeded your current quota

# Invalid Provider
❌ Invalid AI provider 'claude'. Supported providers: 'openai', 'gemini'
```

## Cost Management

### OpenAI Cost Optimization

1. **Monitor Usage**
   - Check [OpenAI Usage Dashboard](https://platform.openai.com/usage)
   - Set up billing alerts

2. **Optimize Prompts**
   - Reduce unnecessary context
   - Use shorter prompts when possible
   - Cache common responses

3. **Rate Limiting**
   - Implement request throttling
   - Use fallback mode during high traffic

### Gemini Cost Optimization

1. **Free Tier Limits**
   - 15 requests per minute
   - 1,500 requests per day
   - 1 million tokens per minute

2. **Paid Tier Benefits**
   - Higher rate limits
   - Priority access
   - Advanced features

## Troubleshooting

### Common Issues

#### **Provider Not Available**
```bash
# Check configuration
echo $AI_PROVIDER
echo $OPENAI_API_KEY
echo $USE_REAL_AI

# Test connection
node test-ai-providers.js
```

#### **API Key Issues**
```bash
# Verify key format
# OpenAI: starts with 'sk-proj-' or 'sk-'
# Gemini: alphanumeric string

# Test key validity
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
     https://api.openai.com/v1/models
```

#### **Quota/Rate Limiting**
```bash
# Check OpenAI usage
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
     https://api.openai.com/v1/usage

# Implement exponential backoff
# Switch to alternative provider
# Use fallback mode temporarily
```

## Best Practices

### 1. **Dual Provider Setup**
Configure both providers for redundancy:
```bash
AI_PROVIDER=openai
OPENAI_API_KEY=sk-proj-your-openai-key
GEMINI_API_KEY=your-gemini-key
```

### 2. **Environment-Specific Configuration**
```bash
# Development
AI_PROVIDER=gemini  # Use free tier for development
USE_REAL_AI=true

# Production  
AI_PROVIDER=openai  # Use reliable provider for production
USE_REAL_AI=true
```

### 3. **Monitoring & Alerts**
- Set up API usage monitoring
- Configure billing alerts
- Monitor response quality
- Track error rates

### 4. **Security**
- Never commit API keys to version control
- Use environment variables only
- Rotate keys regularly
- Monitor for unauthorized usage

## Future Enhancements

### Planned Features
- **Claude Integration**: Anthropic Claude support
- **Azure OpenAI**: Enterprise OpenAI service
- **Local Models**: Ollama integration for privacy
- **Load Balancing**: Automatic provider switching
- **Cost Optimization**: Intelligent provider selection based on cost/quality

### Provider Roadmap
1. **Phase 1**: OpenAI + Gemini (Current)
2. **Phase 2**: Claude + Azure OpenAI
3. **Phase 3**: Local models + Ollama
4. **Phase 4**: Custom fine-tuned models

---

## Quick Reference

### Environment Variables
```bash
AI_PROVIDER=openai|gemini
OPENAI_API_KEY=sk-proj-...
GEMINI_API_KEY=...
USE_REAL_AI=true|false
```

### Test Commands
```bash
# Test configuration
node test-ai-providers.js

# Test specific provider
AI_PROVIDER=openai node test-ai-providers.js
AI_PROVIDER=gemini node test-ai-providers.js
```

### API Key Sources
- **OpenAI**: https://platform.openai.com/api-keys
- **Gemini**: https://makersuite.google.com/app/apikey

For additional support, refer to the main [Technical Architecture Guide](./TECHNICAL_ARCHITECTURE_GUIDE.md) or contact the development team.