'use client';

import { useState, useEffect } from 'react';

interface CareerRoadmapOverview {
  totalTimeToCareer: string;
  estimatedTotalCost: number;
  educationLevel: string;
  difficultyLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  jobAvailability: 'High' | 'Medium' | 'Low';
}

interface CareerPhase {
  timeframe: string;
  requiredCourses?: string[];
  recommendedCourses?: string[];
  extracurriculars?: string[];
  skillsToFocus?: string[];
  milestones?: string[];
  educationType?: string;
  specificPrograms?: string[];
  estimatedCost?: number;
  keyRequirements?: string[];
  internshipOpportunities?: string[];
  entryLevelPositions?: string[];
  certifications?: string[];
  skillDevelopment?: string[];
  networkingTips?: string[];
  careerProgression?: string[];
  advancedCertifications?: string[];
  leadershipOpportunities?: string[];
  salaryProgression?: string[];
}

interface CareerRoadmapData {
  careerTitle: string;
  overview: CareerRoadmapOverview;
  detailedPath: {
    highSchoolPhase: CareerPhase;
    postSecondaryPhase: CareerPhase;
    earlyCareerPhase: CareerPhase;
    advancementPhase: CareerPhase;
  };
  personalizedRecommendations: {
    strengthsToLeverage: string[];
    areasForImprovement: string[];
    specificActions: string[];
    timelineAdjustments: string[];
  };
  localContext: {
    nearbySchools: string[];
    localEmployers: string[];
    regionalOpportunities: string[];
    costOfLivingImpact: string;
  };
}

interface CareerRoadmapCardProps {
  career: {
    title: string;
    sector: string;
    matchScore: number;
    averageSalary: number;
    requiredEducation: string;
  };
  roadmap?: CareerRoadmapData;
  onGenerateRoadmap: (career: any) => void;
  isGenerating: boolean;
}

function CareerRoadmapCard({ career, roadmap, onGenerateRoadmap, isGenerating }: CareerRoadmapCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activePhase, setActivePhase] = useState<'highSchool' | 'postSecondary' | 'earlyCareer' | 'advancement'>('highSchool');

  // Auto-generate roadmap when component mounts
  useEffect(() => {
    if (!roadmap && !isGenerating) {
      onGenerateRoadmap(career);
    }
  }, [career, roadmap, isGenerating, onGenerateRoadmap]);

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'text-green-600 bg-green-100';
      case 'Intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'Advanced': return 'text-orange-600 bg-orange-100';
      case 'Expert': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getAvailabilityColor = (level: string) => {
    switch (level) {
      case 'High': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Low': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const renderPhaseContent = (phase: CareerPhase, phaseType: string) => {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-gray-800 capitalize">
            {phaseType.replace(/([A-Z])/g, ' $1').trim()} Phase
          </h4>
          <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
            {phase.timeframe}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {phase.requiredCourses && (
            <div>
              <h5 className="font-medium text-gray-700 mb-2">Required Courses</h5>
              <ul className="text-sm text-gray-600 space-y-1">
                {phase.requiredCourses.map((course, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    {course}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {phase.recommendedCourses && (
            <div>
              <h5 className="font-medium text-gray-700 mb-2">Recommended Courses</h5>
              <ul className="text-sm text-gray-600 space-y-1">
                {phase.recommendedCourses.map((course, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    {course}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {phase.skillsToFocus && (
            <div>
              <h5 className="font-medium text-gray-700 mb-2">Skills to Focus On</h5>
              <ul className="text-sm text-gray-600 space-y-1">
                {phase.skillsToFocus.map((skill, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-purple-500 mr-2">•</span>
                    {skill}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {phase.milestones && (
            <div>
              <h5 className="font-medium text-gray-700 mb-2">Key Milestones</h5>
              <ul className="text-sm text-gray-600 space-y-1">
                {phase.milestones.map((milestone, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-orange-500 mr-2">•</span>
                    {milestone}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {phase.specificPrograms && (
            <div>
              <h5 className="font-medium text-gray-700 mb-2">Specific Programs</h5>
              <ul className="text-sm text-gray-600 space-y-1">
                {phase.specificPrograms.map((program, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-indigo-500 mr-2">•</span>
                    {program}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {phase.estimatedCost && (
            <div>
              <h5 className="font-medium text-gray-700 mb-2">Estimated Cost</h5>
              <p className="text-lg font-semibold text-green-600">
                {formatCurrency(phase.estimatedCost)}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      {/* Career Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800 mb-2">{career.title}</h3>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {career.sector}
              </span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                {career.matchScore}% Match
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-gray-800">
              {formatCurrency(career.averageSalary)}
            </p>
            <p className="text-sm text-gray-600">{career.requiredEducation}</p>
          </div>
        </div>

        {/* Overview Cards - Always show when roadmap is available */}
        {roadmap && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Time to Career</p>
              <p className="font-semibold text-gray-800">{roadmap.overview.totalTimeToCareer}</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Total Cost</p>
              <p className="font-semibold text-gray-800">{formatCurrency(roadmap.overview.estimatedTotalCost)}</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Difficulty</p>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(roadmap.overview.difficultyLevel)}`}>
                {roadmap.overview.difficultyLevel}
              </span>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Job Market</p>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(roadmap.overview.jobAvailability)}`}>
                {roadmap.overview.jobAvailability}
              </span>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isGenerating && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-blue-800">Generating personalized roadmap...</span>
            </div>
          </div>
        )}

        {/* Action Button - Only show expand/collapse when roadmap is ready */}
        {roadmap && (
          <div className="mt-4">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {isExpanded ? '▲ Hide Detailed Roadmap' : '▼ View Detailed Roadmap'}
            </button>
          </div>
        )}
      </div>

      {/* Detailed Roadmap */}
      {roadmap && isExpanded && (
        <div className="p-6">
          {/* Phase Navigation */}
          <div className="flex flex-wrap gap-2 mb-6">
            {[
              { key: 'highSchool', label: 'High School' },
              { key: 'postSecondary', label: 'Post-Secondary' },
              { key: 'earlyCareer', label: 'Early Career' },
              { key: 'advancement', label: 'Advancement' }
            ].map((phase) => (
              <button
                key={phase.key}
                onClick={() => setActivePhase(phase.key as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activePhase === phase.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {phase.label}
              </button>
            ))}
          </div>

          {/* Phase Content */}
          <div className="bg-gray-50 rounded-lg p-6">
            {activePhase === 'highSchool' && renderPhaseContent(roadmap.detailedPath.highSchoolPhase, 'highSchool')}
            {activePhase === 'postSecondary' && renderPhaseContent(roadmap.detailedPath.postSecondaryPhase, 'postSecondary')}
            {activePhase === 'earlyCareer' && renderPhaseContent(roadmap.detailedPath.earlyCareerPhase, 'earlyCareer')}
            {activePhase === 'advancement' && renderPhaseContent(roadmap.detailedPath.advancementPhase, 'advancement')}
          </div>

          {/* Personalized Recommendations */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-3">Personalized for You</h4>
              <div className="space-y-3">
                <div>
                  <h5 className="text-sm font-medium text-blue-700 mb-1">Strengths to Leverage</h5>
                  <ul className="text-sm text-blue-600 space-y-1">
                    {roadmap.personalizedRecommendations.strengthsToLeverage.map((strength, index) => (
                      <li key={index}>• {strength}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-blue-700 mb-1">Areas for Improvement</h5>
                  <ul className="text-sm text-blue-600 space-y-1">
                    {roadmap.personalizedRecommendations.areasForImprovement.map((area, index) => (
                      <li key={index}>• {area}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-3">Local Context</h4>
              <div className="space-y-3">
                <div>
                  <h5 className="text-sm font-medium text-green-700 mb-1">Nearby Schools</h5>
                  <ul className="text-sm text-green-600 space-y-1">
                    {roadmap.localContext.nearbySchools.slice(0, 3).map((school, index) => (
                      <li key={index}>• {school}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-green-700 mb-1">Local Employers</h5>
                  <ul className="text-sm text-green-600 space-y-1">
                    {roadmap.localContext.localEmployers.slice(0, 3).map((employer, index) => (
                      <li key={index}>• {employer}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface CareerRoadmapViewProps {
  careers: any[];
  studentData: any;
}

export default function CareerRoadmapView({ careers, studentData }: CareerRoadmapViewProps) {
  const [roadmaps, setRoadmaps] = useState<{ [careerTitle: string]: CareerRoadmapData }>({});
  const [generatingRoadmaps, setGeneratingRoadmaps] = useState<{ [careerTitle: string]: boolean }>({});

  const generateRoadmap = async (career: any) => {
    setGeneratingRoadmaps(prev => ({ ...prev, [career.title]: true }));

    try {
      const response = await fetch('/api/career-roadmap/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          career: {
            title: career.title,
            sector: career.sector,
            requiredEducation: career.requiredEducation,
            averageSalary: career.averageSalary,
            description: career.description
          },
          studentData: studentData
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setRoadmaps(prev => ({ ...prev, [career.title]: data.data }));
        } else {
          console.error('Failed to generate roadmap:', data.error);
        }
      } else {
        console.error('Failed to generate roadmap:', response.statusText);
      }
    } catch (error) {
      console.error('Error generating roadmap:', error);
    } finally {
      setGeneratingRoadmaps(prev => ({ ...prev, [career.title]: false }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Career Roadmaps</h2>
        <p className="text-gray-600">
          Personalized step-by-step paths to achieve your career goals
        </p>
      </div>

      <div className="space-y-6">
        {careers.map((career, index) => (
          <CareerRoadmapCard
            key={career.title || index}
            career={career}
            roadmap={roadmaps[career.title]}
            onGenerateRoadmap={generateRoadmap}
            isGenerating={generatingRoadmaps[career.title] || false}
          />
        ))}
      </div>
    </div>
  );
}