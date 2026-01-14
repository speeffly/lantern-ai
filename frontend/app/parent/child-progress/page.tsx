'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface ChildProgress {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  grade?: number;
  assessmentCompleted: boolean;
  careerMatches?: any[];
  lastActivity?: string;
}

function ChildProgressContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const childId = searchParams.get('childId');
  const [isLoading, setIsLoading] = useState(true);
  const [childProgress, setChildProgress] = useState<ChildProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (childId) {
      fetchChildProgress();
    } else {
      setError('No child ID provided');
      setIsLoading(false);
    }
  }, [childId]);

  const fetchChildProgress = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      
      // First, verify parent authentication
      const profileResponse = await fetch(`${apiUrl}/api/auth-db/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const profileData = await profileResponse.json();
      
      if (!profileData.success || profileData.data.role !== 'parent') {
        router.push('/login');
        return;
      }

      // Find the child in the parent's children list
      const children = profileData.data.children || [];
      const child = children.find((c: any) => 
        c.studentId?.toString() === childId || c.email === childId
      );

      if (!child) {
        setError('Child not found or you do not have permission to view this child\'s progress.');
        setIsLoading(false);
        return;
      }

      // Fetch child's progress from the parent-specific endpoint
      const progressResponse = await fetch(`${apiUrl}/api/parent/child/${child.studentId}/progress`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!progressResponse.ok) {
        const errorData = await progressResponse.json().catch(() => ({}));
        if (progressResponse.status === 401 && errorData.error?.includes('Parent role required')) {
          setError('You must be logged in as a parent to view child progress. Please log in with your parent account.');
        } else {
          setError(errorData.error || 'Failed to fetch child progress');
        }
        setIsLoading(false);
        return;
      }

      const progressData = await progressResponse.json();
      
      if (!progressData.success) {
        setError(progressData.error || 'Failed to fetch child progress');
        setIsLoading(false);
        return;
      }

      setChildProgress(progressData.data);

    } catch (error) {
      console.error('Error fetching child progress:', error);
      setError('Failed to load child progress. Please try again.');
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-900 mb-2">Error</h2>
            <p className="text-red-700">{error}</p>
            <Link
              href="/parent/dashboard"
              className="mt-4 inline-block text-red-600 hover:text-red-800"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!childProgress) {
    return null;
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
              <h1 className="text-2xl font-bold text-gray-900">
                {childProgress.firstName}'s Progress
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Child Info Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold text-xl">
                {childProgress.firstName.charAt(0)}{childProgress.lastName.charAt(0)}
              </span>
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-bold text-gray-900">
                {childProgress.firstName} {childProgress.lastName}
              </h2>
              {childProgress.grade && (
                <p className="text-gray-600">{childProgress.grade}th Grade</p>
              )}
              <p className="text-sm text-gray-500">{childProgress.email}</p>
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Assessment Status</h3>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {childProgress.assessmentCompleted ? 'Completed' : 'Not Started'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {childProgress.assessmentCompleted ? 'Assessment completed' : 'Encourage your child to take the assessment'}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Career Matches</h3>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {childProgress.careerMatches?.length || 0}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {childProgress.careerMatches?.length ? 'Career options identified' : 'No matches yet'}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Last Activity</h3>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {childProgress.lastActivity || 'N/A'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {childProgress.lastActivity ? 'Last login or activity' : 'No activity recorded'}
            </p>
          </div>
        </div>

        {/* No Data Message */}
        {!childProgress.assessmentCompleted && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-blue-600 mt-1 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  No Assessment Data Yet
                </h3>
                <p className="text-blue-800 mb-4">
                  {childProgress.firstName} hasn't completed the career assessment yet. Once they complete it, you'll be able to see:
                </p>
                <ul className="text-blue-700 space-y-1 ml-4">
                  <li>• Career recommendations and match scores</li>
                  <li>• Personalized career roadmap</li>
                  <li>• Skills to develop and courses to take</li>
                  <li>• Timeline and milestones</li>
                  <li>• Ways you can support their goals</li>
                </ul>
                <div className="mt-4">
                  <p className="text-blue-800 font-medium">
                    Encourage {childProgress.firstName} to:
                  </p>
                  <ol className="text-blue-700 space-y-1 ml-4 mt-2">
                    <li>1. Log in to their student account</li>
                    <li>2. Take the Enhanced Career Assessment</li>
                    <li>3. Review their results</li>
                    <li>4. Share the results with you (optional)</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/parent/dashboard"
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-center"
          >
            Back to Dashboard
          </Link>
          <Link
            href="/parent/counselor"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center"
          >
            View Counselor Guidance
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ChildProgressPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    }>
      <ChildProgressContent />
    </Suspense>
  );
}
