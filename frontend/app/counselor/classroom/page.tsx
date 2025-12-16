'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CounselorClassroomPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (!data.success || data.data.role !== 'counselor') {
        router.push('/login');
        return;
      }
    } catch (error) {
      console.error('Auth check failed:', error);
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
              <h1 className="text-2xl font-bold text-gray-900">Classroom Tools</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Classroom Management</h2>
          <p className="text-gray-600 mb-6">
            This feature is coming soon! You'll be able to manage student groups, assign assessments 
            to entire classes, and generate bulk reports.
          </p>
          <div className="space-y-4">
            <div className="bg-orange-50 p-4 rounded-lg">
              <h3 className="font-semibold text-orange-900 mb-2">Planned Features:</h3>
              <ul className="text-orange-700 text-sm space-y-1">
                <li>• Create and manage student cohorts</li>
                <li>• Assign assessments to entire classes</li>
                <li>• Generate class-wide reports</li>
                <li>• Track completion rates by class</li>
                <li>• Bulk export student results</li>
                <li>• Schedule assessment sessions</li>
              </ul>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Current Workaround:</h3>
              <p className="text-blue-700 text-sm">
                For now, you can share the assessment links directly with students and track their 
                progress individually through the Student Progress section.
              </p>
              <div className="mt-3 space-y-2">
                <div className="text-sm">
                  <strong>Quick Assessment:</strong> 
                  <code className="ml-2 px-2 py-1 bg-white rounded text-xs">
                    {typeof window !== 'undefined' ? window.location.origin : ''}/assessment
                  </code>
                </div>
                <div className="text-sm">
                  <strong>Enhanced Assessment:</strong> 
                  <code className="ml-2 px-2 py-1 bg-white rounded text-xs">
                    {typeof window !== 'undefined' ? window.location.origin : ''}/counselor-assessment
                  </code>
                </div>
              </div>
            </div>
            <Link
              href="/counselor/dashboard"
              className="inline-block px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}