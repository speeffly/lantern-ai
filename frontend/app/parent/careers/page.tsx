'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ParentCareersPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    console.log('🔍 Parent Careers - Checking authentication...');
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
      console.log('🔍 Parent Careers - Profile response data:', data);
      
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

  const careerSectors = [
    {
      name: 'Healthcare',
      description: 'Careers focused on helping people stay healthy and treating illness',
      icon: '🏥',
      careers: [
        { title: 'Registered Nurse', education: '2-4 years', salary: '$75,000', description: 'Provide patient care and support' },
        { title: 'Medical Assistant', education: '1-2 years', salary: '$35,000', description: 'Support doctors and nurses in clinics' },
        { title: 'Physical Therapist', education: '6-7 years', salary: '$90,000', description: 'Help patients recover from injuries' },
        { title: 'Pharmacy Technician', education: '6 months-1 year', salary: '$35,000', description: 'Assist pharmacists with medications' }
      ]
    },
    {
      name: 'Infrastructure',
      description: 'Careers building and maintaining the systems that keep communities running',
      icon: '🏗️',
      careers: [
        { title: 'Electrician', education: '2-4 years', salary: '$60,000', description: 'Install and repair electrical systems' },
        { title: 'Construction Manager', education: '4 years', salary: '$95,000', description: 'Oversee construction projects' },
        { title: 'HVAC Technician', education: '6 months-2 years', salary: '$50,000', description: 'Install and repair heating/cooling systems' },
        { title: 'Civil Engineer', education: '4 years', salary: '$85,000', description: 'Design roads, bridges, and buildings' }
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
              <h1 className="text-2xl font-bold text-gray-900">Career Exploration</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Explore Career Options with Your Child
          </h2>
          <p className="text-lg text-gray-600">
            Learn about different career paths to have informed conversations about your child's future.
          </p>
        </div>

        {careerSectors.map((sector, sectorIndex) => (
          <div key={sectorIndex} className="mb-12">
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <div className="flex items-center mb-4">
                <span className="text-4xl mr-4">{sector.icon}</span>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{sector.name}</h3>
                  <p className="text-gray-600">{sector.description}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
              {sector.careers.map((career, careerIndex) => (
                <div key={careerIndex} className="bg-white rounded-lg shadow-lg p-6">
                  <h4 className="text-xl font-semibold text-gray-900 mb-3">{career.title}</h4>
                  <p className="text-gray-600 mb-4">{career.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-700">Education:</span>
                      <span className="text-sm text-gray-600">{career.education}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-700">Average Salary:</span>
                      <span className="text-sm text-green-600 font-semibold">{career.salary}</span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h5 className="font-medium text-gray-900 mb-2">Discussion Questions:</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• What interests you about this career?</li>
                      <li>• Do you know anyone who does this job?</li>
                      <li>• What skills would you need to develop?</li>
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Parent Tips */}
        <div className="bg-blue-50 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">💡 Tips for Career Conversations</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Ask Open Questions</h4>
              <p className="text-blue-700 text-sm">
                "What do you think would be interesting about this job?" rather than "Do you like this?"
              </p>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Connect to Their Interests</h4>
              <p className="text-blue-700 text-sm">
                "You love helping people - how do you think a nurse helps patients?"
              </p>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Discuss Education Paths</h4>
              <p className="text-blue-700 text-sm">
                Talk about different ways to prepare, from certificates to college degrees.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Explore Locally</h4>
              <p className="text-blue-700 text-sm">
                "Let's see if we can visit a construction site or hospital to learn more."
              </p>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Next Steps</h3>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                <span className="text-green-600 text-sm font-bold">1</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Have Your Child Take the Assessment</h4>
                <p className="text-gray-600 text-sm">
                  Encourage them to complete the Enhanced Assessment for personalized recommendations.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                <span className="text-green-600 text-sm font-bold">2</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Review Results Together</h4>
                <p className="text-gray-600 text-sm">
                  Look at their career matches and discuss what interests them most.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                <span className="text-green-600 text-sm font-bold">3</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Connect with School Counselor</h4>
                <p className="text-gray-600 text-sm">
                  Schedule a meeting to discuss your child's career interests and academic planning.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/parent/dashboard"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}