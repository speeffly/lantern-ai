'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import JobListings from '../components/JobListings';
import FeedbackWidget from '../components/FeedbackWidget';
import UndecidedCareerOptions from '../components/UndecidedCareerOptions';

interface JobRecommendation {
  career: {
    id: string;
    title: string;
    description: string;
    sector: string;
    averageSalary: number;
    requiredEducation: string;
  };
  matchScore: number;
  matchReasons: string[];
  localOpportunities: {
    estimatedJobs: number;
    averageLocalSalary: number;
    topEmployers: string[];
    distanceFromStudent: number;
  };
  educationPath: {
    highSchoolCourses: string[];
    postSecondaryOptions: string[];
    timeToCareer: string;
    estimatedCost: number;
  };
  careerPathway?: {
    steps: string[];
    timeline: string;
    requirements: string[];
  };
  skillGaps?: {
    skill: string;
    importance: string;
    howToAcquire: string;
  }[];
}

interface CounselorRecommendation {
  studentProfile: {
    grade: number;
    location: string;
    strengths: string[];
    interests: string[];
    careerReadiness: string;
  };
  topJobMatches: JobRecommendation[];
  careerRoadmap: any;
  aiRecommendations?: {
    academicPlan: any;
    localJobs: any[];
    careerPathway: any;
    skillGaps: any[];
    actionItems: any[];
  };
  parentSummary: {
    overview: string;
    keyRecommendations: string[];
    supportActions: string[];
    timelineHighlights: string[];
  };
  counselorNotes: {
    assessmentInsights: string[];
    recommendationRationale: string[];
    followUpActions: string[];
    parentMeetingTopics: string[];
  };
}

// Helper function to safely check AI recommendations
const hasAIError = (recommendations: CounselorRecommendation): boolean => {
  return !!(recommendations.aiRecommendations?.academicPlan as any)?.error;
};

const hasAIRecommendations = (recommendations: CounselorRecommendation): boolean => {
  // Check if aiRecommendations exists AND has the aiProcessed flag set to true
  return !!(
    recommendations.aiRecommendations && 
    (recommendations.aiRecommendations as any)?.aiProcessed === true &&
    !hasAIError(recommendations)
  );
};

export default function CounselorResultsPage() {
  const router = useRouter();
  const [results, setResults] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('careers');
  const [isLoading, setIsLoading] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const [selectedCareer, setSelectedCareer] = useState<string | null>(null);

  useEffect(() => {
    loadResults();
    // Load previously selected career from localStorage
    const storedSelectedCareer = localStorage.getItem('selectedCareer');
    if (storedSelectedCareer) {
      setSelectedCareer(storedSelectedCareer);
    }
  }, []);

  // Helper function to get user-specific storage key
  const getUserSpecificKey = (baseKey: string): string => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      return `${baseKey}_anonymous`;
    }
    
    try {
      const user = JSON.parse(storedUser);
      if (user?.email) {
        return `${baseKey}_user_${user.email}`;
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
    
    return `${baseKey}_anonymous`;
  };

  const loadResults = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // If user is logged in, try to load from database first
      if (token) {
        console.log('🔐 User is logged in, attempting to load from database...');
        
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/counselor-assessment/history`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data && data.data.length > 0) {
              // Get the most recent completed session
              const latestSession = data.data.find((s: any) => s.status === 'completed');
              
              if (latestSession) {
                console.log('✅ Found completed assessment in database, loading full results...');
                
                // Fetch the full results for this session
                const resultsResponse = await fetch(
                  `${process.env.NEXT_PUBLIC_API_URL}/api/counselor-assessment/results/${latestSession.id}`,
                  {
                    headers: {
                      'Authorization': `Bearer ${token}`
                    }
                  }
                );

                if (resultsResponse.ok) {
                  const resultsData = await resultsResponse.json();
                  if (resultsData.success && resultsData.data.recommendations) {
                    console.log('✅ Loaded results from database successfully');
                    
                    // Format the data to match the expected structure
                    const formattedResults = {
                      recommendations: resultsData.data.recommendations,
                      summary: {
                        totalJobMatches: resultsData.data.recommendations.topJobMatches?.length || 0,
                        topCareer: resultsData.data.recommendations.topJobMatches?.[0]?.career.title,
                        averageSalary: resultsData.data.recommendations.topJobMatches?.[0]?.localOpportunities.averageLocalSalary,
                        educationPath: resultsData.data.recommendations.topJobMatches?.[0]?.educationPath.timeToCareer,
                        careerReadiness: resultsData.data.recommendations.studentProfile?.careerReadiness
                      },
                      timestamp: latestSession.completed_at,
                      source: 'database'
                    };
                    
                    setResults(formattedResults);
                    setIsLoading(false);
                    
                    // Also save to localStorage as cache
                    const userSpecificKey = getUserSpecificKey('counselorAssessmentResults');
                    const storedUser = localStorage.getItem('user');
                    const user = storedUser ? JSON.parse(storedUser) : null;
                    localStorage.setItem(userSpecificKey, JSON.stringify({
                      ...formattedResults,
                      userEmail: user?.email
                    }));
                    
                    return;
                  }
                }
              }
            }
          }
          
          console.log('⚠️ No completed assessment found in database, checking localStorage...');
        } catch (dbError) {
          console.error('⚠️ Database load failed, falling back to localStorage:', dbError);
        }
      }
      
      // Fallback to localStorage (for anonymous users or if database load fails)
      console.log('📦 Loading from localStorage...');
      const userSpecificKey = getUserSpecificKey('counselorAssessmentResults');
      let storedResults = localStorage.getItem(userSpecificKey);
      
      console.log('🔍 Checking for user-specific results:', userSpecificKey, !!storedResults);
      
      // If no user-specific results, check old key for migration
      if (!storedResults) {
        storedResults = localStorage.getItem('counselorAssessmentResults');
        console.log('🔍 Checking for old results:', !!storedResults);
        
        if (storedResults) {
          // Migrate old results to user-specific key if user is logged in
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            try {
              const user = JSON.parse(storedUser);
              const results = JSON.parse(storedResults);
              
              // Only migrate if results belong to current user
              if (results.userEmail === user.email || !results.userEmail) {
                console.log('🔄 Migrating old results to user-specific storage');
                localStorage.setItem(userSpecificKey, storedResults);
                localStorage.removeItem('counselorAssessmentResults');
              } else {
                console.log('⚠️ Old results belong to different user, not migrating');
                storedResults = null;
              }
            } catch (error) {
              console.error('Error during migration:', error);
              storedResults = null;
            }
          }
        }
      }
      
      if (storedResults) {
        const data = JSON.parse(storedResults);
        
        // Additional security check: verify user match
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          if (data.userEmail && data.userEmail !== user.email) {
            console.log('⚠️ Results belong to different user, clearing and redirecting');
            localStorage.removeItem(userSpecificKey);
            alert('Please complete the Enhanced Assessment to see your results.');
            router.push('/counselor-assessment');
            return;
          }
        }
        
        console.log('✅ Results loaded from localStorage');
        setResults({
          ...data,
          source: 'localStorage'
        });
        setIsLoading(false);
      } else {
        console.log('❌ No stored results found anywhere, redirecting to assessment');
        alert('Please complete the Enhanced Assessment first to see your results.');
        router.push('/counselor-assessment');
      }
    } catch (error) {
      console.error('❌ Error loading results:', error);
      alert('There was an error loading your results. Please retake the assessment.');
      router.push('/counselor-assessment');
    }
  };

  const shareWithParents = async () => {
    if (!results?.recommendations?.parentSummary) return;
    if (isSharing) {
      console.log('Share already in progress, ignoring duplicate request');
      return;
    }

    const summary = results.recommendations.parentSummary;
    const shareText = `
Career Assessment Results for ${results.recommendations.studentProfile?.grade || 'High School'} Student

${summary.overview}

Key Recommendations:
${summary.keyRecommendations.map((rec: string) => `• ${rec}`).join('\n')}

Timeline Highlights:
${summary.timelineHighlights.map((highlight: string) => `• ${highlight}`).join('\n')}

How You Can Support:
${summary.supportActions.map((action: string) => `• ${action}`).join('\n')}

Generated by Lantern AI Career Guidance Platform
    `.trim();

    try {
      setIsSharing(true);
      if (navigator.share) {
        await navigator.share({
          title: 'Career Assessment Results',
          text: shareText
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        alert('Career plan copied to clipboard! You can now share it with your parents.');
      }
    } catch (error) {
      console.warn('Share failed, falling back to clipboard:', error);
      try {
        await navigator.clipboard.writeText(shareText);
        alert('Career plan copied to clipboard! You can now share it with your parents.');
      } catch (clipboardError) {
        console.error('Clipboard fallback failed:', clipboardError);
        alert('Unable to share right now. Please try again in a moment.');
      }
    } finally {
      setIsSharing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Your Career Plan" />
        <div className="flex items-center justify-center pt-20">
          <div className="text-xl">Loading your personalized career plan...</div>
        </div>
      </div>
    );
  }

  if (!results?.recommendations) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Your Career Plan" />
        <div className="flex items-center justify-center pt-20">
          <div className="text-center">
            <div className="text-xl mb-4">No results found</div>
            <button
              onClick={() => router.push('/counselor-assessment')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Take Assessment
            </button>
          </div>
        </div>
      </div>
    );
  }

  const recommendations: CounselorRecommendation = results.recommendations;
  const summary = results.summary;

  // Check if this is an undecided path result
  const isUndecidedPath = results.recommendations?.undecidedPath || 
                         results.recommendations?.studentProfile?.pathType === 'undecided' ||
                         (results.recommendations?.topJobMatches?.length === 3 && 
                          results.recommendations?.selectionRationale);

  // Calculate display salary based on selected career or default
  const getDisplaySalary = () => {
    if (isUndecidedPath && selectedCareer && recommendations?.topJobMatches) {
      // Find the selected career and return its salary
      const selectedCareerMatch = recommendations.topJobMatches.find(
        (match: any) => match.career.id === selectedCareer
      );
      if (selectedCareerMatch) {
        return selectedCareerMatch.localOpportunities.averageLocalSalary;
      }
    }
    // Default to summary average salary
    return summary?.averageSalary || 0;
  };

  // Get display text for salary section
  const getSalaryDisplayText = () => {
    if (isUndecidedPath && selectedCareer && recommendations?.topJobMatches) {
      const selectedCareerMatch = recommendations.topJobMatches.find(
        (match: any) => match.career.id === selectedCareer
      );
      if (selectedCareerMatch) {
        return `${selectedCareerMatch.career.title} Salary`;
      }
    }
    return 'Average Local Salary';
  };

  // Handler for career selection in undecided path
  const handleCareerSelect = (careerId: string) => {
    console.log('Career selected:', careerId);
    // Update the selected career state
    setSelectedCareer(careerId);
    // Store the selected career for future reference
    localStorage.setItem('selectedCareer', careerId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Your Personalized Career Plan" />
      
      <div className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header Summary */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {isUndecidedPath ? 'Your Career Exploration Options' : 'Your Personalized Career Plan'}
              </h1>
              <p className="text-lg text-gray-600 mb-3">
                {isUndecidedPath 
                  ? 'We\'ve selected 3 diverse career paths to help you discover your interests and make an informed decision'
                  : 'Based on your assessment, here are your top career matches and action plan'
                }
              </p>
              
              {/* Selected Career Indicator for Undecided Path */}
              {isUndecidedPath && selectedCareer && recommendations?.topJobMatches && (
                <div className="mb-3">
                  <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 text-sm rounded-full border border-blue-200">
                    ✅ Currently Exploring: <strong className="ml-1">
                      {recommendations.topJobMatches.find((match: any) => match.career.id === selectedCareer)?.career.title}
                    </strong>
                  </div>
                </div>
              )}
              
              {hasAIRecommendations(recommendations) ? (
                <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                  ✅ AI-Powered Recommendations Included
                </div>
              ) : hasAIError(recommendations) ? (
                <div className="inline-flex items-center px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full">
                  🚨 Real AI Mode Enabled - OpenAI Key Required
                </div>
              ) : (
                <div className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  🔄 Using Fallback AI Mode (Testing)
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{summary?.totalJobMatches || 0}</div>
                <div className="text-sm text-gray-600">Career Matches</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  ${getDisplaySalary().toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">{getSalaryDisplayText()}</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 capitalize">
                  {summary?.careerReadiness || 'Developing'}
                </div>
                <div className="text-sm text-gray-600">Career Readiness</div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  Grade {recommendations.studentProfile.grade}
                </div>
                <div className="text-sm text-gray-600">Current Grade</div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={shareWithParents}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 mr-4"
              >
                📱 Share with Parents
              </button>
              <button
                onClick={() => router.push('/counselor-assessment?retake=true')}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                🔄 Retake Assessment
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-white rounded-lg shadow-lg mb-8">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-8">
                {[
                  { id: 'careers', label: isUndecidedPath ? 'Career Options' : 'Career Matches', icon: '💼' },
                  { id: 'plan', label: 'Career Roadmap', icon: '📅' },
                  { id: 'parent', label: 'Parent Summary', icon: '👨‍👩‍👧‍👦' },
                  { id: 'counselor', label: 'Counselor Notes', icon: '📝' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-2 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-8">
              {/* Undecided Path - 3 Career Options */}
              {isUndecidedPath && activeTab === 'careers' && (
                <UndecidedCareerOptions
                  careerOptions={recommendations.topJobMatches}
                  selectionRationale={results.recommendations.selectionRationale || 'These careers were selected based on your assessment responses to help you explore different pathways.'}
                  nextSteps={results.recommendations.nextSteps || [
                    'Research each career option in detail',
                    'Talk to professionals in these fields', 
                    'Consider job shadowing opportunities'
                  ]}
                  zipCode={recommendations.studentProfile.location}
                  onCareerSelect={handleCareerSelect}
                />
              )}

              {/* Regular Career Matches Tab (for decided students) */}
              {!isUndecidedPath && activeTab === 'careers' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Your Top Career Matches</h2>
                  <div className="space-y-6">
                    {recommendations.topJobMatches.slice(0, 10).map((job, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900">
                              #{index + 1} {job.career.title}
                            </h3>
                            <p className="text-gray-600 capitalize">{job.career.sector} Sector</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-600">
                              ${job.localOpportunities.averageLocalSalary.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-500">Local Average</div>
                          </div>
                        </div>

                        {/* Why This Matches You - Moved to top for prominence */}
                        <div className="mb-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                          <h4 className="font-semibold text-blue-900 mb-2">Why This Matches You</h4>
                          <div className="flex flex-wrap gap-2">
                            {job.matchReasons.map((reason, idx) => (
                              <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                                {reason}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Local Opportunities</h4>
                            <ul className="text-sm text-gray-600 space-y-1">
                              <li>• {job.localOpportunities.estimatedJobs} estimated positions</li>
                              <li>• {job.localOpportunities.distanceFromStudent} miles from you</li>
                              <li>• Top employers: {job.localOpportunities.topEmployers.slice(0, 2).join(', ')}</li>
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Education Path</h4>
                            <ul className="text-sm text-gray-600 space-y-1">
                              <li>• {job.educationPath.timeToCareer}</li>
                              <li>• Estimated cost: ${job.educationPath.estimatedCost.toLocaleString()}</li>
                              <li>• Required: {job.career.requiredEducation}</li>
                            </ul>
                          </div>
                        </div>

                        <div className="mt-4">
                          <h4 className="font-semibold text-gray-900 mb-2">Recommended High School Courses</h4>
                          <div className="flex flex-wrap gap-2">
                            {job.educationPath.highSchoolCourses.slice(0, 5).map((course, idx) => (
                              <span key={idx} className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                                {course}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* AI Recommendations Button and Content */}
                        <div className="mt-6 pt-4 border-t border-gray-100">
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="font-semibold text-gray-900">AI-Powered Career Path</h4>
                            <button
                              onClick={() => {
                                const careerElement = document.getElementById(`career-ai-${index}`);
                                if (careerElement) {
                                  careerElement.style.display = careerElement.style.display === 'none' ? 'block' : 'none';
                                }
                              }}
                              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all flex items-center space-x-2"
                            >
                              <span>🤖</span>
                              <span>View AI Recommendations</span>
                            </button>
                          </div>

                          {/* AI Recommendations Content (Initially Hidden) */}
                          <div id={`career-ai-${index}`} style={{ display: 'none' }} className="space-y-6">
                            {recommendations.aiRecommendations ? (
                              <>
                                {/* Career-Specific AI Pathway */}
                                <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
                                  <h5 className="text-lg font-semibold mb-4 flex items-center text-purple-900">
                                    🛤️ AI-Generated Path for {job.career.title}
                                  </h5>
                                  
                                  {job.careerPathway && (
                                    <div className="mb-4">
                                      <div className="bg-white p-4 rounded-lg mb-4">
                                        <p className="text-sm text-purple-800 mb-2">
                                          <strong>Timeline:</strong> {job.careerPathway.timeline || 'Personalized for you'}
                                        </p>
                                        {job.careerPathway.requirements && (
                                          <p className="text-sm text-purple-800">
                                            <strong>Key Requirements:</strong> {job.careerPathway.requirements.join(', ')}
                                          </p>
                                        )}
                                      </div>
                                      
                                      {job.careerPathway.steps && (
                                        <div className="space-y-3">
                                          <h6 className="font-semibold text-purple-900">Step-by-Step Path:</h6>
                                          {job.careerPathway.steps.map((step: string, stepIndex: number) => (
                                            <div key={stepIndex} className="flex items-start">
                                              <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                                                {stepIndex + 1}
                                              </div>
                                              <div className="flex-grow bg-white p-3 rounded-lg">
                                                <p className="text-gray-700">{step}</p>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>

                                {/* Career-Specific Skill Gaps */}
                                {job.skillGaps && job.skillGaps.length > 0 && (
                                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                                    <h5 className="text-lg font-semibold mb-4 flex items-center text-orange-900">
                                      🎯 Skills to Develop for {job.career.title}
                                    </h5>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {job.skillGaps.map((gap: any, gapIndex: number) => (
                                        <div key={gapIndex} className="bg-white border border-orange-200 rounded-lg p-4">
                                          <div className="flex items-center mb-2">
                                            <h6 className="font-semibold text-gray-900">{gap.skill}</h6>
                                            <span className={`ml-2 px-2 py-1 text-xs rounded ${
                                              gap.importance === 'Critical' ? 'bg-red-100 text-red-800' :
                                              gap.importance === 'Important' ? 'bg-orange-100 text-orange-800' :
                                              'bg-yellow-100 text-yellow-800'
                                            }`}>
                                              {gap.importance}
                                            </span>
                                          </div>
                                          <p className="text-sm text-gray-600">{gap.howToAcquire}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Career-Specific Action Items */}
                                {recommendations.aiRecommendations.actionItems && recommendations.aiRecommendations.actionItems.length > 0 && (
                                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                                    <h5 className="text-lg font-semibold mb-4 flex items-center text-green-900">
                                      ✅ Next Steps for {job.career.title}
                                    </h5>
                                    <div className="space-y-3">
                                      {recommendations.aiRecommendations.actionItems.map((item: any, itemIndex: number) => (
                                        <div key={itemIndex} className="bg-white border border-green-200 rounded-lg p-4">
                                          <div className="flex items-start justify-between">
                                            <div className="flex-grow">
                                              <h6 className="font-semibold text-gray-900 mb-1">{item.title}</h6>
                                              <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                                              <div className="flex items-center space-x-4">
                                                <span className={`px-2 py-1 text-xs rounded ${
                                                  item.priority === 'high' ? 'bg-red-100 text-red-800' :
                                                  item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                  'bg-green-100 text-green-800'
                                                }`}>
                                                  {item.priority} priority
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                  📅 {item.timeline}
                                                </span>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Career-Specific Academic Plan */}
                                {recommendations.aiRecommendations.academicPlan && (
                                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                                    <h5 className="text-lg font-semibold mb-4 flex items-center text-blue-900">
                                      📚 Academic Plan for {job.career.title}
                                    </h5>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                      {recommendations.aiRecommendations.academicPlan.currentYear && (
                                        <div className="bg-white p-4 rounded-lg">
                                          <h6 className="font-semibold text-blue-900 mb-3">This Year</h6>
                                          <ul className="space-y-2">
                                            {recommendations.aiRecommendations.academicPlan.currentYear.map((course: any, courseIndex: number) => (
                                              <li key={courseIndex} className="text-sm text-blue-800">
                                                • {typeof course === 'string' ? course : course.courseName || course.title}
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                      {recommendations.aiRecommendations.academicPlan.nextYear && (
                                        <div className="bg-white p-4 rounded-lg">
                                          <h6 className="font-semibold text-green-900 mb-3">Next Year</h6>
                                          <ul className="space-y-2">
                                            {recommendations.aiRecommendations.academicPlan.nextYear.map((course: any, courseIndex: number) => (
                                              <li key={courseIndex} className="text-sm text-green-800">
                                                • {typeof course === 'string' ? course : course.courseName || course.title}
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                      {recommendations.aiRecommendations.academicPlan.longTerm && (
                                        <div className="bg-white p-4 rounded-lg">
                                          <h6 className="font-semibold text-purple-900 mb-3">Long Term</h6>
                                          <ul className="space-y-2">
                                            {recommendations.aiRecommendations.academicPlan.longTerm.map((course: any, courseIndex: number) => (
                                              <li key={courseIndex} className="text-sm text-purple-800">
                                                • {typeof course === 'string' ? course : course.courseName || course.title}
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Career-Specific Local Jobs */}
                                {recommendations.aiRecommendations.localJobs && recommendations.aiRecommendations.localJobs.length > 0 && (
                                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                                    <div className="flex justify-between items-center mb-4">
                                      <h5 className="text-lg font-semibold flex items-center text-gray-900">
                                        🌍 Local {job.career.title} Opportunities
                                      </h5>
                                      <button
                                        onClick={() => router.push('/jobs')}
                                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                                      >
                                        View All Jobs →
                                      </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {recommendations.aiRecommendations.localJobs.slice(0, 4).map((aiJob: any, jobIndex: number) => (
                                        <div key={jobIndex} className="bg-white border border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow">
                                          <div className="flex justify-between items-start mb-2">
                                            <h6 className="font-semibold text-gray-900">{aiJob.title}</h6>
                                            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                                              AI Match
                                            </span>
                                          </div>
                                          <p className="text-sm text-gray-600 mb-2">{aiJob.company}</p>
                                          <div className="flex justify-between items-center text-sm mb-3">
                                            <span className="text-green-600 font-medium">{aiJob.salary}</span>
                                            <span className="text-gray-500">{aiJob.location}</span>
                                          </div>
                                          {aiJob.distance && (
                                            <p className="text-xs text-gray-500 mb-3">📍 {aiJob.distance} miles away</p>
                                          )}
                                          <div className="flex space-x-2">
                                            <button
                                              onClick={() => {
                                                const searchQuery = encodeURIComponent(`${aiJob.title} ${aiJob.company} ${recommendations.studentProfile.location}`);
                                                router.push(`/jobs?search=${searchQuery}`);
                                              }}
                                              className="flex-1 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                                            >
                                              Find Similar
                                            </button>
                                            <button
                                              onClick={() => {
                                                const searchQuery = encodeURIComponent(`${aiJob.title} ${recommendations.studentProfile.location}`);
                                                window.open(`https://www.indeed.com/jobs?q=${searchQuery}`, '_blank');
                                              }}
                                              className="px-3 py-1 border border-gray-300 text-gray-700 text-xs rounded hover:bg-gray-50 transition-colors"
                                            >
                                              Indeed
                                            </button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="text-center py-8">
                                {hasAIError(recommendations) ? (
                                  <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                                    <div className="text-4xl mb-3">🚨</div>
                                    <h5 className="text-lg font-semibold text-red-900 mb-2">Real AI Mode - OpenAI Key Required</h5>
                                    <p className="text-sm text-red-800">
                                      Real AI recommendations require a valid OpenAI API key. Currently using fallback mode.
                                    </p>
                                  </div>
                                ) : (
                                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                                    <div className="text-4xl mb-3">🔄</div>
                                    <h5 className="text-lg font-semibold text-blue-900 mb-2">Using Fallback AI Mode</h5>
                                    <p className="text-sm text-blue-800">
                                      Currently using intelligent fallback recommendations for {job.career.title}.
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Job Listings for this career */}
                        <div className="mt-6 pt-4 border-t border-gray-100">
                          <h4 className="font-semibold text-gray-900 mb-3">Current Job Openings</h4>
                          <JobListings 
                            careerTitle={job.career.title}
                            zipCode={recommendations.studentProfile.location}
                            limit={3}
                            showTitle={false}
                          />
                        </div>

                        {/* Feedback Widget */}
                        <div className="mt-6 pt-4 border-t border-gray-100">
                          <FeedbackWidget
                            careerCode={job.career.id}
                            careerTitle={job.career.title}
                            userId={results?.userId}
                            sessionId={localStorage.getItem('sessionId') || undefined}
                            onFeedbackSubmitted={() => {
                              console.log('Feedback submitted for', job.career.title);
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Career Roadmap Tab */}
              {activeTab === 'plan' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Your Career Roadmap</h2>
                  
                  {recommendations.careerRoadmap ? (
                    <>
                      {/* Academic Plan by Grade */}
                      <div className="mb-8">
                        <h3 className="text-xl font-semibold mb-4">Academic Plan by Grade</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {Object.entries(recommendations.careerRoadmap.academicPlan || {}).map(([grade, plan]: [string, any]) => (
                            <div key={grade} className="border border-gray-200 rounded-lg p-6">
                              <h4 className="text-lg font-semibold mb-4">Grade {grade}</h4>
                              
                              <div className="space-y-3">
                                <div>
                                  <h5 className="font-medium text-gray-900">Core Courses</h5>
                                  <ul className="text-sm text-gray-600 list-disc list-inside">
                                    {plan.coreCourses?.map((course: string, idx: number) => (
                                      <li key={idx}>{course}</li>
                                    ))}
                                  </ul>
                                </div>
                                
                                <div>
                                  <h5 className="font-medium text-gray-900">Career Electives</h5>
                                  <ul className="text-sm text-gray-600 list-disc list-inside">
                                    {plan.electiveCourses?.map((course: string, idx: number) => (
                                      <li key={idx}>{course}</li>
                                    ))}
                                  </ul>
                                </div>
                                
                                <div>
                                  <h5 className="font-medium text-gray-900">Key Milestones</h5>
                                  <ul className="text-sm text-gray-600 list-disc list-inside">
                                    {plan.milestones?.map((milestone: string, idx: number) => (
                                      <li key={idx}>{milestone}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Skills Development */}
                      <div className="mb-8">
                        <h3 className="text-xl font-semibold mb-4">Skills to Develop</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {recommendations.careerRoadmap.careerPreparation?.skillsToDevelope?.map((skill: any, index: number) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4">
                              <h4 className="font-semibold text-gray-900">{skill.skill}</h4>
                              <p className="text-sm text-gray-600 mt-1">{skill.howToAcquire}</p>
                              <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                {skill.timeline}
                              </span>
                            </div>
                          )) || (
                            <div className="col-span-2 text-center text-gray-500">
                              <p>Skills development plan will be available once you select a specific career path.</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Post-Graduation Path */}
                      <div>
                        <h3 className="text-xl font-semibold mb-4">After High School</h3>
                        <div className="border border-gray-200 rounded-lg p-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-3">Education Options</h4>
                              {recommendations.careerRoadmap.postGraduationPath?.educationOptions?.map((option: any, index: number) => (
                                <div key={index} className="mb-3 p-3 bg-gray-50 rounded">
                                  <div className="font-medium">{option.option}</div>
                                  <div className="text-sm text-gray-600">
                                    Duration: {option.duration} | Cost: {option.cost}
                                  </div>
                                </div>
                              )) || (
                                <div className="text-gray-500">
                                  <p>Education options will be tailored once you select a specific career path.</p>
                                </div>
                              )}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-3">Career Entry</h4>
                              <div className="space-y-2">
                                {recommendations.careerRoadmap.postGraduationPath?.careerEntry ? (
                                  <>
                                    <div>
                                      <span className="font-medium">Expected Salary:</span>
                                      <span className="ml-2 text-green-600">{recommendations.careerRoadmap.postGraduationPath.careerEntry.expectedSalary}</span>
                                    </div>
                                    <div>
                                      <span className="font-medium">Target Positions:</span>
                                      <ul className="text-sm text-gray-600 list-disc list-inside ml-4">
                                        {recommendations.careerRoadmap.postGraduationPath.careerEntry.targetPositions?.map((position: string, idx: number) => (
                                          <li key={idx}>{position}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  </>
                                ) : (
                                  <div className="text-gray-500">
                                    <p>Career entry details will be available once you select a specific career path.</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    /* Undecided Path - Career Exploration Plan */
                    <div className="space-y-8">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-blue-900 mb-3">
                          🎯 Career Exploration Plan
                        </h3>
                        <p className="text-blue-800">
                          Since you're exploring different career options, your career roadmap will be customized once you select a specific career path from the Career Options tab. 
                          For now, focus on exploring the 3 career matches we've provided and gathering information about each field.
                        </p>
                      </div>

                      {/* General High School Preparation */}
                      <div>
                        <h3 className="text-xl font-semibold mb-4">General High School Preparation</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="border border-gray-200 rounded-lg p-6">
                            <h4 className="text-lg font-semibold mb-4">Current Grade: {recommendations.studentProfile.grade}</h4>
                            <div className="space-y-3">
                              <div>
                                <h5 className="font-medium text-gray-900">Core Academic Focus</h5>
                                <ul className="text-sm text-gray-600 list-disc list-inside">
                                  <li>Maintain strong GPA in all subjects</li>
                                  <li>Take challenging courses in areas of interest</li>
                                  <li>Develop strong study habits and time management</li>
                                </ul>
                              </div>
                              <div>
                                <h5 className="font-medium text-gray-900">Exploration Activities</h5>
                                <ul className="text-sm text-gray-600 list-disc list-inside">
                                  <li>Job shadow professionals in different fields</li>
                                  <li>Attend career fairs and information sessions</li>
                                  <li>Join clubs related to your interests</li>
                                </ul>
                              </div>
                            </div>
                          </div>

                          <div className="border border-gray-200 rounded-lg p-6">
                            <h4 className="text-lg font-semibold mb-4">Next Steps</h4>
                            <div className="space-y-3">
                              <div>
                                <h5 className="font-medium text-gray-900">Career Decision Timeline</h5>
                                <ul className="text-sm text-gray-600 list-disc list-inside">
                                  <li>Research the 3 career options thoroughly</li>
                                  <li>Talk to professionals in each field</li>
                                  <li>Make career decision by end of junior year</li>
                                </ul>
                              </div>
                              <div>
                                <h5 className="font-medium text-gray-900">Preparation Steps</h5>
                                <ul className="text-sm text-gray-600 list-disc list-inside">
                                  <li>Take relevant electives for each career option</li>
                                  <li>Build skills applicable to multiple careers</li>
                                  <li>Prepare for post-secondary education</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Career-Specific Planning */}
                      <div>
                        <h3 className="text-xl font-semibold mb-4">Career-Specific Planning</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {recommendations.topJobMatches?.slice(0, 3).map((job: any, index: number) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-6">
                              <h4 className="font-semibold text-gray-900 mb-3">{job.career.title}</h4>
                              <div className="space-y-2">
                                <div>
                                  <h5 className="text-sm font-medium text-gray-700">Education Required:</h5>
                                  <p className="text-sm text-gray-600">{job.career.requiredEducation}</p>
                                </div>
                                <div>
                                  <h5 className="text-sm font-medium text-gray-700">High School Prep:</h5>
                                  <ul className="text-xs text-gray-600 list-disc list-inside">
                                    {job.educationPath?.highSchoolCourses?.slice(0, 3).map((course: string, idx: number) => (
                                      <li key={idx}>{course}</li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <h5 className="text-sm font-medium text-gray-700">Time to Career:</h5>
                                  <p className="text-sm text-gray-600">{job.educationPath?.timeToCareer}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Action Items */}
                      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-green-900 mb-4">
                          📋 Your Action Items
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {results.recommendations.nextSteps?.map((step: string, index: number) => (
                            <div key={index} className="flex items-start space-x-3">
                              <div className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                {index + 1}
                              </div>
                              <p className="text-green-800 text-sm">{step}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Parent Summary Tab */}
              {activeTab === 'parent' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Summary for Parents</h2>
                  
                  <div className="space-y-6">
                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-3">Overview</h3>
                      <p className="text-gray-700">{recommendations.parentSummary.overview}</p>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-3">Key Recommendations</h3>
                      <ul className="space-y-2">
                        {recommendations.parentSummary.keyRecommendations.map((rec: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <span className="text-blue-600 mr-2">•</span>
                            <span className="text-gray-700">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-3">How You Can Support</h3>
                      <ul className="space-y-2">
                        {recommendations.parentSummary.supportActions.map((action: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <span className="text-green-600 mr-2">✓</span>
                            <span className="text-gray-700">{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-3">Timeline Highlights</h3>
                      <ul className="space-y-2">
                        {recommendations.parentSummary.timelineHighlights.map((highlight: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <span className="text-purple-600 mr-2">📅</span>
                            <span className="text-gray-700">{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Counselor Notes Tab */}
              {activeTab === 'counselor' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Professional Guidance Notes</h2>
                  
                  <div className="space-y-6">
                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-3">Assessment Insights</h3>
                      <ul className="space-y-2">
                        {recommendations.counselorNotes.assessmentInsights.map((insight: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <span className="text-blue-600 mr-2">📊</span>
                            <span className="text-gray-700">{insight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-3">Recommendation Rationale</h3>
                      <ul className="space-y-2">
                        {recommendations.counselorNotes.recommendationRationale.map((rationale: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <span className="text-green-600 mr-2">💡</span>
                            <span className="text-gray-700">{rationale}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-3">Follow-Up Actions</h3>
                      <ul className="space-y-2">
                        {recommendations.counselorNotes.followUpActions.map((action: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <span className="text-orange-600 mr-2">📋</span>
                            <span className="text-gray-700">{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-3">Parent Meeting Topics</h3>
                      <ul className="space-y-2">
                        {recommendations.counselorNotes.parentMeetingTopics.map((topic: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <span className="text-purple-600 mr-2">👥</span>
                            <span className="text-gray-700">{topic}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="text-center">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mr-4"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => router.push('/')}
              className="px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
