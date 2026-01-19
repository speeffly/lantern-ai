'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ParentResourcesPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    console.log('🔍 Parent Resources - Checking authentication...');
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
      console.log('🔍 Parent Resources - Profile response data:', data);
      
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

  const resources = [
    {
      category: 'Getting Started',
      icon: '🚀',
      items: [
        {
          title: 'Parent Guide to Career Planning',
          description: 'Essential information for supporting your child\'s career exploration',
          type: 'Guide',
          available: false
        },
        {
          title: 'How to Use Lantern AI',
          description: 'Step-by-step instructions for navigating the platform with your child',
          type: 'Tutorial',
          available: false
        },
        {
          title: 'Understanding Assessment Results',
          description: 'How to interpret and discuss your child\'s career assessment results',
          type: 'Guide',
          available: false
        }
      ]
    },
    {
      category: 'Communication Tools',
      icon: '💬',
      items: [
        {
          title: 'Conversation Starters',
          description: 'Questions and topics to discuss career interests with your child',
          type: 'Worksheet',
          available: false
        },
        {
          title: 'Family Career Planning Worksheet',
          description: 'Structured activities for family career exploration sessions',
          type: 'Worksheet',
          available: false
        },
        {
          title: 'Questions for School Counselors',
          description: 'What to ask during parent-counselor meetings about career planning',
          type: 'Checklist',
          available: false
        }
      ]
    },
    {
      category: 'Financial Planning',
      icon: '💰',
      items: [
        {
          title: 'Education Cost Calculator',
          description: 'Estimate costs for different education paths and career training',
          type: 'Tool',
          available: false
        },
        {
          title: 'Scholarship Search Guide',
          description: 'How to find and apply for scholarships and financial aid',
          type: 'Guide',
          available: false
        },
        {
          title: 'Saving for Career Training',
          description: 'Strategies for saving money for your child\'s education and training',
          type: 'Guide',
          available: false
        }
      ]
    },
    {
      category: 'Local Opportunities',
      icon: '🏘️',
      items: [
        {
          title: 'Rural Career Success Stories',
          description: 'Inspiring stories of students who found career success in rural areas',
          type: 'Stories',
          available: false
        },
        {
          title: 'Local Training Programs Directory',
          description: 'Find career training programs and opportunities in your area',
          type: 'Directory',
          available: false
        },
        {
          title: 'Job Shadowing Opportunities',
          description: 'Connect with local professionals for job shadowing experiences',
          type: 'Directory',
          available: false
        }
      ]
    }
  ];

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
              <h1 className="text-2xl font-bold text-gray-900">Parent Resources</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Resources to Support Your Child's Career Journey
          </h2>
          <p className="text-lg text-gray-600">
            Tools, guides, and information to help you be an effective partner in your child's career planning.
          </p>
        </div>

        {resources.map((category, categoryIndex) => (
          <div key={categoryIndex} className="mb-12">
            <div className="flex items-center mb-6">
              <span className="text-3xl mr-3">{category.icon}</span>
              <h3 className="text-2xl font-bold text-gray-900">{category.category}</h3>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {category.items.map((item, itemIndex) => (
                <div key={itemIndex} className={`bg-white rounded-lg shadow-lg p-6 ${!item.available ? 'opacity-75' : ''}`}>
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="text-lg font-semibold text-gray-900">{item.title}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      item.available 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {item.available ? 'Available' : 'Coming Soon'}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{item.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{item.type}</span>
                    {item.available ? (
                      <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                        Access Resource
                      </button>
                    ) : (
                      <button className="px-4 py-2 bg-gray-300 text-gray-500 text-sm rounded-lg cursor-not-allowed">
                        Coming Soon
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Quick Start Guide */}
        <div className="bg-blue-50 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">🎯 Quick Start Guide for Parents</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-blue-800 mb-3">Week 1: Get Started</h4>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• Encourage your child to take the Enhanced Assessment</li>
                <li>• Review the Parent Guide to Career Planning</li>
                <li>• Schedule time to discuss results together</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-3">Week 2: Explore Together</h4>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• Use conversation starters to discuss interests</li>
                <li>• Explore career options in the careers section</li>
                <li>• Complete the family planning worksheet</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-3">Week 3: Connect with School</h4>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• Schedule meeting with school counselor</li>
                <li>• Prepare questions using our checklist</li>
                <li>• Discuss career roadmap with counselor</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-3">Ongoing: Support & Monitor</h4>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• Have monthly career conversations</li>
                <li>• Track progress toward goals</li>
                <li>• Celebrate milestones and achievements</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Available Resources Detail */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📚 Currently Available Resources</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Enhanced Assessment</h4>
              <p className="text-sm text-gray-600 mb-3">
                Your child can take a comprehensive career assessment that provides detailed recommendations and career roadmap planning.
              </p>
              <Link href="/counselor-assessment" className="text-blue-600 hover:text-blue-800 text-sm">
                Try Assessment →
              </Link>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Career Database</h4>
              <p className="text-sm text-gray-600 mb-3">
                Explore detailed information about healthcare and infrastructure careers, including education requirements and salaries.
              </p>
              <Link href="/parent/careers" className="text-blue-600 hover:text-blue-800 text-sm">
                Explore Careers →
              </Link>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Parent Sharing</h4>
              <p className="text-sm text-gray-600 mb-3">
                When your child completes the Enhanced Assessment, they can share comprehensive results directly with you.
              </p>
              <span className="text-green-600 text-sm">✓ Built into assessment</span>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Progress Tracking</h4>
              <p className="text-sm text-gray-600 mb-3">
                Monitor your child's career exploration progress and milestone achievements.
              </p>
              <Link href="/parent/progress" className="text-blue-600 hover:text-blue-800 text-sm">
                Track Progress →
              </Link>
            </div>
          </div>
        </div>

        {/* Support Information */}
        <div className="bg-gray-100 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">📧 Contact Support</h4>
              <p className="text-sm text-gray-600">
                This is a demonstration system for the Presidential Innovation Challenge. 
                In a full implementation, support would be available here.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">🏫 School Counselor</h4>
              <p className="text-sm text-gray-600">
                Your child's school counselor is your best resource for personalized career planning guidance.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">📱 System Updates</h4>
              <p className="text-sm text-gray-600">
                New resources and features are being added regularly. Check back for updates!
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/parent/dashboard"
            className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}