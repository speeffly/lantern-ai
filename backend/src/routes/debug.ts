import { Router } from 'express';
import { RealJobProvider } from '../services/realJobProvider';

const router = Router();

/**
 * Debug endpoint to check environment variables in production
 */
router.get('/env-check', (req, res) => {
  try {
    const envCheck = {
      USE_REAL_JOBS: process.env.USE_REAL_JOBS || 'NOT_SET',
      USE_REAL_JOBS_LENGTH: (process.env.USE_REAL_JOBS || '').length,
      ADZUNA_APP_ID: process.env.ADZUNA_APP_ID ? 'SET' : 'NOT_SET',
      ADZUNA_APP_ID_LENGTH: (process.env.ADZUNA_APP_ID || '').length,
      ADZUNA_APP_KEY: process.env.ADZUNA_APP_KEY ? 'SET' : 'NOT_SET',
      ADZUNA_APP_KEY_LENGTH: (process.env.ADZUNA_APP_KEY || '').length,
      NODE_ENV: process.env.NODE_ENV || 'NOT_SET'
    };
    
    // Test RealJobProvider logic
    const flag = (process.env.USE_REAL_JOBS || '').toLowerCase().trim();
    const appId = (process.env.ADZUNA_APP_ID || '').trim();
    const apiKey = (process.env.ADZUNA_APP_KEY || '').trim();
    
    const flagCheck = (flag === 'true' || flag === '1' || flag === 'yes');
    const credentialsCheck = !!(appId && apiKey);
    const isEnabled = flagCheck && credentialsCheck;
    
    res.json({
      message: 'Environment Variables Debug Check',
      timestamp: new Date().toISOString(),
      environment: envCheck,
      realJobProviderLogic: {
        flagValue: flag,
        flagCheck: flagCheck,
        credentialsCheck: credentialsCheck,
        finalResult: isEnabled
      },
      realJobProviderEnabled: RealJobProvider.isEnabled(),
      recommendations: isEnabled ? 
        'Environment variables are properly configured!' :
        'Check environment variables in Render dashboard and redeploy'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to check environment variables',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Test endpoint to verify RealJobProvider functionality
 */
router.get('/test-jobs', async (req, res) => {
  try {
    const isEnabled = RealJobProvider.isEnabled();
    
    if (!isEnabled) {
      return res.json({
        message: 'RealJobProvider is disabled',
        enabled: false,
        reason: 'Environment variables not properly configured'
      });
    }
    
    // Test a simple job search
    const testJobs = await RealJobProvider.searchJobs({
      careerTitle: 'Nurse',
      zipCode: '78724',
      radiusMiles: 25,
      limit: 3
    });
    
    res.json({
      message: 'RealJobProvider test successful',
      enabled: true,
      jobsFound: testJobs.length,
      sampleJobs: testJobs.slice(0, 2).map(job => ({
        title: job.title,
        company: job.company,
        location: job.location
      }))
    });
    
  } catch (error) {
    res.status(500).json({
      error: 'RealJobProvider test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;