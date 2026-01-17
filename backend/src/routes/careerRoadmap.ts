import express from 'express';
import { CareerRoadmapService, CareerRoadmapInput } from '../services/careerRoadmapService';
import { ApiResponse } from '../types';

const router = express.Router();

// POST /api/career-roadmap/generate
router.post('/generate', async (req, res) => {
  try {
    const { career, studentData } = req.body;

    // Validate required fields
    if (!career || !career.title) {
      return res.status(400).json({
        success: false,
        error: 'Career information is required'
      } as ApiResponse);
    }

    if (!studentData || !studentData.grade || !studentData.zipCode) {
      return res.status(400).json({
        success: false,
        error: 'Student data (grade and zipCode) is required'
      } as ApiResponse);
    }

    console.log(`🗺️ Generating roadmap for career: ${career.title}`);
    console.log(`👤 Student: Grade ${studentData.grade}, ZIP ${studentData.zipCode}`);

    const roadmapInput: CareerRoadmapInput = {
      career: {
        title: career.title,
        sector: career.sector || 'general',
        requiredEducation: career.requiredEducation || 'High school diploma',
        averageSalary: career.averageSalary || 50000,
        description: career.description || `Career in ${career.title}`
      },
      studentData: {
        grade: parseInt(studentData.grade),
        zipCode: studentData.zipCode,
        courseHistory: studentData.courseHistory || {},
        academicPerformance: studentData.academicPerformance || {},
        supportLevel: studentData.supportLevel || 'moderate',
        educationCommitment: studentData.educationCommitment || 'bachelors'
      }
    };

    const roadmap = await CareerRoadmapService.generateCareerRoadmap(roadmapInput);

    res.json({
      success: true,
      data: roadmap,
      message: 'Career roadmap generated successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('❌ Error generating career roadmap:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate career roadmap',
      message: error instanceof Error ? error.message : 'Unknown error'
    } as ApiResponse);
  }
});

// POST /api/career-roadmap/batch-generate
router.post('/batch-generate', async (req, res) => {
  try {
    const { careers, studentData } = req.body;

    if (!Array.isArray(careers) || careers.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Careers array is required'
      } as ApiResponse);
    }

    if (!studentData || !studentData.grade || !studentData.zipCode) {
      return res.status(400).json({
        success: false,
        error: 'Student data (grade and zipCode) is required'
      } as ApiResponse);
    }

    console.log(`🗺️ Generating roadmaps for ${careers.length} careers`);
    console.log(`👤 Student: Grade ${studentData.grade}, ZIP ${studentData.zipCode}`);

    const roadmaps = [];
    
    // Generate roadmaps for each career
    for (const career of careers) {
      try {
        const roadmapInput: CareerRoadmapInput = {
          career: {
            title: career.title,
            sector: career.sector || 'general',
            requiredEducation: career.requiredEducation || 'High school diploma',
            averageSalary: career.averageSalary || 50000,
            description: career.description || `Career in ${career.title}`
          },
          studentData: {
            grade: parseInt(studentData.grade),
            zipCode: studentData.zipCode,
            courseHistory: studentData.courseHistory || {},
            academicPerformance: studentData.academicPerformance || {},
            supportLevel: studentData.supportLevel || 'moderate',
            educationCommitment: studentData.educationCommitment || 'bachelors'
          }
        };

        const roadmap = await CareerRoadmapService.generateCareerRoadmap(roadmapInput);
        roadmaps.push(roadmap);
        
        console.log(`✅ Generated roadmap for ${career.title}`);
        
        // Add small delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Failed to generate roadmap for ${career.title}:`, error);
        // Continue with other careers even if one fails
      }
    }

    res.json({
      success: true,
      data: {
        roadmaps,
        totalGenerated: roadmaps.length,
        totalRequested: careers.length
      },
      message: `Generated ${roadmaps.length} of ${careers.length} career roadmaps`
    } as ApiResponse);

  } catch (error) {
    console.error('❌ Error generating batch career roadmaps:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate career roadmaps',
      message: error instanceof Error ? error.message : 'Unknown error'
    } as ApiResponse);
  }
});

export default router;