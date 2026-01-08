'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ParentProgressPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    console.log('🔍 Parent Progress - Checking authentication...');
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
      console.log('🔍 Parent Progress - Profile response data:', data);
      
      if (data.success && data.data.role === 'parent') {
        console.log('✅ Parent authentication successful');
        console.log('👤 Parent data:', {
          id: data.data.id,
          email: data.data.email,
          firstName: data.data.firstName || data.data.first_name,
          lastName: data.data.lastName || data.data.last_name,
          role: data.data.role
        });
      } else {
        console.log('❌ Authentication failed or not a parent:', {
          success: data.success,
          role: data.data?.role,
          error: data.error
        });
        console.log('🧹 Clearing tokens and redirecting to login');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
      }
    } catch (error) {
      console.error('❌ Parent auth check failed with error:', error);
      console.log('🧹 Clearing tokens and redirecting to login');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link href="/parent/dashboard" className="text-blue-600 hover:text-blue-800">
                ← Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Progress Tracking</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Current Features */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Available Now</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-semibold text-gray-900">Shared Assessment Results</h3>
                <p className="text-sm text-gray-600 mb-2">
                  When your child completes the Enhanced Assessment, they can share detailed results with you
                </p>
                <div className="text-xs text-gray-500">
                  ✓ Career recommendations with explanations<br/>
                  ✓ 4-year action plan with specific steps<br/>
                  ✓ Timeline highlights and milestones<br/>
                  ✓ Ways you can support their goals
                </div>
              </div>
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-gray-900">Parent Summary</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Receive easy-to-understand summaries of your child's career planning
                </p>
                <div className="text-xs text-gray-500">
                  ✓ Key recommendations in plain language<br/>
                  ✓ Support actions you can take<br/>
                  ✓ Important dates and deadlines<br/>
                  ✓ Questions to discuss with counselors
                </div>
              </div>
            </div>
          </div>

          {/* Coming Soon */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Coming Soon</h2>
            <div className="space-y-3">
              <div className="bg-gray-50 p-3 rounded">
                <h3 className="font-semibold text-gray-900">Real-Time Progress Dashboard</h3>
                <p className="text-sm text-gray-600">Track your child's assessment completion and milestone achievements</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <h3 className="font-semibold text-gray-900">Goal Tracking</h3>
                <p className="text-sm text-gray-600">Monitor progress toward career planning goals and action items</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <h3 className="font-semibold text-gray-900">Activity Timeline</h3>
                <p className="text-sm text-gray-600">See a chronological view of your child's career exploration activities</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <h3 className="font-semibold text-gray-900">Progress Notifications</h3>
                <p className="text-sm text-gray-600">Get alerts when your child completes assessments or reaches milestones</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <h3 className="font-semibold text-gray-900">Counselor Updates</h3>
                <p className="text-sm text-gray-600">Receive updates from school counselors about your child's progress</p>
              </div>
            </div>
          </div>
        </div>

        {/* How to Track Progress Now */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">How to Track Your Child's Progress Now</h3>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Encourage Assessment</h4>
              <p className="text-sm text-gray-600">
                Ask your child to take the Enhanced Assessment and share the results with you
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 font-bold">2</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Review Together</h4>
              <p className="text-sm text-gray-600">
                Go through the career recommendations and 4-year plan as a family
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-600 font-bold">3</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Regular Check-ins</h4>
              <p className="text-sm text-gray-600">
                Schedule monthly conversations about career interests and goals
              </p>
            </div>
          </div>
        </div>

        {/* Progress Tracking Tips */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">📊 Tips for Tracking Progress</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Create a Career Journal</h4>
              <p className="text-blue-700 text-sm">
                Keep a notebook of your child's career interests, assessment results, and goals
              </p>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Set Monthly Goals</h4>
              <p className="text-blue-700 text-sm">
                Work with your child to set small, achievable career exploration goals each month
              </p>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Celebrate Milestones</h4>
              <p className="text-blue-700 text-sm">
                Acknowledge when your child completes assessments, explores new careers, or meets goals
              </p>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Stay Connected with School</h4>
              <p className="text-blue-700 text-sm">
                Maintain regular communication with your child's counselor about their progress
              </p>
            </div>
          </div>
        </div>

        {/* Sample Progress Checklist */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sample Progress Checklist</h3>
          <div className="space-y-3">
            <div className="flex items-center">
              <input type="checkbox" className="mr-3 h-4 w-4 text-blue-600" />
              <span className="text-gray-700">Child completed Enhanced Assessment</span>
            </div>
            <div className="flex items-center">
              <input type="checkbox" className="mr-3 h-4 w-4 text-blue-600" />
              <span className="text-gray-700">Reviewed career recommendations together</span>
            </div>
            <div className="flex items-center">
              <input type="checkbox" className="mr-3 h-4 w-4 text-blue-600" />
              <span className="text-gray-700">Discussed 4-year action plan</span>
            </div>
            <div className="flex items-center">
              <input type="checkbox" className="mr-3 h-4 w-4 text-blue-600" />
              <span className="text-gray-700">Scheduled meeting with school counselor</span>
            </div>
            <div className="flex items-center">
              <input type="checkbox" className="mr-3 h-4 w-4 text-blue-600" />
              <span className="text-gray-700">Identified next steps and goals</span>
            </div>
            <div className="flex items-center">
              <input type="checkbox" className="mr-3 h-4 w-4 text-blue-600" />
              <span className="text-gray-700">Planned career exploration activities</span>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/parent/dashboard"
            className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}