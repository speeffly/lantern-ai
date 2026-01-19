'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import JobListings from '../components/JobListings';
import FeedbackWidget from '../components/FeedbackWidget';
import UnifiedCareerOptions from '../components/UnifiedCareerOptions';
import CareerRoadmapView from '../components/CareerRoadmapView';

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
    courseHistory?: { [subject: string]: string };
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
                      assessmentResponses: resultsData.data.assessmentResponses || {}, // Include assessment responses
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
        
        console.log('✅ Results loaded from localStorage (fallback)');
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

  // Filter careers based on match scores and student type
  const filterCareersByMatchScore = (careers: JobRecommendation[], isUndecided: boolean) => {
    if (!careers || careers.length === 0) return [];

    // Sort careers by match score (highest first)
    const sortedCareers = [...careers].sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

    if (isUndecided) {
      // For undecided students: always show top 3 results (no match score filtering)
      return sortedCareers.slice(0, 3);
    } else {
      // For decided students: show all careers above 90% (up to 5), or top 3 if none above 90%
      const highMatchCareers = sortedCareers.filter(career => (career.matchScore || 0) >= 90);
      if (highMatchCareers.length > 0) {
        return highMatchCareers.slice(0, 5); // Limit to 5 even if more than 5 are above 90%
      } else {
        return sortedCareers.slice(0, 3);
      }
    }
  };

  // Get the actual number of careers that will be displayed
  const displayedCareersCount = filterCareersByMatchScore(recommendations.topJobMatches, isUndecidedPath).length;

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
                <div className="text-2xl font-bold text-blue-600">{displayedCareersCount}</div>
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
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 mr-4"
              >
                🔄 Retake Assessment
              </button>
              <button
                onClick={() => router.push('/jobs')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                🔍 Explore Job Opportunities
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
              {/* Undecided Path - Multiple Career Options */}
              {isUndecidedPath && activeTab === 'careers' && (
                <UnifiedCareerOptions
                  careerOptions={filterCareersByMatchScore(recommendations.topJobMatches, true)}
                  selectionRationale={results.recommendations.selectionRationale || 'These careers were selected based on your assessment responses to help you explore different pathways.'}
                  nextSteps={results.recommendations.nextSteps || [
                    'Research each career option in detail',
                    'Talk to professionals in these fields', 
                    'Consider job shadowing opportunities'
                  ]}
                  zipCode={recommendations.studentProfile.location}
                  onCareerSelect={handleCareerSelect}
                  isUndecidedPath={true}
                  willingToRelocate={
                    // Extract willingness to relocate from assessment responses
                    (results?.assessmentResponses?.q14_constraints || []).includes('open_relocating')
                  }
                />
              )}

              {/* Regular Career Matches Tab (for decided students) */}
              {!isUndecidedPath && activeTab === 'careers' && (
                <UnifiedCareerOptions
                  careerOptions={filterCareersByMatchScore(recommendations.topJobMatches, false)}
                  zipCode={recommendations.studentProfile.location}
                  onCareerSelect={handleCareerSelect}
                  isUndecidedPath={false}
                  title="Your Top Career Matches"
                  subtitle="Based on your assessment responses, here are your personalized career recommendations with detailed pathways and local opportunities."
                  willingToRelocate={
                    // Extract willingness to relocate from assessment responses
                    (results?.assessmentResponses?.q14_constraints || []).includes('open_relocating')
                  }
                />
              )}

              {/* Career Roadmap Tab - Always mounted but conditionally visible */}
              <div style={{ display: activeTab === 'plan' ? 'block' : 'none' }}>
                <CareerRoadmapView
                  careers={filterCareersByMatchScore(recommendations.topJobMatches, isUndecidedPath).map(match => ({
                    title: match.career.title,
                    sector: match.career.sector,
                    matchScore: match.matchScore,
                    averageSalary: match.localOpportunities?.averageLocalSalary || match.career.averageSalary,
                    requiredEducation: match.career.requiredEducation,
                    description: match.career.description
                  }))}
                  studentData={{
                    grade: recommendations.studentProfile.grade,
                    zipCode: recommendations.studentProfile.location,
                    courseHistory: recommendations.studentProfile.courseHistory || {},
                    academicPerformance: {}, // Will be populated from assessment data if available
                    supportLevel: 'moderate', // Default value
                    educationCommitment: 'bachelors' // Default value
                  }}
                />
              </div>

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
