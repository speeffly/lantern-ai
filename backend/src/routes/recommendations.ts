import express from 'express';
import { RecommendationEngine } from '../services/recommendationEngine';
import { StudentProfile } from '../types/recommendation';
import { ApiResponse } from '../types';

const router = express.Router();

// POST /api/recommendations - Main recommendation endpoint
router.post('/', async (req, res) => {
  try {
    console.log('📥 Received recommendation request');
    
    const profile: StudentProfile = req.body;
    
    // Validate required fields
    if (!profile.grade || !profile.zipCode) {
      return res.status(400).json({
        success: false,
        error: 'Grade and ZIP code are required'
      } as ApiResponse);
    }

    // Validate arrays exist
    if (!Array.isArray(profile.workEnvironment)) profile.workEnvironment = [];
    if (!Array.isArray(profile.workStyle)) profile.workStyle = [];
    if (!Array.isArray(profile.thinkingStyle)) profile.thinkingStyle = [];
    if (!Array.isArray(profile.academicInterests)) profile.academicInterests = [];
    if (!Array.isArray(profile.traits)) profile.traits = [];
    if (!Array.isArray(profile.constraints)) profile.constraints = [];
    if (!profile.academicPerformance) profile.academicPerformance = {};

    // Set defaults for required string fields
    if (!profile.educationWillingness) profile.educationWillingness = "I'm not sure yet";
    if (!profile.incomeImportance) profile.incomeImportance = 'Not sure';
    if (!profile.stabilityImportance) profile.stabilityImportance = 'Not sure';
    if (!profile.helpingImportance) profile.helpingImportance = 'Not sure';
    if (!profile.decisionPressure) profile.decisionPressure = 'Just exploring options';
    if (!profile.riskTolerance) profile.riskTolerance = 'Not sure';
    if (!profile.supportLevel) profile.supportLevel = 'Not sure about support';
    if (!profile.careerConfidence) profile.careerConfidence = 'Unsure';
    if (!profile.interests) profile.interests = '';
    if (!profile.experience) profile.experience = 'None yet';

    console.log('🎯 Generating recommendations for grade', profile.grade, 'student');
    console.log('📊 Profile summary:', {
      workEnvironment: profile.workEnvironment.length,
      workStyle: profile.workStyle.length,
      academicInterests: profile.academicInterests.length,
      traits: profile.traits.length,
      educationWillingness: profile.educationWillingness
    });

    // Generate recommendations
    const recommendations = RecommendationEngine.generateRecommendations(profile);
    
    console.log('✅ Recommendations generated successfully');
    console.log('📈 Results:', {
      topCluster: recommendations.top_clusters[0]?.name,
      bestFitCount: recommendations.career_recommendations.best_fit.length,
      goodFitCount: recommendations.career_recommendations.good_fit.length,
      stretchCount: recommendations.career_recommendations.stretch_options.length
    });

    res.json({
      success: true,
      data: recommendations,
      message: 'Career recommendations generated successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('❌ Error generating recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate career recommendations',
      message: error instanceof Error ? error.message : 'Unknown error'
    } as ApiResponse);
  }
});

// POST /api/recommendations/explanations - Generate text explanations from structured result
router.post('/explanations', async (req, res) => {
  try {
    const { recommendations, profile } = req.body;
    
    if (!recommendations) {
      return res.status(400).json({
        success: false,
        error: 'Recommendations data is required'
      } as ApiResponse);
    }

    // Generate explanatory text from structured recommendations
    const explanations = {
      overview: generateOverviewExplanation(recommendations, profile),
      cluster_explanations: generateClusterExplanations(recommendations.top_clusters),
      career_explanations: generateCareerExplanations(recommendations.career_recommendations),
      plan_explanation: generatePlanExplanation(recommendations.four_year_plan),
      next_steps: generateNextStepsExplanation(recommendations)
    };

    res.json({
      success: true,
      data: explanations,
      message: 'Explanations generated successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('❌ Error generating explanations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate explanations'
    } as ApiResponse);
  }
});

// Helper functions for generating explanations
function generateOverviewExplanation(recommendations: any, profile: any): string {
  const topCluster = recommendations.top_clusters[0];
  const topCareer = recommendations.career_recommendations.best_fit[0];
  const readiness = recommendations.student_profile_summary.readiness_level;
  
  return `Based on your assessment, you show strong alignment with ${topCluster.name} careers, particularly ${topCareer?.career.name || 'several options'}. Your career readiness level is ${readiness.toLowerCase()}, which means ${getReadinessDescription(readiness)}. We've identified ${recommendations.career_recommendations.best_fit.length} best-fit careers, ${recommendations.career_recommendations.good_fit.length} good alternatives, and ${recommendations.career_recommendations.stretch_options.length} stretch options for your consideration.`;
}

function generateClusterExplanations(clusters: any[]): any[] {
  return clusters.map(cluster => ({
    cluster_name: cluster.name,
    score: cluster.score,
    explanation: `You scored ${cluster.score}% in ${cluster.name} because ${cluster.reasoning.slice(0, 3).join(', ').toLowerCase()}. This suggests you would thrive in careers that involve ${getClusterDescription(cluster.cluster_id)}.`
  }));
}

function generateCareerExplanations(careerRecs: any): any {
  return {
    best_fit: careerRecs.best_fit.map((rec: any) => ({
      career_name: rec.career.name,
      score: rec.score,
      explanation: `${rec.career.name} is a ${rec.score}% match because ${rec.reasoning.join(' and ')}. ${rec.feasibility_notes ? 'Note: ' + rec.feasibility_notes.join(' ') : 'This career aligns well with your current preferences and constraints.'}`
    })),
    good_fit: careerRecs.good_fit.map((rec: any) => ({
      career_name: rec.career.name,
      score: rec.score,
      explanation: `${rec.career.name} scored ${rec.score}% as a good alternative option. ${rec.reasoning.join(' ')} ${rec.feasibility_notes ? 'Consider: ' + rec.feasibility_notes.join(' ') : ''}`
    })),
    stretch_options: careerRecs.stretch_options.map((rec: any) => ({
      career_name: rec.career.name,
      score: rec.score,
      explanation: `${rec.career.name} is a stretch option that could be worth exploring as you develop. ${rec.feasibility_notes ? rec.feasibility_notes.join(' ') : 'This career may require additional preparation or different circumstances.'}`
    }))
  };
}

function generatePlanExplanation(plan: any): string {
  const grades = Object.keys(plan).filter(key => key.startsWith('grade_'));
  const currentGrade = Math.min(...grades.map(g => parseInt(g.split('_')[1])));
  
  return `Your four-year plan starts in grade ${currentGrade} with ${plan[`grade_${currentGrade}`]?.focus || 'academic foundation building'}. Each year builds toward your career goals with specific courses, activities, and milestones. After graduation, you'll ${plan.post_graduation?.education_path || 'pursue further education or training'} with an estimated timeline of ${plan.post_graduation?.timeline || '2-4 years'}.`;
}

function generateNextStepsExplanation(recommendations: any): string[] {
  const steps = [
    'Review your top career matches and research what daily work looks like',
    'Talk to professionals in your fields of interest through informational interviews',
    'Explore relevant courses and activities mentioned in your four-year plan'
  ];
  
  if (recommendations.comparison_questions.length > 0) {
    steps.push('Consider the comparison questions to help narrow your choices');
  }
  
  steps.push('Meet with your school counselor to discuss these recommendations and create an action plan');
  
  return steps;
}

function getReadinessDescription(readiness: string): string {
  if (readiness.includes('High')) return 'you\'re ready to make concrete decisions about your future';
  if (readiness.includes('Moderate')) return 'you\'re actively exploring and narrowing your options';
  return 'you\'re in the early stages of career exploration, which is perfectly normal';
}

function getClusterDescription(clusterId: string): string {
  const descriptions = {
    'C1': 'hands-on work, building, and technical problem-solving',
    'C2': 'helping people, healthcare, and life sciences',
    'C3': 'technology, engineering, and systematic thinking',
    'C4': 'business operations, finance, and management',
    'C5': 'creative expression, design, and artistic work',
    'C6': 'education, social services, and community support',
    'C7': 'law, policy, and public service',
    'C8': 'scientific research and discovery',
    'C9': 'communication, sales, and relationship building',
    'C10': 'entrepreneurship, innovation, and high-risk ventures'
  };
  return descriptions[clusterId as keyof typeof descriptions] || 'various professional activities';
}

export default router;