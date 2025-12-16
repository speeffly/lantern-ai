'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import JobListings from '../components/JobListings';

interface Career {
  id: string;
  title: string;
  sector: string;
  description: string;
  averageSalary: number;
}

interface CareerMatch {
  careerId: string;
  career: Career;
  matchScore: number;
  reasoningFactors: string[];
  localDemand: string;
}

interface CourseRecommendation {
  subject: string;
  courseName: string;
  year: number;
  semester: string;
  priority: string;
  reasoning: string;
  careerRelevance: string[];
}

interface LocalJobListing {
  title: string;
  company: string;
  location: {
    city: string;
    distance: number;
  };
  salary: {
    min: number;
    max: number;
  };
  matchScore: number;
}

interface AIRecommendations {
  academicPlan: {
    currentYear: CourseRecommendation[];
    nextYear: CourseRecommendation[];
  };
  localJobs: LocalJobListing[];
  careerPathway: {
    shortTerm: string[];
    mediumTerm: string[];
    longTerm: string[];
  };
  skillGaps: Array<{
    skill: string;
    importance: string;
    howToAcquire: string;
  }>;
  actionItems: Array<{
    priority: string;
    action: string;
    timeline: string;
    category: string;
  }>;
}

export default function ResultsPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<CareerMatch[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendations | null>(null);
  const [localJobMarket, setLocalJobMarket] = useState<any>(null);
  const [academicPlan, setAcademicPlan] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('matches');

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    const sessionId = localStorage.getItem('sessionId');
    const zipCode = localStorage.getItem('zipCode');
    const token = localStorage.getItem('token');

    // Check if user is logged in but doesn't have session data
    if (!sessionId || !zipCode) {
      if (token) {
        // Logged in user without assessment data - redirect to dashboard
        alert('Please complete the career assessment first to see your results.');
        router.push('/dashboard');
      } else {
        // Anonymous user without session - redirect to home
        router.push('/');
      }
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/careers/matches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, zipCode })
      });

      const data = await response.json();
      if (data.success) {
        setMatches(data.data.matches);
        setProfile(data.data.profile);
        setAiRecommendations(data.data.aiRecommendations);
        setLocalJobMarket(data.data.localJobMarket);
        setAcademicPlan(data.data.academicPlan);
        setIsLoading(false);
      } else {
        // If session not found, redirect appropriately
        if (token) {
          alert('Your assessment session has expired. Please retake the assessment.');
          router.push('/dashboard');
        } else {
          router.push('/');
        }
      }
    } catch (error) {
      console.error('Error fetching results:', error);
      alert('Failed to load results');
      if (token) {
        router.push('/dashboard');
      } else {
        router.push('/');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Career Matches" />
        <div className="flex items-center justify-center pt-20">
          <div className="text-xl">Loading your matches...</div>
        </div>
      </div>
    );
  }

  const filteredMatches = filter === 'all' 
    ? matches 
    : matches.filter(m => m.career.sector === filter);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Career Matches" />
      <div className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Your Career Matches</h1>
          <div className="bg-white rounded-lg p-6 shadow">
            <h2 className="font-semibold mb-2">Your Profile</h2>
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-600">Interests:</span>
              {profile?.interests?.map((interest: string, i: number) => (
                <span key={i} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {interest}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="text-sm text-gray-600">Skills:</span>
              {profile?.skills?.map((skill: string, i: number) => (
                <span key={i} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

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
              Career Matches
            </button>
            <button
              onClick={() => setActiveTab('courses')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'courses'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📚 Course Plan
            </button>
            <button
              onClick={() => setActiveTab('jobs')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'jobs'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              💼 Local Jobs
            </button>
            <button
              onClick={() => setActiveTab('pathway')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'pathway'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🎯 Action Plan
            </button>
          </nav>
        </div>

        {/* Career Matches Tab */}
        {activeTab === 'matches' && (
          <div>
            <div className="mb-6 flex gap-4">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-white'}`}
              >
                All Careers
              </button>
              <button
                onClick={() => setFilter('healthcare')}
                className={`px-4 py-2 rounded-lg ${filter === 'healthcare' ? 'bg-blue-600 text-white' : 'bg-white'}`}
              >
                Healthcare
              </button>
              <button
                onClick={() => setFilter('infrastructure')}
                className={`px-4 py-2 rounded-lg ${filter === 'infrastructure' ? 'bg-blue-600 text-white' : 'bg-white'}`}
              >
                Infrastructure
              </button>
            </div>

            <div className="grid gap-6">
              {filteredMatches.map((match) => (
                <div key={match.careerId} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
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
                  
                  <p className="text-gray-600 mb-4">{match.career.description}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-sm text-gray-500">Average Salary:</span>
                      <span className="ml-2 font-semibold">${match.career.averageSalary.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Local Demand:</span>
                      <span className={`ml-2 px-2 py-1 rounded text-sm ${
                        match.localDemand === 'high' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {match.localDemand}
                      </span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-semibold mb-2">Why this matches you:</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {match.reasoningFactors.map((factor, i) => (
                        <li key={i}>• {factor}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => router.push(`/career-details?id=${match.careerId}`)}
                      className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => router.push(`/action-plan-view?career=${encodeURIComponent(match.career.title)}`)}
                      className="bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                    >
                      Get Action Plan
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Course Plan Tab */}
        {activeTab === 'courses' && academicPlan && (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4">📚 Your Personalized Course Plan</h3>
              <p className="text-gray-600 mb-6">
                AI-recommended courses to help you achieve your career goals. Take these courses to build the skills needed for your top career matches.
              </p>

              {/* Current Year Courses */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold mb-4 text-blue-600">
                  This Year (Grade {academicPlan.currentYear?.grade || 11})
                </h4>
                <div className="grid gap-4 md:grid-cols-2">
                  {academicPlan.currentYear?.courses?.map((course: CourseRecommendation, index: number) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-semibold">{course.courseName}</h5>
                        <span className={`px-2 py-1 rounded text-xs ${
                          course.priority === 'Essential' ? 'bg-red-100 text-red-800' :
                          course.priority === 'Highly Recommended' ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {course.priority}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{course.reasoning}</p>
                      <div className="text-xs text-gray-500">
                        <span className="font-medium">Relevant for:</span> {course.careerRelevance.join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Next Year Courses */}
              {academicPlan.nextYear?.courses?.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-lg font-semibold mb-4 text-green-600">
                    Next Year (Grade {academicPlan.nextYear?.grade})
                  </h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    {academicPlan.nextYear.courses.map((course: CourseRecommendation, index: number) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-semibold">{course.courseName}</h5>
                          <span className={`px-2 py-1 rounded text-xs ${
                            course.priority === 'Essential' ? 'bg-red-100 text-red-800' :
                            course.priority === 'Highly Recommended' ? 'bg-orange-100 text-orange-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {course.priority}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{course.reasoning}</p>
                        <div className="text-xs text-gray-500">
                          <span className="font-medium">Relevant for:</span> {course.careerRelevance.join(', ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Post-Secondary Options */}
              {academicPlan.longTerm?.postSecondary?.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold mb-4 text-purple-600">After High School</h4>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <ul className="space-y-2">
                      {academicPlan.longTerm.postSecondary.map((option: string, index: number) => (
                        <li key={index} className="flex items-center text-sm">
                          <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                          {option}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Local Jobs Tab */}
        {activeTab === 'jobs' && (
          <div className="space-y-6">
            {/* AI-Generated Job Market Analysis */}
            {localJobMarket && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold mb-4">📈 AI Market Analysis</h3>
                <p className="text-gray-600 mb-6">
                  AI-powered analysis of job opportunities in your area based on your career interests.
                </p>

                <div className="grid gap-4">
                  {localJobMarket.jobOpportunities?.slice(0, 5).map((job: LocalJobListing, index: number) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-lg">{job.title}</h4>
                          <p className="text-gray-600">{job.company}</p>
                          <p className="text-sm text-gray-500">
                            📍 {job.location.city} • {job.location.distance} miles away
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">
                            ${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500">Annual</div>
                          <div className="text-sm font-medium text-blue-600">{job.matchScore}% Match</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Market Trends */}
                {localJobMarket.marketTrends && (
                  <div className="mt-8 bg-blue-50 rounded-lg p-6">
                    <h4 className="text-lg font-semibold mb-4">📈 Local Market Trends</h4>
                    <div className="grid gap-4 md:grid-cols-2">
                      {localJobMarket.marketTrends.slice(0, 4).map((trend: any, index: number) => (
                        <div key={index} className="bg-white rounded-lg p-4">
                          <h5 className="font-semibold">{trend.career}</h5>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-sm text-gray-600">Demand:</span>
                            <span className={`px-2 py-1 rounded text-xs ${
                              trend.demand === 'High' ? 'bg-green-100 text-green-800' :
                              trend.demand === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {trend.demand}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-sm text-gray-600">Growth:</span>
                            <span className="text-sm font-medium text-green-600">+{trend.growth}%</span>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-sm text-gray-600">Open Positions:</span>
                            <span className="text-sm font-medium">{trend.openings}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Real Job Listings */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4">💼 Current Job Openings</h3>
              <p className="text-gray-600 mb-6">
                Real job listings from local employers. Apply directly to start your career journey.
              </p>
              
              <JobListings 
                zipCode={localStorage.getItem('zipCode') || undefined}
                limit={8}
                showTitle={false}
              />
            </div>
          </div>
        )}

        {/* Action Plan Tab */}
        {activeTab === 'pathway' && aiRecommendations && (
          <div className="space-y-8">
            {/* Career Pathway */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4">🎯 Your Career Pathway</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-blue-600 mb-3">Short Term (1-2 years)</h4>
                  <ul className="space-y-2">
                    {aiRecommendations.careerPathway?.shortTerm?.map((step: string, index: number) => (
                      <li key={index} className="flex items-center">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-green-600 mb-3">Medium Term (3-5 years)</h4>
                  <ul className="space-y-2">
                    {aiRecommendations.careerPathway?.mediumTerm?.map((step: string, index: number) => (
                      <li key={index} className="flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-purple-600 mb-3">Long Term (5+ years)</h4>
                  <ul className="space-y-2">
                    {aiRecommendations.careerPathway?.longTerm?.map((step: string, index: number) => (
                      <li key={index} className="flex items-center">
                        <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Skill Gaps */}
            {aiRecommendations.skillGaps && aiRecommendations.skillGaps.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold mb-4">🎓 Skills to Develop</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {aiRecommendations.skillGaps.map((skill: any, index: number) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold">{skill.skill}</h4>
                        <span className={`px-2 py-1 rounded text-xs ${
                          skill.importance === 'Critical' ? 'bg-red-100 text-red-800' :
                          skill.importance === 'Important' ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {skill.importance}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{skill.howToAcquire}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Items */}
            {aiRecommendations.actionItems && aiRecommendations.actionItems.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold mb-4">✅ Next Steps</h3>
                <div className="space-y-4">
                  {aiRecommendations.actionItems.map((item: any, index: number) => (
                    <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className={`w-3 h-3 rounded-full mt-1 ${
                        item.priority === 'High' ? 'bg-red-500' :
                        item.priority === 'Medium' ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}></div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-semibold">{item.action}</h4>
                          <span className="text-sm text-gray-500">{item.timeline}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            item.priority === 'High' ? 'bg-red-100 text-red-800' :
                            item.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {item.priority} Priority
                          </span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                            {item.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
