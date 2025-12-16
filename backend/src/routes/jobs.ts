import express from 'express';
import { JobListingService } from '../services/jobListingService';
import { ApiResponse } from '../types';

const router = express.Router();

// GET /api/jobs/search
router.get('/search', async (req, res) => {
  try {
    const { 
      career, 
      zipCode, 
      radius = 40, 
      limit = 10,
      keywords 
    } = req.query;

    if (!zipCode) {
      return res.status(400).json({
        success: false,
        error: 'ZIP code is required'
      } as ApiResponse);
    }

    let jobs;
    
    if (keywords) {
      // Search by keywords
      jobs = await JobListingService.searchJobs(
        keywords as string,
        zipCode as string,
        parseInt(radius as string),
        parseInt(limit as string)
      );
    } else if (career) {
      // Search by specific career
      jobs = await JobListingService.getJobListings(
        career as string,
        zipCode as string,
        parseInt(radius as string),
        parseInt(limit as string)
      );
    } else {
      // Get entry-level jobs
      jobs = await JobListingService.getEntryLevelJobs(
        zipCode as string,
        parseInt(limit as string)
      );
    }

    res.json({
      success: true,
      data: jobs,
      message: `Found ${jobs.length} job listings`
    } as ApiResponse);

  } catch (error) {
    console.error('Error searching jobs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search job listings'
    } as ApiResponse);
  }
});

// GET /api/jobs/career/:careerTitle
router.get('/career/:careerTitle', async (req, res) => {
  try {
    const { careerTitle } = req.params;
    const { zipCode, radius = 40, limit = 10 } = req.query;

    if (!zipCode) {
      return res.status(400).json({
        success: false,
        error: 'ZIP code is required'
      } as ApiResponse);
    }

    const jobs = await JobListingService.getJobListings(
      decodeURIComponent(careerTitle),
      zipCode as string,
      parseInt(radius as string),
      parseInt(limit as string)
    );

    res.json({
      success: true,
      data: jobs,
      message: `Found ${jobs.length} ${careerTitle} positions`
    } as ApiResponse);

  } catch (error) {
    console.error('Error getting career jobs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get job listings for career'
    } as ApiResponse);
  }
});

// GET /api/jobs/entry-level
router.get('/entry-level', async (req, res) => {
  try {
    const { zipCode, limit = 5 } = req.query;

    if (!zipCode) {
      return res.status(400).json({
        success: false,
        error: 'ZIP code is required'
      } as ApiResponse);
    }

    const jobs = await JobListingService.getEntryLevelJobs(
      zipCode as string,
      parseInt(limit as string)
    );

    res.json({
      success: true,
      data: jobs,
      message: `Found ${jobs.length} entry-level positions`
    } as ApiResponse);

  } catch (error) {
    console.error('Error getting entry-level jobs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get entry-level job listings'
    } as ApiResponse);
  }
});

export default router;