# Adzuna Job API Integration Guide

## Overview

Lantern AI now integrates with the Adzuna Job Search API to provide real, up-to-date job opportunities to students instead of simulated job data. This integration enhances career recommendations with actual job listings from thousands of job boards and company websites.

## Features

### ✅ **Real Job Data**
- Live job listings from major job boards
- Current salary information
- Actual company names and locations
- Real job requirements and descriptions

### ✅ **Smart Matching**
- Jobs matched to student's career interests
- Location-based filtering (ZIP code + radius)
- Salary range filtering
- Full-time/part-time preferences

### ✅ **Enhanced Information**
- Direct links to job applications
- Job posting dates
- Job categories and industries
- Distance calculations from student location

## Setup Instructions

### 1. Get Adzuna API Credentials

1. **Visit Adzuna Developer Portal**
   - Go to: https://developer.adzuna.com/
   - Click "Sign Up" or "Log In"

2. **Create Developer Account**
   - Fill in your details
   - Verify your email address

3. **Create Application**
   - Click "Create New Application"
   - Application Name: "Lantern AI Career Platform"
   - Description: "Career guidance platform for high school students"
   - Website: Your domain or GitHub repository

4. **Get API Credentials**
   - Copy your **App ID** (numeric)
   - Copy your **App Key** (alphanumeric string)

### 2. Configure Environment Variables

Add to your `.env` file:

```bash
# Adzuna Job API
ADZUNA_APP_ID=your-app-id-here
ADZUNA_APP_KEY=your-app-key-here
```

### 3. Install Dependencies

The integration uses `axios` for HTTP requests:

```bash
cd backend
npm install axios
```

### 4. Test the Integration

```bash
cd backend
node test-adzuna-integration.js
```

**Expected Output:**
```
🧪 Testing Adzuna API Integration
==================================================

📋 Environment Variables:
   - ADZUNA_APP_ID: Present
   - ADZUNA_APP_KEY: Present

🔍 Testing basic job search...
✅ Adzuna API connection successful!
   - Total jobs found: 1,234
   - Jobs returned: 5
   - Mean salary: $65,000

📋 Sample Job:
   - Title: Registered Nurse
   - Company: City General Hospital
   - Location: New York, NY
   - Salary: $60,000 - $80,000
   - Category: Healthcare & Nursing
   - Posted: 1/5/2026
```

## API Usage

### Basic Job Search

```typescript
import { AdzunaService } from './services/adzunaService';

// Search for nursing jobs in New York
const result = await AdzunaService.searchJobs({
  what: 'nurse',
  where: 'New York, NY',
  distance: 25,
  results_per_page: 10,
  sort_by: 'relevance'
});

console.log(`Found ${result.count} jobs`);
console.log(`Mean salary: $${result.mean_salary}`);
```

### Career-Based Job Recommendations

```typescript
// Get job recommendations for student's career matches
const jobRecommendations = await AdzunaService.getJobRecommendations(
  careerMatches,
  'Chicago, IL',
  3 // Max jobs per career
);

jobRecommendations.forEach(recommendation => {
  console.log(`${recommendation.career}: ${recommendation.jobs.length} jobs`);
});
```

### Salary Insights

```typescript
// Get salary data for a specific job title
const salaryData = await AdzunaService.getSalaryInsights(
  'Software Developer',
  'San Francisco, CA'
);

console.log(`Average salary: $${salaryData.mean_salary}`);
console.log(`Total jobs: ${salaryData.job_count}`);
```

## Integration Architecture

### Service Layer

**`AdzunaService`** - Main service class
- `searchJobs()` - Core job search functionality
- `getJobRecommendations()` - Career-matched job suggestions
- `getSalaryInsights()` - Salary data for job titles
- `getTrendingCategories()` - Popular job categories by location

### AI Recommendation Integration

The Adzuna service is integrated into the AI recommendation system:

1. **Student Assessment** → Career matches identified
2. **Location Input** → ZIP code converted to city/state
3. **Adzuna API Call** → Real jobs fetched for each career
4. **Job Processing** → Jobs formatted and filtered
5. **AI Enhancement** → Jobs included in AI recommendations

### Fallback Strategy

```typescript
// Automatic fallback to simulated jobs if:
// - Adzuna API is not configured
// - API request fails
// - No jobs found
// - Rate limit exceeded

if (!adzunaConfigured || apiError) {
  return generateSimulatedJobs(careerMatches, zipCode);
}
```

## API Limits & Pricing

### Free Tier
- **1,000 API calls per month**
- **Rate limit**: 1 request per second
- **Features**: Full API access

### Paid Plans
- **Starter**: $99/month - 10,000 calls
- **Professional**: $299/month - 50,000 calls
- **Enterprise**: Custom pricing

### Rate Limiting
The integration includes automatic rate limiting:
- 100ms delay between requests
- Exponential backoff on errors
- Graceful fallback on quota exceeded

## Production Deployment

### Environment Variables

Add to your production environment (Render.com):

```bash
ADZUNA_APP_ID=your-production-app-id
ADZUNA_APP_KEY=your-production-app-key
```

### Monitoring

Monitor these metrics in production:
- API response times
- Success/failure rates
- Jobs found per search
- Fallback usage frequency

### Error Handling

The integration handles common errors:

```typescript
// Authentication errors
if (error.response?.status === 401) {
  throw new Error('Adzuna API authentication failed');
}

// Rate limiting
if (error.response?.status === 429) {
  throw new Error('Rate limit exceeded - try again later');
}

// Server errors
if (error.response?.status >= 500) {
  throw new Error('Adzuna API server error');
}
```

## Data Flow

### 1. Student Completes Assessment
```
Student Input → Career Matching → Location (ZIP) → Job Search
```

### 2. Adzuna API Integration
```
Career Titles → API Requests → Job Results → Data Processing
```

### 3. Job Recommendation Output
```
Raw Jobs → Formatting → Distance Calc → Requirements Extract → Final List
```

## Job Data Structure

### Adzuna API Response
```json
{
  "results": [
    {
      "id": "12345",
      "title": "Registered Nurse",
      "company": {
        "display_name": "City Hospital"
      },
      "location": {
        "display_name": "New York, NY"
      },
      "salary_min": 60000,
      "salary_max": 80000,
      "description": "Full job description...",
      "redirect_url": "https://...",
      "created": "2026-01-05T10:00:00Z",
      "category": {
        "label": "Healthcare & Nursing"
      }
    }
  ],
  "count": 1234,
  "mean": 65000
}
```

### Processed Job Object
```typescript
{
  title: "Registered Nurse",
  company: "City Hospital",
  location: "New York, NY",
  distance: 15,
  salary: "$60k - $80k",
  requirements: ["RN License", "2+ years experience"],
  description: "Provide patient care in fast-paced environment...",
  source: "Adzuna Job Search",
  url: "https://apply-link.com",
  posted: "1/5/2026",
  category: "Healthcare & Nursing"
}
```

## Benefits for Students

### 🎯 **Relevant Opportunities**
- Jobs matched to their career interests
- Local opportunities within commuting distance
- Entry-level positions appropriate for new graduates

### 💰 **Salary Transparency**
- Real salary ranges from actual job postings
- Market-rate information for career planning
- Comparison across different locations

### 🔗 **Direct Application**
- Links to actual job applications
- No need to search separately for opportunities
- Streamlined path from career exploration to job application

### 📊 **Market Insights**
- Job availability in their area
- Trending job categories
- Skills in demand by employers

## Troubleshooting

### Common Issues

#### **No Jobs Found**
```bash
# Check API credentials
echo $ADZUNA_APP_ID
echo $ADZUNA_APP_KEY

# Test API connection
node test-adzuna-integration.js

# Verify location format
# Use "City, State" format for best results
```

#### **Rate Limit Exceeded**
```bash
# Check your usage at: https://developer.adzuna.com/
# Implement request throttling
# Consider upgrading to paid plan
```

#### **API Authentication Failed**
```bash
# Verify credentials are correct
# Check for extra spaces or characters
# Regenerate keys if needed
```

### Debug Mode

Enable detailed logging:

```typescript
// Add to your .env file
DEBUG_ADZUNA=true

// This will log:
// - API request URLs
// - Response data
// - Processing steps
// - Error details
```

## Future Enhancements

### Planned Features
1. **Job Alerts** - Email notifications for new relevant jobs
2. **Application Tracking** - Track which jobs students apply to
3. **Employer Insights** - Company information and reviews
4. **Skills Matching** - Match student skills to job requirements
5. **Interview Prep** - Common interview questions for specific jobs

### Additional APIs
- **Indeed API** - Supplement job data
- **LinkedIn Jobs** - Professional networking opportunities
- **Glassdoor API** - Salary and company reviews
- **Google Jobs** - Aggregated job search results

## Support Resources

- **Adzuna Developer Docs**: https://developer.adzuna.com/docs
- **API Status Page**: https://status.adzuna.com/
- **Support Email**: developers@adzuna.com
- **Rate Limits**: https://developer.adzuna.com/docs/rate-limits

---

## Quick Start Checklist

- [ ] Sign up for Adzuna developer account
- [ ] Get APP_ID and APP_KEY credentials
- [ ] Add credentials to `.env` file
- [ ] Install axios dependency: `npm install axios`
- [ ] Test integration: `node test-adzuna-integration.js`
- [ ] Deploy to production with environment variables
- [ ] Monitor API usage and job recommendation quality

**Integration Status**: ✅ Ready for production use  
**Estimated Setup Time**: 15-20 minutes  
**Monthly Cost**: Free tier (1,000 API calls)