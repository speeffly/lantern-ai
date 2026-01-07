'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CounselorParentsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    console.log('🔍 Counselor Parents - Checking authentication...');
    console.log('🎫 Token exists:', !!token);
    
    if (!token) {
      console.log('❌ No token found, redirecting to login');
      router.push('/login');
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const profileUrl = `${apiUrl}/api/auth-db/profile`;
      
      console.log('📡 Making profile request to:', profileUrl);

      const response = await fetch(profileUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('📊 Profile response status:', response.status);

      const data = await response.json();
      console.log('🔍 Counselor Parents - Profile response:', data);
      
      if (!data.success || data.data.role !== 'counselor') {
        console.log('❌ Authentication failed or not a counselor:', {
          success: data.success,
          role: data.data?.role,
          error: data.error
        });
        console.log('🧹 Clearing tokens and redirecting to login');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
        return;
      }
      
      console.log('✅ Counselor authentication successful for parents page');
    } catch (error) {
      console.error('❌ Auth check failed:', error);
      console.log('🧹 Clearing tokens and redirecting to login');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/login');
      return;
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
              <Link href="/counselor/dashboard" className="text-blue-600 hover:text-blue-800">
                ← Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Parent Outreach Tools</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Current Features */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Available Now</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-semibold text-gray-900">Enhanced Assessment Parent Sharing</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Students can share comprehensive career plans directly with parents
                </p>
                <div className="text-xs text-gray-500">
                  ✓ Automatic parent summaries<br/>
                  ✓ One-click sharing via text/clipboard<br/>
                  ✓ Timeline highlights and support actions
                </div>
              </div>
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-gray-900">Counselor Notes</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Professional guidance notes included in assessment results
                </p>
                <div className="text-xs text-gray-500">
                  ✓ Parent meeting topics<br/>
                  ✓ Follow-up recommendations<br/>
                  ✓ Assessment insights
                </div>
              </div>
            </div>
            <div className="mt-6">
              <Link
                href="/counselor-assessment"
                className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
              >
                Try Enhanced Assessment
              </Link>
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
                <h3 className="font-semibold text-gray-900">Email Templates</h3>
                <p className="text-sm text-gray-600">Pre-written emails for parent communication</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <h3 className="font-semibold text-gray-900">Parent Portal</h3>
                <p className="text-sm text-gray-600">Dedicated parent accounts to track student progress</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <h3 className="font-semibold text-gray-900">Meeting Scheduler</h3>
                <p className="text-sm text-gray-600">Schedule and manage parent-counselor meetings</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <h3 className="font-semibold text-gray-900">Progress Notifications</h3>
                <p className="text-sm text-gray-600">Automated updates when students complete milestones</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <h3 className="font-semibold text-gray-900">Multilingual Support</h3>
                <p className="text-sm text-gray-600">Parent summaries in Spanish and other languages</p>
              </div>
            </div>
          </div>
        </div>

        {/* How to Use Current Features */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">How to Engage Parents Now</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">Guide Students</h4>
              <p className="text-sm text-gray-600">
                Have students take the Enhanced Assessment during counseling sessions
              </p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-green-600 font-bold">2</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">Review Results</h4>
              <p className="text-sm text-gray-600">
                Use the counselor notes and parent meeting topics to prepare
              </p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-purple-600 font-bold">3</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">Share with Parents</h4>
              <p className="text-sm text-gray-600">
                Students can share comprehensive summaries directly with parents
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/counselor/dashboard"
            className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}