'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Parent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'parent';
  children?: {
    studentId: string;
    firstName: string;
    lastName: string;
    grade?: number;
  }[];
}

export default function ParentSettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<Parent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [childEmail, setChildEmail] = useState('');
  const [isLinking, setIsLinking] = useState(false);
  const [linkError, setLinkError] = useState('');
  const [linkSuccess, setLinkSuccess] = useState('');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    console.log('🔍 Parent Settings - Checking authentication...');
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
      console.log('🔍 Parent Settings - Profile response data:', data);
      
      if (data.success && data.data.role === 'parent') {
        console.log('✅ Parent authentication successful');
        console.log('👤 Parent data:', {
          id: data.data.id,
          email: data.data.email,
          firstName: data.data.firstName || data.data.first_name,
          lastName: data.data.lastName || data.data.last_name,
          role: data.data.role
        });
        setUser(data.data);
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

  const handleLinkChild = async () => {
    if (!childEmail.trim()) {
      setLinkError('Please enter a valid email address');
      return;
    }

    setIsLinking(true);
    setLinkError('');
    setLinkSuccess('');

    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      
      const response = await fetch(`${apiUrl}/api/auth-db/link-child`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ childEmail: childEmail.trim() })
      });

      const data = await response.json();

      if (data.success) {
        setLinkSuccess(`Successfully linked ${data.data.child.firstName} ${data.data.child.lastName} to your account!`);
        setChildEmail('');
        
        // Refresh user data to show the new child
        setTimeout(() => {
          setShowLinkModal(false);
          setLinkSuccess('');
          checkAuth(); // Reload user data
        }, 2000);
      } else {
        setLinkError(data.error || 'Failed to link child account');
      }
    } catch (error) {
      console.error('Error linking child:', error);
      setLinkError('Network error. Please try again.');
    } finally {
      setIsLinking(false);
    }
  };

  const handleCloseModal = () => {
    setShowLinkModal(false);
    setChildEmail('');
    setLinkError('');
    setLinkSuccess('');
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
            <div className="flex items-center space-x-4">
              <Link href="/parent/dashboard" className="text-blue-600 hover:text-blue-800">
                ← Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Profile Information */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="ml-4 text-xl font-bold text-gray-900">Profile Information</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <div className="text-gray-900">{user.firstName} {user.lastName}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="text-gray-900">{user.email}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <div className="text-gray-900">Parent</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account ID</label>
                <div className="text-gray-500 text-sm font-mono">{user.id}</div>
              </div>
            </div>
            <div className="mt-6">
              <Link
                href="/profile"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Edit Profile
              </Link>
            </div>
          </div>

          {/* Children Information */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              </div>
              <h2 className="ml-4 text-xl font-bold text-gray-900">Children</h2>
            </div>
            {user.children && user.children.length > 0 ? (
              <div className="space-y-3">
                {user.children.map((child, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-3">
                    <div className="font-medium text-gray-900">
                      {child.firstName} {child.lastName}
                    </div>
                    {child.grade && (
                      <div className="text-sm text-gray-600">Grade {child.grade}</div>
                    )}
                    <div className="text-xs text-gray-500 mt-1">ID: {child.studentId}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-center py-4">
                No children linked to this account yet.
              </div>
            )}
            <div className="mt-4">
              <button 
                onClick={() => setShowLinkModal(true)}
                className="w-full px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
              >
                Link Child Account
              </button>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-2H4v2zM4 15h8v-2H4v2zM4 11h8V9H4v2z" />
                </svg>
              </div>
              <h2 className="ml-4 text-xl font-bold text-gray-900">Notifications</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">Assessment Completion</div>
                  <div className="text-sm text-gray-600">When your child completes an assessment</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">Progress Updates</div>
                  <div className="text-sm text-gray-600">Weekly progress summaries</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">Counselor Messages</div>
                  <div className="text-sm text-gray-600">Messages from school counselors</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">Resource Updates</div>
                  <div className="text-sm text-gray-600">New resources and features</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
            <div className="mt-6">
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                Save Preferences
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="ml-4 text-xl font-bold text-gray-900">Quick Actions</h2>
            </div>
            <div className="space-y-3">
              <Link
                href="/parent/careers"
                className="block w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="font-medium text-gray-900">Explore Careers</div>
                <div className="text-sm text-gray-600">Learn about career options with your child</div>
              </Link>
              <Link
                href="/parent/resources"
                className="block w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="font-medium text-gray-900">Parent Resources</div>
                <div className="text-sm text-gray-600">Access guides and tools for supporting your child</div>
              </Link>
              <Link
                href="/parent/financial"
                className="block w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="font-medium text-gray-900">Financial Planning</div>
                <div className="text-sm text-gray-600">Plan for education costs and financial aid</div>
              </Link>
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  router.push('/');
                }}
                className="block w-full text-left px-4 py-3 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
              >
                <div className="font-medium text-red-900">Sign Out</div>
                <div className="text-sm text-red-600">Log out of your parent account</div>
              </button>
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Information</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Platform Status</h4>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">All systems operational</span>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Version</h4>
              <p className="text-sm text-gray-600">Lantern AI v1.0.0 (Parent Portal)</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Last Updated</h4>
              <p className="text-sm text-gray-600">December 2024</p>
            </div>
          </div>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">About This System</h4>
            <p className="text-sm text-blue-700">
              This is a demonstration system for the Presidential Innovation Challenge. 
              It showcases how AI-powered career guidance can support rural students and their families.
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/parent/dashboard"
            className="inline-block px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>

      {/* Link Child Account Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Link Child Account</h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <p className="text-gray-600 mb-4">
                Enter your child's email address to link their student account to your parent account.
              </p>
              
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Child's Email Address
              </label>
              <input
                type="email"
                value={childEmail}
                onChange={(e) => setChildEmail(e.target.value)}
                placeholder="student@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={isLinking}
              />
            </div>

            {linkError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{linkError}</p>
              </div>
            )}

            {linkSuccess && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-700 text-sm">{linkSuccess}</p>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={handleCloseModal}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={isLinking}
              >
                Cancel
              </button>
              <button
                onClick={handleLinkChild}
                disabled={isLinking || !childEmail.trim()}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLinking ? 'Linking...' : 'Link Account'}
              </button>
            </div>

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">How it works:</h4>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• Your child must have a student account with this email</li>
                <li>• Once linked, you can view their assessment progress</li>
                <li>• Your child will still have full control of their account</li>
                <li>• You can unlink accounts at any time</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}