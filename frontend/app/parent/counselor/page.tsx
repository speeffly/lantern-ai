'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ParentCounselorPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    console.log('🔍 Parent Counselor - Checking authentication...');
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
      console.log('🔍 Parent Counselor - Profile response data:', data);
      
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
              <h1 className="text-2xl font-bold text-gray-900">Connect with Counselor</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Working with Your Child's School Counselor
          </h2>
          <p className="text-lg text-gray-600">
            Your child's school counselor is a key partner in career planning. Here's how to make the most of this relationship.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* How Counselors Use Lantern AI */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">How Counselors Use Lantern AI</h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3"></div>
                <div>
                  <h4 className="font-medium text-gray-900">Enhanced Assessment</h4>
                  <p className="text-sm text-gray-600">Counselors guide students through comprehensive career assessments</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3"></div>
                <div>
                  <h4 className="font-medium text-gray-900">Career Roadmap</h4>
                  <p className="text-sm text-gray-600">Create detailed academic and career preparation plans</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3"></div>
                <div>
                  <h4 className="font-medium text-gray-900">Professional Notes</h4>
                  <p className="text-sm text-gray-600">Document insights and recommendations for student meetings</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3"></div>
                <div>
                  <h4 className="font-medium text-gray-900">Parent Communication</h4>
                  <p className="text-sm text-gray-600">Generate summaries and talking points for parent meetings</p>
                </div>
              </div>
            </div>
          </div>

          {/* What to Expect */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">What to Expect</h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
                <div>
                  <h4 className="font-medium text-gray-900">Data-Driven Discussions</h4>
                  <p className="text-sm text-gray-600">Conversations based on your child's assessment results and interests</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
                <div>
                  <h4 className="font-medium text-gray-900">Specific Recommendations</h4>
                  <p className="text-sm text-gray-600">Concrete next steps for courses, activities, and experiences</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
                <div>
                  <h4 className="font-medium text-gray-900">Local Opportunities</h4>
                  <p className="text-sm text-gray-600">Information about programs and jobs in your area</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
                <div>
                  <h4 className="font-medium text-gray-900">Family Support Plan</h4>
                  <p className="text-sm text-gray-600">Clear ways you can support your child's career goals</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Questions to Ask */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📝 Questions to Ask Your Child's Counselor</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-blue-900 mb-3">About Assessment Results</h4>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• What do my child's assessment results tell us about their interests and strengths?</li>
                <li>• Which career recommendations seem most realistic for our family situation?</li>
                <li>• How do the local job opportunities look for these careers?</li>
                <li>• What are the education requirements and costs for their top career matches?</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-900 mb-3">About Academic Planning</h4>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• What courses should my child take to prepare for their career interests?</li>
                <li>• Are there dual enrollment or AP courses that would be beneficial?</li>
                <li>• What extracurricular activities would support their career goals?</li>
                <li>• How can we plan for post-secondary education or training?</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-900 mb-3">About Support at Home</h4>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• How can I best support my child's career exploration at home?</li>
                <li>• What conversations should we be having as a family?</li>
                <li>• Are there local opportunities for job shadowing or volunteering?</li>
                <li>• How often should we revisit and update their career plan?</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-900 mb-3">About Next Steps</h4>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• What are the most important milestones for this school year?</li>
                <li>• When should we schedule our next meeting to review progress?</li>
                <li>• Are there deadlines or applications we need to be aware of?</li>
                <li>• How will we track progress toward their career goals?</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Meeting Preparation */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">🎯 How to Prepare for Counselor Meetings</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Before the Meeting</h4>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• Review your child's assessment results</li>
                <li>• Discuss career interests with your child</li>
                <li>• Prepare your questions</li>
                <li>• Bring any relevant documents</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-2">During the Meeting</h4>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• Take notes on recommendations</li>
                <li>• Ask for clarification when needed</li>
                <li>• Discuss timeline and next steps</li>
                <li>• Schedule follow-up meetings</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-2">After the Meeting</h4>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• Review notes with your child</li>
                <li>• Create action items and deadlines</li>
                <li>• Follow up on recommendations</li>
                <li>• Track progress toward goals</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Communication Tips */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">💬 Communication Tips</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Building a Strong Partnership</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Be open about your family's goals and concerns</li>
                <li>• Share information about your child's interests and activities</li>
                <li>• Ask questions when you don't understand something</li>
                <li>• Follow through on agreed-upon action items</li>
                <li>• Communicate changes in your child's interests or circumstances</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Making the Most of Meetings</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Schedule meetings at convenient times for focused discussion</li>
                <li>• Bring your child when appropriate for their input</li>
                <li>• Be realistic about your family's resources and constraints</li>
                <li>• Focus on your child's strengths and interests</li>
                <li>• Ask for written summaries of recommendations</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Current System Benefits */}
        <div className="mt-8 bg-green-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-4">✨ Benefits of the Lantern AI System</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-green-800 mb-2">For Your Child</h4>
              <ul className="text-green-700 text-sm space-y-1">
                <li>• Personalized career recommendations</li>
                <li>• Clear 4-year action plan</li>
                <li>• Local job market information</li>
                <li>• Specific next steps and goals</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-green-800 mb-2">For Your Family</h4>
              <ul className="text-green-700 text-sm space-y-1">
                <li>• Easy-to-understand summaries</li>
                <li>• Specific ways to support at home</li>
                <li>• Timeline of important milestones</li>
                <li>• Data-driven career discussions</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/parent/dashboard"
            className="inline-block px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}