'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import JobListings from './JobListings';

interface CareerOption {
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
  careerDetails?: {
    dayInTheLife: string;
    careerProgression: string;
    skillsNeeded: string[];
  };
}

interface UndecidedCareerOptionsProps {
  careerOptions: CareerOption[];
  selectionRationale: string;
  nextSteps: string[];
  zipCode: string;
  onCareerSelect: (careerId: string) => void;
}

export default function UndecidedCareerOptions({ 
  careerOptions, 
  selectionRationale, 
  nextSteps,
  zipCode,
  onCareerSelect 
}: UndecidedCareerOptionsProps) {
  const router = useRouter();
  const [selectedCareer, setSelectedCareer] = useState<string | null>(null);
  const [expandedCareer, setExpandedCareer] = useState<string | null>(null);

  const handleCareerSelect = (careerId: string) => {
    setSelectedCareer(careerId);
    onCareerSelect(careerId);
    
    // Smooth scroll to job listings after a short delay to allow state update
    setTimeout(() => {
      const jobListingsElement = document.getElementById('job-listings-section');
      if (jobListingsElement) {
        jobListingsElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    }, 100);
  };

  const getSectorIcon = (sector: string) => {
    const icons: { [key: string]: string } = {
      healthcare: '🏥',
      technology: '💻',
      infrastructure: '🏗️',
      business: '💼',
      education: '📚',
      manufacturing: '🏭',
      service: '🤝',
      government: '🏛️'
    };
    return icons[sector] || '💼';
  };

  const getSectorColor = (sector: string) => {
    const colors: { [key: string]: string } = {
      healthcare: 'bg-red-50 border-red-200 text-red-800',
      technology: 'bg-blue-50 border-blue-200 text-blue-800',
      infrastructure: 'bg-orange-50 border-orange-200 text-orange-800',
      business: 'bg-green-50 border-green-200 text-green-800',
      education: 'bg-purple-50 border-purple-200 text-purple-800',
      manufacturing: 'bg-gray-50 border-gray-200 text-gray-800',
      service: 'bg-pink-50 border-pink-200 text-pink-800',
      government: 'bg-indigo-50 border-indigo-200 text-indigo-800'
    };
    return colors[sector] || 'bg-gray-50 border-gray-200 text-gray-800';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          🎯 Your 3 Career Options
        </h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-6">
          Based on your assessment responses, we've selected 3 diverse career paths for you to explore. 
          Each represents a different type of work environment and skill set.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-4xl mx-auto">
          <p className="text-blue-800 text-sm">
            <strong>Why these 3?</strong> {selectionRationale}
          </p>
        </div>
      </div>

      {/* Career Options Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {careerOptions.map((option, index) => (
          <div
            key={option.career.id}
            className={`bg-white rounded-lg shadow-lg border-2 transition-all duration-300 ${
              selectedCareer === option.career.id
                ? 'border-blue-500 shadow-xl transform scale-105'
                : 'border-gray-200 hover:border-gray-300 hover:shadow-xl'
            }`}
          >
            {/* Career Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getSectorColor(option.career.sector)}`}>
                  {getSectorIcon(option.career.sector)} {option.career.sector}
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {option.matchScore}%
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Option {index + 1}: {option.career.title}
              </h3>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Salary:</span>
                  <div className="text-green-600 font-semibold">
                    ${option.localOpportunities.averageLocalSalary.toLocaleString()}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Education:</span>
                  <div className="text-blue-600">
                    {option.career.requiredEducation}
                  </div>
                </div>
              </div>
            </div>

            {/* Career Details */}
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Why This Matches You:</h4>
                  <p className="text-sm text-gray-600">
                    {option.matchReasons[0]}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Local Opportunities:</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>• {option.localOpportunities.estimatedJobs} estimated positions</div>
                    <div>• {option.localOpportunities.distanceFromStudent} miles from you</div>
                    <div>• Top employers: {option.localOpportunities.topEmployers.slice(0, 2).join(', ')}</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">High School Prep:</h4>
                  <div className="flex flex-wrap gap-2">
                    {option.educationPath.highSchoolCourses.slice(0, 3).map((course, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        {course}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Expandable Details */}
                {option.careerDetails && (
                  <div>
                    <button
                      onClick={() => setExpandedCareer(
                        expandedCareer === option.career.id ? null : option.career.id
                      )}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      {expandedCareer === option.career.id ? '▼ Hide Details' : '▶ Show More Details'}
                    </button>
                    
                    {expandedCareer === option.career.id && (
                      <div className="mt-4 space-y-3 p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h5 className="font-medium text-gray-900">A Day in This Career:</h5>
                          <p className="text-sm text-gray-600 mt-1">
                            {option.careerDetails.dayInTheLife}
                          </p>
                        </div>
                        
                        <div>
                          <h5 className="font-medium text-gray-900">Career Growth:</h5>
                          <p className="text-sm text-gray-600 mt-1">
                            {option.careerDetails.careerProgression}
                          </p>
                        </div>
                        
                        <div>
                          <h5 className="font-medium text-gray-900">Key Skills Needed:</h5>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {option.careerDetails.skillsNeeded.map((skill, idx) => (
                              <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Selection Button */}
              <div className="mt-6">
                <button
                  onClick={() => handleCareerSelect(option.career.id)}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                    selectedCareer === option.career.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {selectedCareer === option.career.id ? '✓ Selected - View Jobs Below' : 'Select This Career'}
                </button>
                
                {selectedCareer === option.career.id && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800 text-sm text-center">
                      🎉 Great choice! Scroll down to see current job openings for this career.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Next Steps */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          🚀 Your Next Steps
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {nextSteps.map((step, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                {index + 1}
              </div>
              <p className="text-gray-700">{step}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Job Openings for Selected Career */}
      {selectedCareer && (
        <div id="job-listings-section" className="bg-white rounded-lg shadow-lg p-8 border-2 border-blue-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center">
              🔍 Current Job Openings
              <span className="ml-3 px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full font-medium">
                Live Jobs
              </span>
            </h3>
            <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">
              For: <strong>{careerOptions.find(opt => opt.career.id === selectedCareer)?.career.title}</strong>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-800 text-sm">
              💡 <strong>Explore real opportunities:</strong> These are actual job openings in your area for {careerOptions.find(opt => opt.career.id === selectedCareer)?.career.title}. 
              This can help you understand what employers are looking for, salary expectations, and what the day-to-day work involves.
            </p>
          </div>

          <JobListings 
            careerTitle={careerOptions.find(opt => opt.career.id === selectedCareer)?.career.title}
            zipCode={zipCode}
            limit={5}
            showTitle={false}
          />
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => {
                  const selectedOption = careerOptions.find(opt => opt.career.id === selectedCareer);
                  if (selectedOption) {
                    const searchQuery = encodeURIComponent(`${selectedOption.career.title} jobs ${zipCode}`);
                    router.push(`/jobs?search=${searchQuery}`);
                  }
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                🔍 View More Jobs
              </button>
              
              <button
                onClick={() => {
                  const selectedOption = careerOptions.find(opt => opt.career.id === selectedCareer);
                  if (selectedOption) {
                    const searchQuery = encodeURIComponent(`${selectedOption.career.title} salary ${zipCode}`);
                    window.open(`https://www.glassdoor.com/Salaries/index.htm?keyword=${searchQuery}`, '_blank');
                  }
                }}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                💰 Check Salaries
              </button>
              
              <button
                onClick={() => {
                  const selectedOption = careerOptions.find(opt => opt.career.id === selectedCareer);
                  if (selectedOption) {
                    const searchQuery = encodeURIComponent(`${selectedOption.career.title} career path requirements`);
                    window.open(`https://www.google.com/search?q=${searchQuery}`, '_blank');
                  }
                }}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
              >
                📚 Learn More
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="text-center space-y-4">
        {selectedCareer && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <p className="text-green-800">
              ✅ Great choice! You've selected <strong>
                {careerOptions.find(opt => opt.career.id === selectedCareer)?.career.title}
              </strong>
            </p>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.push('/jobs')}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            🔍 Explore Job Opportunities
          </button>
          
          <button
            onClick={() => router.push('/counselor-assessment?retake=true')}
            className="px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
          >
            🔄 Retake Assessment
          </button>
          
          <button
            onClick={() => {
              const selectedOption = careerOptions.find(opt => opt.career.id === selectedCareer);
              if (selectedOption) {
                const searchQuery = encodeURIComponent(`${selectedOption.career.title} career information`);
                window.open(`https://www.google.com/search?q=${searchQuery}`, '_blank');
              } else {
                window.open('https://www.google.com/search?q=career+exploration+resources', '_blank');
              }
            }}
            className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
          >
            📚 Research Careers
          </button>
        </div>
      </div>
    </div>
  );
}