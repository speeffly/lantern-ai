# Enable Real Job Data

## Quick Setup

To enable real job data from Adzuna API instead of mock jobs:

### 1. Get Adzuna API Credentials
- Go to: https://developer.adzuna.com/
- Sign up for a free account
- Create an application
- Copy your **App ID** and **App Key**

### 2. Update Environment Variables

Add to your `.env` file:

```bash
# Enable real jobs
USE_REAL_JOBS=true

# Adzuna API credentials
ADZUNA_APP_ID=your-app-id-here
ADZUNA_APP_KEY=your-app-key-here
```

### 3. Restart Server

```bash
npm run dev
```

## Verification

You should see this message when real jobs are enabled:
```
✅ Found X real job opportunities from Adzuna
```

Instead of:
```
🟠 RealJobProvider disabled: set USE_REAL_JOBS=true and provide ADZUNA_APP_ID/ADZUNA_API_KEY
🟠 Falling back to mock jobs for career "Registered Nurse" in 78724
```

## Benefits

✅ **Real job listings** from thousands of job boards  
✅ **Current salary data** from actual postings  
✅ **Direct application links** for students  
✅ **Up-to-date market information** for career guidance  

## Free Tier Limits

- **1,000 API calls per month**
- **Rate limit**: 1 request per second
- **Full API access** to all features

Perfect for development and small-scale production use!