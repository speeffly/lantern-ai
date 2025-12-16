import express from 'express';
import { ActionPlanService } from '../services/actionPlanService';
import { CareerService } from '../services/careerService';
import { ApiResponse } from '../types';

const router = express.Router();

// GET /api/action-plans/:careerCode - Get action plan for a specific career
router.get('/:careerCode', async (req, res) => {
  try {
    const { careerCode } = req.params;
    const { grade, zipCode } = req.query;

    // Get career details
    const career = CareerService.getCareerById(careerCode);
    if (!career) {
      return res.status(404).json({
        success: false,
        error: 'Career not found'
      } as ApiResponse);
    }

    // Create CareerMatch object from Career
    const careerMatch = {
      careerId: career.id,
      career: career,
      matchScore: 85, // Default match score
      reasoningFactors: ['Selected career path'],
      localDemand: 'medium' as const,
      localSalary: {
        min: career.salaryRange.min,
        max: career.salaryRange.max,
        location: zipCode as string
      },
      localEmployers: ['Local employers']
    };

    // Generate action plan
    const actionPlan = ActionPlanService.generateActionPlan(
      careerMatch,
      grade ? parseInt(grade as string) : undefined,
      zipCode as string
    );

    res.json({
      success: true,
      data: actionPlan
    } as ApiResponse);
  } catch (error) {
    console.error('Error generating action plan:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate action plan'
    } as ApiResponse);
  }
});

// POST /api/action-plans/multiple - Get action plans for multiple careers
router.post('/multiple', async (req, res) => {
  try {
    const { careerCodes, grade, zipCode } = req.body;

    if (!careerCodes || !Array.isArray(careerCodes)) {
      return res.status(400).json({
        success: false,
        error: 'Career codes array is required'
      } as ApiResponse);
    }

    // Get career details for all codes
    const careers = careerCodes.map((code: string) => CareerService.getCareerById(code));
    const validCareers = careers.filter((c: any) => c !== null);

    // Convert Career objects to CareerMatch objects
    const careerMatches = validCareers.map((career: any) => ({
      careerId: career.id,
      career: career,
      matchScore: 85, // Default match score
      reasoningFactors: ['Selected career path'],
      localDemand: 'medium' as const,
      localSalary: {
        min: career.salaryRange.min,
        max: career.salaryRange.max,
        location: zipCode as string
      },
      localEmployers: ['Local employers']
    }));

    // Generate action plans
    const actionPlans = ActionPlanService.generateMultipleActionPlans(
      careerMatches,
      grade,
      zipCode
    );

    res.json({
      success: true,
      data: actionPlans
    } as ApiResponse);
  } catch (error) {
    console.error('Error generating action plans:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate action plans'
    } as ApiResponse);
  }
});

export default router;
