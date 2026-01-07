'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import JobListings from '../components/JobListings';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  grade?: number;
  zipCode?: string;
  profileCompleted: boolean;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper function to get user-specific storage key
  const getUserSpecificKey = (baseKey: string, userEmail?: string): string => {
    if (!userEmail) {
      return `${baseKey}_anonymous`;
    }
    return `${baseKey}_user_${userEmail}`;
  };

  // Helper function to check for user-specific assessment results
  const checkUserAssessmentResults = (userEmail?: string): boolean => {
    if (!userEmail) return false;
    
    const userSpecificKey = getUserSpecificKey('counselorAssessmentResults', userEmail);
    const hasUserSpecificResults = !!localStorage.getItem(userSpecificKey);
    
    // Also check old key for backward compatibility, but only if it belongs to current user
    if (!hasUserSpecificResults) {
      const oldResults = localStorage.getItem('counselorAssessmentResults');
      if (oldResults) {
        try {
          const results = JSON.parse(oldResults);
          return results.userEmail === userEmail;
        } catch (error) {
          return false;
        }
      }
    }
    
    return hasUserSpecificResults;
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    console.log('🔍 Dashboard - Checking authentication...');
    console.log('🎫 Token exists:', !!token);
    
    if (!token) {
      console.log('❌ No token found, redirecting to login');
      router.push('/login');
      return;
    }

    console.log('🎫 Token preview:', token.substring(0, 50) + '...');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const profileUrl = `${apiUrl}/api/auth-db/profile`;
      
      console.log('📡 Making profile request to:', profileUrl);
      console.log('🔑 Authorization header:', `Bearer ${token.substring(0, 20)}...`);

      const response = await fetch(profileUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('📊 Profile response status:', response.status);
      console.log('📊 Profile response ok:', response.ok);

      const data = await response.json();
      console.log('🔍 Dashboard - Profile response data:', data);
      
      if (data.success) {
        // Check if enhanced assessment was completed for this specific user
        const userEmail = data.data.email;
        const hasEnhancedResults = checkUserAssessmentResults(userEmail);
        const hasQuickResults = !!localStorage.getItem('sessionId');
        
        console.log('🔍 Dashboard - Assessment status:', {
          hasEnhancedResults,
          hasQuickResults,
          userEmail,
          profileData: data.data
        });
        
        // Set user data with assessment completion status
        const userData = {
          ...data.data,
          profileCompleted: hasEnhancedResults || hasQuickResults,
          // Ensure we have the basic user fields
          firstName: data.data.firstName || data.data.first_name,
          lastName: data.data.lastName || data.data.last_name,
          grade: data.data.profile?.grade || data.data.grade,
          zipCode: data.data.profile?.zip_code || data.data.zipCode
        };
        
        console.log('🔍 Dashboard - Final user data:', userData);
        setUser(userData);
      } else {
        console.log('❌ Profile request failed:', data.error);
        console.log('🧹 Clearing tokens and redirecting to login');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
      }
    } catch (error) {
      console.error('❌ Auth check failed with error:', error);
      console.log('🧹 Clearing tokens and redirecting to login');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    // Clear user-specific assessment data before logout
    if (user?.email) {
      const userSpecificAnswerKey = getUserSpecificKey('counselorAssessmentAnswers', user.email);
      const userSpecificResultsKey = getUserSpecificKey('counselorAssessmentResults', user.email);
      localStorage.removeItem(userSpecificAnswerKey);
      localStorage.removeItem(userSpecificResultsKey);
    }
    
    // Clear general user data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('sessionId');
    localStorage.removeItem('zipCode');
    
    // Clear any old non-user-specific data for cleanup
    localStorage.removeItem('counselorAssessmentAnswers');
    localStorage.removeItem('counselorAssessmentResults');
    
    console.log('🧹 Cleared all user data on logout');
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Lantern AI</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user.firstName}!</span>
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Your Career Journey
          </h2>
          <p className="text-lg text-gray-600">
            Explore career paths in healthcare and infrastructure that match your interests and goals.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Enhanced Assessment Card */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-green-200">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Enhanced Assessment
                </h3>
                <span className="inline-block px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                  RECOMMENDED
                </span>
              </div>
            </div>
            <p className="text-gray-600 mb-4">
              Take our comprehensive 10-question assessment for detailed career planning with 4-year action plans and parent sharing.
            </p>
            <div className="space-y-2 mb-4">
              <button
                onClick={() => router.push('/counselor-assessment')}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
              >
                🎓 {user.profileCompleted ? 'Retake Enhanced Assessment' : 'Start Enhanced Assessment'}
              </button>
            </div>
          </div>

          {/* Results Card */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="ml-4 text-lg font-semibold text-gray-900">
                My Results
              </h3>
            </div>
            <p className="text-gray-600 mb-4">
              {user.profileCompleted 
                ? "View your personalized career matches and explore detailed information about each career."
                : "Complete an assessment first to see your personalized career matches."
              }
            </p>
            {(() => {
              const hasEnhancedResults = checkUserAssessmentResults(user?.email);
              const hasQuickResults = !!localStorage.getItem('sessionId');
              
              if (hasEnhancedResults || hasQuickResults) {
                return (
                  <div className="space-y-2">
                    {hasEnhancedResults && (
                      <Link
                        href="/counselor-results"
                        className="block w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-center"
                      >
                        📊 Enhanced Results
                      </Link>
                    )}
                    {hasQuickResults && (
                      <Link
                        href="/results"
                        className="block w-full bg-blue-100 text-blue-700 py-2 px-4 rounded-lg hover:bg-blue-200 transition-colors text-center text-sm"
                      >
                        Quick Results
                      </Link>
                    )}
                  </div>
                );
              } else {
                return (
                  <button
                    onClick={() => router.push('/counselor-assessment')}
                    className="w-full bg-gray-400 text-white py-2 px-4 rounded-lg cursor-not-allowed"
                    disabled
                  >
                    Complete Assessment First
                  </button>
                );
              }
            })()}
          </div>

          {/* Profile Card */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="ml-4 text-lg font-semibold text-gray-900">
                My Profile
              </h3>
            </div>
            <p className="text-gray-600 mb-4">
              Update your personal information, interests, and career preferences.
            </p>
            <Link
              href="/profile"
              className="block w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors text-center"
            >
              Edit Profile
            </Link>
          </div>
        </div>

        {/* Job Opportunities Widget */}
        {user.zipCode && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">💼 Job Opportunities Near You</h3>
              <Link 
                href="/jobs"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View All Jobs →
              </Link>
            </div>
            <p className="text-gray-600 mb-4">
              Entry-level positions perfect for students and new graduates in your area.
            </p>
            <JobListings 
              zipCode={user.zipCode}
              limit={3}
              showTitle={false}
            />
          </div>
        )}

        {/* Profile Status */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Status</h3>
          <div className="space-y-3">
            {(() => {
              const hasEnhancedResults = checkUserAssessmentResults(user?.email);
              const hasQuickResults = !!localStorage.getItem('sessionId');
              
              return (
                <>
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full mr-3 ${
                      hasEnhancedResults ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                    <span className="text-gray-700">
                      Enhanced Assessment {hasEnhancedResults ? 'Completed ✅' : 'Not Started'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full mr-3 ${
                      hasQuickResults ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                    <span className="text-gray-700">
                      Location {user.zipCode ? `(${user.zipCode}) ✅` : 'Not Set'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full mr-3 ${
                      user.grade ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                    <span className="text-gray-700">
                      Grade Level {user.grade ? `(${user.grade}th Grade) ✅` : 'Not Set'}
                    </span>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
