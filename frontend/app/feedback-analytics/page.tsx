'use client';

import { useEffect, useState } from 'react';
import Header from '../components/Header';

interface FeedbackStats {
  career_code: string;
  career_title: string;
  total_feedback: number;
  avg_rating: number;
  helpful_count: number;
  not_helpful_count: number;
  comment_count: number;
}

interface AIInsight {
  original_recommendation: string;
  avg_score: number;
  feedback_count: number;
  common_suggestions: string;
}

export default function FeedbackAnalyticsPage() {
  const [stats, setStats] = useState<FeedbackStats[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch feedback stats
      const statsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/feedback/stats`);
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.data || []);
      }

      // Fetch AI insights
      const insightsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/feedback/insights`);
      if (insightsResponse.ok) {
        const insightsData = await insightsResponse.json();
        setInsights(insightsData.data || []);
      }

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getHelpfulnessPercentage = (helpful: number, notHelpful: number) => {
    const total = helpful + notHelpful;
    if (total === 0) return 0;
    return Math.round((helpful / total) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Feedback Analytics" />
        <div className="flex items-center justify-center pt-20">
          <div className="text-xl">Loading analytics...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Feedback Analytics" />
      
      <div className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Careers</h3>
              <p className="text-3xl font-bold text-blue-600">{stats.length}</p>
              <p className="text-sm text-gray-500">With feedback</p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Feedback</h3>
              <p className="text-3xl font-bold text-green-600">
                {stats.reduce((sum, stat) => sum + stat.total_feedback, 0)}
              </p>
              <p className="text-sm text-gray-500">Responses collected</p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Avg Rating</h3>
              <p className="text-3xl font-bold text-yellow-600">
                {stats.length > 0 
                  ? (stats.reduce((sum, stat) => sum + (stat.avg_rating || 0), 0) / stats.length).toFixed(1)
                  : '0.0'
                }
              </p>
              <p className="text-sm text-gray-500">Out of 5.0</p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Comments</h3>
              <p className="text-3xl font-bold text-purple-600">
                {stats.reduce((sum, stat) => sum + stat.comment_count, 0)}
              </p>
              <p className="text-sm text-gray-500">Detailed feedback</p>
            </div>
          </div>

          {/* Career Feedback Stats */}
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Career Recommendation Performance</h2>
              <p className="text-sm text-gray-600">Feedback statistics by career</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Career
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Feedback
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg Rating
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Helpfulness
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Comments
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.map((stat, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {stat.career_title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {stat.career_code}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {stat.total_feedback}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-sm text-gray-900">
                            {stat.avg_rating ? stat.avg_rating.toFixed(1) : 'N/A'}
                          </span>
                          {stat.avg_rating && (
                            <div className="ml-2 flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                  key={star}
                                  className={`text-sm ${
                                    star <= Math.round(stat.avg_rating)
                                      ? 'text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {getHelpfulnessPercentage(stat.helpful_count, stat.not_helpful_count)}%
                        </div>
                        <div className="text-xs text-gray-500">
                          {stat.helpful_count} helpful, {stat.not_helpful_count} not helpful
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {stat.comment_count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Learning Insights */}
          {insights.length > 0 && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">AI Learning Insights</h2>
                <p className="text-sm text-gray-600">Recommendations that need improvement based on feedback</p>
              </div>
              
              <div className="p-6">
                <div className="space-y-6">
                  {insights.map((insight, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-medium text-gray-900">{insight.original_recommendation}</h3>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-500">
                            Score: {(insight.avg_score * 100).toFixed(0)}%
                          </span>
                          <span className="text-sm text-gray-500">
                            {insight.feedback_count} responses
                          </span>
                        </div>
                      </div>
                      
                      {insight.common_suggestions && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Common Suggestions:</h4>
                          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                            {insight.common_suggestions}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* No Data Message */}
          {stats.length === 0 && (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Feedback Data Yet</h3>
              <p className="text-gray-600">
                Start collecting feedback from users to see analytics here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}