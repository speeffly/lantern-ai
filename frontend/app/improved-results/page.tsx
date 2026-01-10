'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '../components/Header';
import AssessmentSummary from '../components/AssessmentSummary';

interface EnhancedCareerMatch {
  career: {
    title: string;
    sector: string;
  };
  matchScore: number;
  whyThisMatches: string;
  skillGaps: {
    immediate: string[];
    longTerm: string[];
  };
  careerPathway: {
    steps: string[];
    timeline: string;
  };
  insights: {
    strengths: string[];
    developmentAreas: string[];
    nextSteps: string[];
  };
}

interface ImprovedResultsData {
  assessmentVersion: string;
  pathTaken: string;
  recommendations: {
    matches: EnhancedCareerMatch[];
  };
  careerMatches: {
    primaryMatches: string[];
    secondaryMatches: string[];
    sectors: string[];
    matchingLogic: any;
  };
  validation: {
    warnings: string[];
  };
  studentProfile: {
    grade: string;
    zipCode: string;
    pathTaken: string;
    careerCategory: string;
    educationCommitment: string;
    readinessLevel: string;
    keyStrengths: string[];
    primaryInterests: string[];
  };
  improvedFeatures: {
    branchingLogic: string;
    weightedMatching: string;
    focusedQuestions: string;
    enhancedExplainability: string;
  };
}

export default function ImprovedResultsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [resultsData, setResultsData] = useState<ImprovedResultsData | null>(null);
  const [assessmentData, setAssessmentData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('matches');

  useEffect(() => {
    // Get results data from localStorage (set by assessment submission)
    const storedResults = localStorage.getItem('improvedAssessmentResults');
    if (storedResults) {
      try {
        const parsedResults = JSON.parse(storedResults);
        setResultsData(parsedResults);
        
        // Extract assessment data for the summary component
        setAssessmentData({
          assessmentVersion: parsedResults.assessmentVersion,
          pathTaken: parsedResults.pathTaken,
          responses: parsedResults.originalResponses || {},
          studentProfile: parsedResults.studentProfile
        });
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error parsing stored results:', error);
        router.push('/questionnaire');
      }
    } else {
      // No results found, redirect to assessment
      router.push('/questionnaire');
    }
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Your Career Results" />
        <div className="flex items-center justify-center pt-20">
          <div className="text-xl">Loading your personalized results...</div>
        </div>
      </div>
    );
  }

  if (!resultsData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Your Career Results" />
        <div className="flex items-center justify-center pt-20">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">No Results Found</h2>
            <p className="text-gray-600 mb-6">Please complete the career assessment first.</p>
            <button
              onClick={() => router.push('/questionnaire')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Take Assessment
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { recommendations, studentProfile, improvedFeatures, validation } = resultsData;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Your Career Results" />
      <div className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">Your Personalized Career Matches</h1>
            <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6 mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {studentProfile.readinessLevel} Student
                  </h2>
                  <p className="text-gray-600">
                    {resultsData.pathTaken === 'pathA' 
                      ? 'You have a clear career direction - we\'ve validated your choices and provided detailed pathways.'
                      : 'You\'re exploring career options - we\'ve provided diverse recommendations to help you discover your path.'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Assessment Summary */}
          {assessmentData && (
            <AssessmentSummary assessmentData={assessmentData} />
          )}

          {/* Validation Warnings */}
          {validation.warnings.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
              <div className="flex items-center space-x-2 mb-2">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <h3 className="font-semibold text-yellow-800">Suggestions for Better Results</h3>
              </div>
              <ul className="text-sm text-yellow-700 space-y-1">
                {validation.warnings.map((warning, index) => (
                  <li key={index}>• {warning}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="mb-8 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('matches')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'matches'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                🎯 Career Matches
              </button>
              <button
                onClick={() => setActiveTab('pathway')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'pathway'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                🛤️ Career Pathways
              </button>
              <button
                onClick={() => setActiveTab('improvements')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'improvements'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                ✨ What's New
              </button>
            </nav>
          </div>

          {/* Career Matches Tab */}
          {activeTab === 'matches' && (
            <div className="space-y-6">
              {recommendations.matches && recommendations.matches.length > 0 ? (
                recommendations.matches.map((match, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold">{match.career.title}</h3>
                        <span className="text-sm text-gray-500 capitalize">{match.career.sector}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">{match.matchScore}%</div>
                        <div className="text-sm text-gray-500">Match</div>
                      </div>
                    </div>
                    
                    {/* Why This Matches */}
                    <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">Why This Matches You</h4>
                      <p className="text-blue-800">{match.whyThisMatches}</p>
                    </div>

                    {/* Key Insights */}
                    <div className="grid md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <h5 className="font-semibold text-green-700 mb-2">Your Strengths</h5>
                        <ul className="text-sm text-green-600 space-y-1">
                          {match.insights.strengths.map((strength, i) => (
                            <li key={i}>• {strength}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-semibold text-orange-700 mb-2">Areas to Develop</h5>
                        <ul className="text-sm text-orange-600 space-y-1">
                          {match.insights.developmentAreas.map((area, i) => (
                            <li key={i}>• {area}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-semibold text-purple-700 mb-2">Next Steps</h5>
                        <ul className="text-sm text-purple-600 space-y-1">
                          {match.insights.nextSteps.map((step, i) => (
                            <li key={i}>• {step}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => router.push(`/career-details?title=${encodeURIComponent(match.career.title)}`)}
                        className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Learn More
                      </button>
                      <button
                        onClick={() => router.push(`/action-plan?career=${encodeURIComponent(match.career.title)}`)}
                        className="bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Get Action Plan
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                  <h3 className="text-xl font-semibold mb-4">No Specific Matches Yet</h3>
                  <p className="text-gray-600 mb-6">
                    We're still processing your responses. Try retaking the assessment with more specific preferences.
                  </p>
                  <button
                    onClick={() => router.push('/questionnaire')}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                  >
                    Retake Assessment
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Career Pathways Tab */}
          {activeTab === 'pathway' && (
            <div className="space-y-6">
              {recommendations.matches && recommendations.matches.map((match, index) => (
                <div key={index} className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-xl font-bold mb-4">{match.career.title} Pathway</h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Career Steps */}
                    <div>
                      <h4 className="font-semibold text-blue-600 mb-3">Career Steps</h4>
                      <div className="space-y-3">
                        {match.careerPathway.steps.map((step, stepIndex) => (
                          <div key={stepIndex} className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600">
                              {stepIndex + 1}
                            </div>
                            <p className="text-sm text-gray-700">{step}</p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 p-3 bg-gray-50 rounded">
                        <span className="text-sm font-medium text-gray-600">Timeline: </span>
                        <span className="text-sm text-gray-800">{match.careerPathway.timeline}</span>
                      </div>
                    </div>

                    {/* Skill Gaps */}
                    <div>
                      <h4 className="font-semibold text-orange-600 mb-3">Skills to Develop</h4>
                      
                      {match.skillGaps.immediate.length > 0 && (
                        <div className="mb-4">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Immediate Focus</h5>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {match.skillGaps.immediate.map((skill, i) => (
                              <li key={i} className="flex items-center space-x-2">
                                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                <span>{skill}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {match.skillGaps.longTerm.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Long-term Development</h5>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {match.skillGaps.longTerm.map((skill, i) => (
                              <li key={i} className="flex items-center space-x-2">
                                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                                <span>{skill}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Improvements Tab */}
          {activeTab === 'improvements' && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold mb-6">What's New in This Assessment</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">🔀 Smart Branching Logic</h4>
                    <p className="text-sm text-blue-800">{improvedFeatures.branchingLogic}</p>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">⚖️ Weighted Matching</h4>
                    <p className="text-sm text-green-800">{improvedFeatures.weightedMatching}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold text-purple-900 mb-2">🎯 Focused Questions</h4>
                    <p className="text-sm text-purple-800">{improvedFeatures.focusedQuestions}</p>
                  </div>
                  
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <h4 className="font-semibold text-orange-900 mb-2">💡 Enhanced Explainability</h4>
                    <p className="text-sm text-orange-800">{improvedFeatures.enhancedExplainability}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Your Assessment Summary</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Version:</span>
                    <span className="ml-2 font-medium">{resultsData.assessmentVersion}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Path:</span>
                    <span className="ml-2 font-medium">{resultsData.pathTaken}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Grade:</span>
                    <span className="ml-2 font-medium">{studentProfile.grade}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Education Goal:</span>
                    <span className="ml-2 font-medium">{studentProfile.educationCommitment}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-12 flex justify-center space-x-4">
            <button
              onClick={() => router.push('/questionnaire')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Retake Assessment
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}