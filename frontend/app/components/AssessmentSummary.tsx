'use client';

import { useState } from 'react';

interface AssessmentSummaryProps {
  assessmentData: {
    assessmentVersion?: string;
    pathTaken?: string;
    responses?: any;
    studentProfile?: any;
  };
}

export default function AssessmentSummary({ assessmentData }: AssessmentSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!assessmentData || !assessmentData.responses) {
    return null;
  }

  const { responses, pathTaken, assessmentVersion, studentProfile } = assessmentData;

  // Helper function to format response values
  const formatResponse = (value: any): string => {
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    if (typeof value === 'object' && value !== null) {
      if (value.grade && value.zipCode) {
        return `Grade ${value.grade}, ZIP ${value.zipCode}`;
      }
      // Handle subject strengths matrix
      const entries = Object.entries(value);
      if (entries.length > 0 && typeof entries[0][1] === 'string') {
        return entries
          .filter(([_, rating]) => rating !== 'not_taken' && rating !== 'average')
          .map(([subject, rating]) => `${subject}: ${rating}`)
          .join(', ');
      }
      return JSON.stringify(value);
    }
    return String(value);
  };

  // Helper function to get question display text
  const getQuestionText = (questionId: string): string => {
    const questionTexts: { [key: string]: string } = {
      basic_info: 'Grade Level & ZIP Code',
      education_commitment: 'Education Commitment',
      career_clarity: 'Career Direction Clarity',
      career_category: 'Preferred Work Type',
      subject_strengths: 'Subject Strengths',
      specific_career_interest: 'Specific Career Interest',
      personal_traits: 'Personal Traits',
      impact_legacy: 'Desired Impact/Legacy',
      inspiration: 'Who Inspires You',
      constraints_considerations: 'Constraints & Considerations'
    };
    return questionTexts[questionId] || questionId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Helper function to get user-friendly response text
  const getUserFriendlyResponse = (questionId: string, value: any): string => {
    switch (questionId) {
      case 'education_commitment':
        const educationMap: { [key: string]: string } = {
          certificate: 'Certificate or Trade School (6 months - 2 years)',
          associate: 'Associate Degree (2 years)',
          bachelor: 'Bachelor\'s Degree (4 years)',
          advanced: 'Advanced Degree (Master\'s, PhD, 6+ years)'
        };
        return educationMap[value] || value;
      
      case 'career_clarity':
        const clarityMap: { [key: string]: string } = {
          clear: 'I have a clear idea of what I want to do',
          exploring: 'I\'m exploring different options',
          unsure: 'I\'m completely unsure'
        };
        return clarityMap[value] || value;
      
      case 'career_category':
        const categoryMap: { [key: string]: string } = {
          hard_hat_building: 'Building, fixing, working with tools',
          hard_hat_design: 'Creating designs for physical structures',
          data_analysis: 'Working with numbers, data, or analysis',
          technology: 'Working with computers or technology',
          education_coaching: 'Helping people through education/coaching',
          healthcare: 'Helping people improve their health',
          public_safety: 'Rescuing/protecting people',
          research_innovation: 'Inventing or discovering new things',
          creative_arts: 'Working with art and creative things',
          unable_to_decide: 'Unable to decide'
        };
        return categoryMap[value] || value;
      
      case 'subject_strengths':
        if (typeof value === 'object') {
          const excellentSubjects = Object.entries(value)
            .filter(([_, rating]) => rating === 'excellent')
            .map(([subject, _]) => subject);
          const goodSubjects = Object.entries(value)
            .filter(([_, rating]) => rating === 'good')
            .map(([subject, _]) => subject);
          
          let result = '';
          if (excellentSubjects.length > 0) {
            result += `Excellent in: ${excellentSubjects.join(', ')}`;
          }
          if (goodSubjects.length > 0) {
            if (result) result += '; ';
            result += `Good at: ${goodSubjects.join(', ')}`;
          }
          return result || 'No strong preferences indicated';
        }
        return formatResponse(value);
      
      case 'personal_traits':
        if (Array.isArray(value)) {
          const traitMap: { [key: string]: string } = {
            analytical: 'Analytical',
            creative: 'Creative',
            helpful: 'Helpful',
            leader: 'Natural Leader',
            detail_oriented: 'Detail-Oriented',
            problem_solver: 'Problem Solver',
            team_player: 'Team Player',
            independent: 'Independent',
            communicator: 'Good Communicator',
            hands_on: 'Hands-On Learner'
          };
          return value.map(trait => traitMap[trait] || trait).join(', ');
        }
        return formatResponse(value);
      
      default:
        return formatResponse(value);
    }
  };

  // Filter out empty responses
  const meaningfulResponses = Object.entries(responses).filter(([_, value]) => {
    if (value === null || value === undefined || value === '') return false;
    if (Array.isArray(value) && value.length === 0) return false;
    if (typeof value === 'object' && Object.keys(value).length === 0) return false;
    return true;
  });

  const pathDescription = pathTaken === 'pathA' 
    ? 'Clear Direction Path - For students who have a clear idea of their career direction'
    : 'Exploration Path - For students who are exploring or uncertain about career direction';

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Your Assessment Summary</h2>
          <p className="text-sm text-gray-600 mt-1">
            Review what you told us to understand how we matched you with careers
          </p>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
        >
          <span>{isExpanded ? 'Hide Details' : 'Show Details'}</span>
          <svg
            className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Key Highlights - Always Visible */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Assessment Path */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900">Assessment Path</h3>
          </div>
          <p className="text-sm text-gray-700">
            {pathTaken === 'pathA' ? 'Clear Direction' : 'Exploration'}
          </p>
          <p className="text-xs text-gray-600 mt-1">
            {pathTaken === 'pathA' ? 'You know what you want to do' : 'You\'re exploring options'}
          </p>
        </div>

        {/* Career Interest */}
        {responses.career_category && (
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900">Career Interest</h3>
            </div>
            <p className="text-sm text-gray-700">
              {getUserFriendlyResponse('career_category', responses.career_category)}
            </p>
          </div>
        )}

        {/* Education Level */}
        {responses.education_commitment && (
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900">Education Goal</h3>
            </div>
            <p className="text-sm text-gray-700">
              {getUserFriendlyResponse('education_commitment', responses.education_commitment)}
            </p>
          </div>
        )}
      </div>

      {/* Detailed Responses - Expandable */}
      {isExpanded && (
        <div className="border-t border-gray-200 pt-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Complete Assessment Details</h3>
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Assessment Version:</span> {assessmentVersion || 'v2'} • 
                <span className="font-medium ml-2">Path:</span> {pathDescription}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {meaningfulResponses.map(([questionId, value]) => (
              <div key={questionId} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-2">
                      {getQuestionText(questionId)}
                    </h4>
                    <div className="text-sm text-gray-700">
                      <span className="font-medium">Your Response:</span>
                      <div className="mt-1 p-3 bg-gray-50 rounded border-l-4 border-blue-500">
                        {getUserFriendlyResponse(questionId, value)}
                      </div>
                    </div>
                  </div>
                  <div className="ml-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {questionId === 'career_category' ? 'Primary Factor' :
                       questionId === 'education_commitment' ? 'Hard Constraint' :
                       questionId === 'subject_strengths' ? 'Aptitude Factor' :
                       'Supporting Factor'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Matching Logic Explanation */}
          <div className="mt-6 bg-blue-50 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">How We Used Your Responses</h4>
            <div className="text-sm text-blue-800 space-y-2">
              <p>
                <span className="font-medium">1. Primary Filter (50% weight):</span> We used your career category selection 
                as the main factor to find careers that match what you want to do.
              </p>
              <p>
                <span className="font-medium">2. Education Filter (30% weight):</span> We only suggested careers that match 
                your education commitment level.
              </p>
              <p>
                <span className="font-medium">3. Subject Alignment (25% weight):</span> We considered your subject strengths 
                to identify specific roles within your preferred category.
              </p>
              {pathTaken === 'pathB' && (
                <p>
                  <span className="font-medium">4. Personality Match (15% weight):</span> We used your personal traits 
                  to differentiate between similar careers.
                </p>
              )}
              {responses.constraints_considerations && (
                <p>
                  <span className="font-medium">5. Constraints Applied:</span> We considered your personal constraints 
                  when finalizing recommendations.
                </p>
              )}
            </div>
          </div>

          {/* Retake Assessment Option */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  Want different results? You can retake the assessment with updated responses.
                </p>
              </div>
              <button
                onClick={() => {
                  if (confirm('This will start a new assessment. Your current results will be saved. Continue?')) {
                    window.location.href = '/questionnaire';
                  }
                }}
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Retake Assessment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}