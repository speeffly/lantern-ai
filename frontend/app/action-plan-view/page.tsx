'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '../components/Header';
import CareerRoadmapView from '../components/CareerRoadmapView';

interface ActionStep {
  id: string;
  title: string;
  description: string;
  category: 'education' | 'skills' | 'experience' | 'networking' | 'research';
  timeframe: 'immediate' | 'short-term' | 'long-term';
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
}

interface ActionPlan {
  careerTitle: string;
  steps: ActionStep[];
  estimatedTimeToCareer: string;
}

function ActionPlanContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  
  const [actionPlan, setActionPlan] = useState<ActionPlan | null>(null);
  const [assessmentData, setAssessmentData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'immediate' | 'short-term' | 'long-term'>('all');
  const [activeTab, setActiveTab] = useState<'roadmaps' | 'action-plan'>('roadmaps');

  useEffect(() => {
    if (sessionId) {
      loadAssessmentData();
    } else {
      loadActionPlan();
    }
  }, [sessionId]);

  const loadAssessmentData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/counselor-assessment/results/${sessionId}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAssessmentData(data.data);
          console.log('Assessment data loaded:', data.data);
        } else {
          console.error('Failed to load assessment data:', data.error);
          loadActionPlan(); // Fallback to mock data
        }
      } else {
        console.error('Failed to load assessment data:', response.statusText);
        loadActionPlan(); // Fallback to mock data
      }
    } catch (error) {
      console.error('Error loading assessment data:', error);
      loadActionPlan(); // Fallback to mock data
    } finally {
      setIsLoading(false);
    }
  };

  const loadActionPlan = async () => {
    try {
      setIsLoading(true);
      // Create a mock action plan for demo
      const mockPlan: ActionPlan = {
        careerTitle: 'Sample Career',
        estimatedTimeToCareer: '2-4 years',
        steps: [
          {
            id: '1',
            title: 'Complete High School with Strong Science Grades',
            description: 'Focus on biology, chemistry, and math courses. Maintain a GPA of 3.0 or higher.',
            category: 'education',
            timeframe: 'immediate',
            priority: 'high',
            completed: false
          },
          {
            id: '2',
            title: 'Research Nursing Programs',
            description: 'Look into local community colleges and universities offering nursing programs.',
            category: 'research',
            timeframe: 'immediate',
            priority: 'high',
            completed: false
          },
          {
            id: '3',
            title: 'Volunteer at Local Hospital',
            description: 'Gain experience in healthcare environment and network with professionals.',
            category: 'experience',
            timeframe: 'short-term',
            priority: 'medium',
            completed: false
          },
          {
            id: '4',
            title: 'Complete Prerequisites',
            description: 'Take required courses like anatomy, physiology, and microbiology.',
            category: 'education',
            timeframe: 'short-term',
            priority: 'high',
            completed: false
          },
          {
            id: '5',
            title: 'Apply to Nursing School',
            description: 'Submit applications to accredited nursing programs.',
            category: 'education',
            timeframe: 'long-term',
            priority: 'high',
            completed: false
          }
        ]
      };

      setActionPlan(mockPlan);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading action plan:', error);
      setIsLoading(false);
    }
  };

  const toggleStepCompletion = (stepId: string) => {
    if (!actionPlan) return;

    const updatedSteps = actionPlan.steps.map(step =>
      step.id === stepId ? { ...step, completed: !step.completed } : step
    );

    setActionPlan({
      ...actionPlan,
      steps: updatedSteps
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'education': return '🎓';
      case 'skills': return '💪';
      case 'experience': return '💼';
      case 'networking': return '🤝';
      case 'research': return '🔍';
      default: return '📋';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'education': return 'bg-blue-100 text-blue-800';
      case 'skills': return 'bg-green-100 text-green-800';
      case 'experience': return 'bg-purple-100 text-purple-800';
      case 'networking': return 'bg-orange-100 text-orange-800';
      case 'research': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Prepare data for roadmap view
  const getCareersFromAssessment = () => {
    if (!assessmentData?.recommendations?.topJobMatches) {
      return [];
    }

    return assessmentData.recommendations.topJobMatches.map((match: any) => ({
      title: match.career.title,
      sector: match.career.sector,
      matchScore: match.matchScore,
      averageSalary: match.career.averageSalary || match.localOpportunities?.averageLocalSalary || 50000,
      requiredEducation: match.career.requiredEducation,
      description: match.career.description
    }));
  };

  const getStudentDataFromAssessment = () => {
    if (!assessmentData) {
      return {
        grade: 11,
        zipCode: '12345',
        courseHistory: {},
        academicPerformance: {},
        supportLevel: 'moderate',
        educationCommitment: 'bachelors'
      };
    }

    return {
      grade: assessmentData.recommendations?.studentProfile?.grade || 11,
      zipCode: assessmentData.recommendations?.studentProfile?.location || '12345',
      courseHistory: assessmentData.recommendations?.studentProfile?.courseHistory || {},
      academicPerformance: assessmentData.session?.responses?.q4_academic_performance || {},
      supportLevel: 'moderate', // Could be extracted from responses
      educationCommitment: assessmentData.session?.responses?.q7_education_commitment || 'bachelors'
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Career Roadmaps" />
        <div className="flex items-center justify-center pt-20">
          <div className="text-xl">Loading career roadmaps...</div>
        </div>
      </div>
    );
  }

  // If we have assessment data, show roadmaps; otherwise show action plan
  if (assessmentData) {
    const careers = getCareersFromAssessment();
    const studentData = getStudentDataFromAssessment();

    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Career Roadmaps" />
        
        {/* Header */}
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Link href="/results" className="text-blue-600 hover:underline mb-4 inline-block">
              ← Back to Results
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Your Personalized Career Roadmaps
            </h1>
            <p className="text-gray-600">
              Detailed step-by-step paths to achieve your career goals based on your assessment
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {careers.length > 0 ? (
            <CareerRoadmapView careers={careers} studentData={studentData} />
          ) : (
            <div className="text-center py-12">
              <p className="text-xl text-gray-600 mb-4">No career recommendations found</p>
              <Link href="/counselor-assessment" className="text-blue-600 hover:underline">
                Take Assessment
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Fallback to action plan view
  if (!actionPlan) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Action Plan" />
        <div className="flex items-center justify-center pt-20">
          <div className="text-center">
            <p className="text-xl text-red-600 mb-4">No data found</p>
            <Link href="/counselor-assessment" className="text-blue-600 hover:underline">
              Take Assessment
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const filteredSteps = filter === 'all' 
    ? actionPlan.steps 
    : actionPlan.steps.filter(s => s.timeframe === filter);

  const completedCount = actionPlan.steps.filter(s => s.completed).length;
  const progressPercent = Math.round((completedCount / actionPlan.steps.length) * 100);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Action Plan" />
      
      {/* Career Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/results" className="text-blue-600 hover:underline mb-4 inline-block">
            ← Back to Results
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Action Plan: {actionPlan.careerTitle}
          </h1>
          <p className="text-gray-600">
            Estimated time to career: {actionPlan.estimatedTimeToCareer}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Overview */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Your Progress</h2>
            <span className="text-2xl font-bold text-blue-600">{progressPercent}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
            <div 
              className="bg-blue-600 h-4 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-sm text-gray-600">
            {completedCount} of {actionPlan.steps.length} steps completed
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <div className="flex space-x-2">
            {['all', 'immediate', 'short-term', 'long-term'].map((filterOption) => (
              <button
                key={filterOption}
                onClick={() => setFilter(filterOption as any)}
                className={`px-4 py-2 rounded-lg ${
                  filter === filterOption 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filterOption === 'all' ? 'All Steps' : 
                 filterOption.charAt(0).toUpperCase() + filterOption.slice(1).replace('-', '-')}
              </button>
            ))}
          </div>
        </div>

        {/* Action Steps */}
        <div className="space-y-4">
          {filteredSteps.map((step) => (
            <div
              key={step.id}
              className={`bg-white rounded-lg shadow-lg p-6 transition-all ${
                step.completed ? 'opacity-75' : ''
              }`}
            >
              <div className="flex items-start">
                <input
                  type="checkbox"
                  checked={step.completed}
                  onChange={() => toggleStepCompletion(step.id)}
                  className="mt-1 h-5 w-5 text-blue-600 rounded cursor-pointer"
                />
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={`text-lg font-semibold ${
                      step.completed ? 'line-through text-gray-500' : 'text-gray-900'
                    }`}>
                      {getCategoryIcon(step.category)} {step.title}
                    </h3>
                  </div>
                  
                  <p className="text-gray-600 mb-3">{step.description}</p>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 text-sm rounded-full ${getCategoryColor(step.category)}`}>
                      {step.category.charAt(0).toUpperCase() + step.category.slice(1)}
                    </span>
                    <span className={`px-3 py-1 text-sm rounded-full ${
                      step.priority === 'high' 
                        ? 'bg-red-100 text-red-800' 
                        : step.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                    }`}>
                      {step.priority.charAt(0).toUpperCase() + step.priority.slice(1)} Priority
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ActionPlanViewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <Header title="Action Plan" />
        <div className="flex items-center justify-center pt-20">
          <div className="text-xl">Loading action plan...</div>
        </div>
      </div>
    }>
      <ActionPlanContent />
    </Suspense>
  );
}