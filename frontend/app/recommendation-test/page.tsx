'use client';

import { useState } from 'react';
import Header from '../components/Header';

interface RecommendationResult {
  student_profile_summary: {
    grade: number;
    readiness_level: string;
    key_strengths: string[];
    primary_interests: string[];
  };
  top_clusters: Array<{
    cluster_id: string;
    name: string;
    score: number;
    reasoning: string[];
  }>;
  career_recommendations: {
    best_fit: Array<{
      career: {
        name: string;
        primary_cluster: string;
        edu_required_level: number;
        time_to_entry_years: number;
      };
      score: number;
      reasoning: string[];
      feasibility_notes?: string[];
    }>;
    good_fit: Array<any>;
    stretch_options: Array<any>;
  };
  four_year_plan: any;
  comparison_questions: Array<any>;
  disclaimer: string;
  generated_at: string;
}

export default function RecommendationTestPage() {
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const testProfile = {
    grade: 11,
    zipCode: '12345',
    workEnvironment: ['Indoors (offices, hospitals, schools)', 'A mix of indoor and outdoor work'],
    workStyle: ['Helping people directly', 'Working with computers or technology'],
    thinkingStyle: ['Helping people overcome challenges', 'Understanding how systems or machines work'],
    educationWillingness: '2–4 years (college or technical school)',
    academicInterests: ['Math', 'Science (Biology, Chemistry, Physics)', 'Technology / Computer Science'],
    academicPerformance: {
      'Math': 'Good',
      'Science (Biology, Chemistry, Physics)': 'Excellent',
      'Technology / Computer Science': 'Good',
      'English / Language Arts': 'Average'
    },
    interests: 'I love helping people and am fascinated by how technology can improve healthcare',
    experience: 'Volunteered at local hospital for 6 months, helped with patient transport and basic tasks',
    traits: ['Compassionate and caring', 'Analytical and logical', 'Patient and persistent'],
    incomeImportance: 'Somewhat important',
    stabilityImportance: 'Very important',
    helpingImportance: 'Very important',
    constraints: ['Stay close to home'],
    decisionPressure: 'Want to narrow this year',
    riskTolerance: 'Prefer stability',
    supportLevel: 'Some support available',
    careerConfidence: 'Somewhat confident',
    impactStatement: 'I want to make a difference in people\'s lives through healthcare',
    inspiration: 'My grandmother\'s nurse who was so caring during her illness'
  };

  const runTest = async () => {
    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testProfile),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.error || 'Failed to generate recommendations');
      }
    } catch (err) {
      setError('Failed to connect to server');
      console.error('Test error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getEducationLevel = (level: number): string => {
    const levels = {
      0: 'High School',
      1: 'Certificate/Apprenticeship',
      2: 'Associate Degree',
      3: 'Bachelor\'s Degree+'
    };
    return levels[level as keyof typeof levels] || 'Unknown';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Recommendation Engine Test" />
      
      <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              🧪 Recommendation Engine Test
            </h1>
            <p className="text-gray-600 mb-6">
              Test the new deterministic recommendation engine with a sample student profile.
              This tests the v1 questionnaire format and career matching algorithm.
            </p>
            
            <button
              onClick={runTest}
              disabled={isLoading}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Generating Recommendations...' : 'Run Test'}
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 font-medium">Error: {error}</p>
            </div>
          )}

          {result && (
            <div className="space-y-8">
              {/* Student Profile Summary */}
              <div className="bg-blue-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-blue-900 mb-4">
                  📊 Student Profile Summary
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p><strong>Grade:</strong> {result.student_profile_summary.grade}</p>
                    <p><strong>Readiness Level:</strong> {result.student_profile_summary.readiness_level}</p>
                  </div>
                  <div>
                    <p><strong>Key Strengths:</strong> {result.student_profile_summary.key_strengths.join(', ')}</p>
                    <p><strong>Primary Interests:</strong> {result.student_profile_summary.primary_interests.join(', ')}</p>
                  </div>
                </div>
              </div>

              {/* Top Clusters */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  🏆 Top Career Clusters
                </h2>
                <div className="grid md:grid-cols-3 gap-4">
                  {result.top_clusters.map((cluster, index) => (
                    <div key={cluster.cluster_id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900">#{index + 1}</h3>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                          {cluster.score}%
                        </span>
                      </div>
                      <p className="font-medium text-gray-900 mb-2">{cluster.name}</p>
                      <p className="text-sm text-gray-600">
                        {cluster.reasoning.slice(0, 2).join(', ')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Best Fit Careers */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  🎯 Best Fit Careers
                </h2>
                <div className="space-y-4">
                  {result.career_recommendations.best_fit.map((rec, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-medium text-gray-900">
                          {rec.career.name}
                        </h3>
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                          {rec.score}% Match
                        </span>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-gray-600">
                            <strong>Education Required:</strong> {getEducationLevel(rec.career.edu_required_level)}
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong>Time to Entry:</strong> {rec.career.time_to_entry_years} years
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            <strong>Primary Cluster:</strong> {rec.career.primary_cluster}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <p className="text-sm text-gray-600">
                          <strong>Why it matches:</strong> {rec.reasoning.join(', ')}
                        </p>
                      </div>
                      
                      {rec.feasibility_notes && rec.feasibility_notes.length > 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                          <p className="text-sm text-yellow-800">
                            <strong>Considerations:</strong> {rec.feasibility_notes.join(', ')}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Good Fit and Stretch Options */}
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    🔄 Good Fit Options
                  </h2>
                  <div className="space-y-3">
                    {result.career_recommendations.good_fit.map((rec: any, index: number) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900">{rec.career.name}</h3>
                          <span className="text-sm text-gray-600">{rec.score}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    🚀 Stretch Options
                  </h2>
                  <div className="space-y-3">
                    {result.career_recommendations.stretch_options.map((rec: any, index: number) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900">{rec.career.name}</h3>
                          <span className="text-sm text-gray-600">{rec.score}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Four Year Plan Preview */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  📅 Four-Year Plan Preview
                </h2>
                <div className="bg-gray-50 rounded-lg p-6">
                  {result.four_year_plan.grade_11 && (
                    <div className="mb-4">
                      <h3 className="font-medium text-gray-900 mb-2">Grade 11 Focus</h3>
                      <p className="text-gray-600 mb-2">{result.four_year_plan.grade_11.focus}</p>
                      <p className="text-sm text-gray-600">
                        <strong>Courses:</strong> {result.four_year_plan.grade_11.courses.slice(0, 4).join(', ')}...
                      </p>
                    </div>
                  )}
                  
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Post-Graduation Plan</h3>
                    <p className="text-gray-600 mb-1">
                      <strong>Education Path:</strong> {result.four_year_plan.post_graduation.education_path}
                    </p>
                    <p className="text-gray-600 mb-1">
                      <strong>Timeline:</strong> {result.four_year_plan.post_graduation.timeline}
                    </p>
                    <p className="text-gray-600">
                      <strong>Estimated Cost:</strong> {result.four_year_plan.post_graduation.estimated_cost}
                    </p>
                  </div>
                </div>
              </div>

              {/* Metadata */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  <strong>Generated:</strong> {new Date(result.generated_at).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  {result.disclaimer}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}