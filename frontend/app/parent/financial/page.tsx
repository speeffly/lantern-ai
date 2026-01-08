'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ParentFinancialPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    console.log('🔍 Parent Financial - Checking authentication...');
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
      console.log('🔍 Parent Financial - Profile response data:', data);
      
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

  const educationPaths = [
    {
      type: 'Certificate Programs',
      duration: '6 months - 2 years',
      cost: '$5,000 - $15,000',
      examples: ['Medical Assistant', 'HVAC Technician', 'Pharmacy Technician'],
      financialAid: 'Pell Grants, state grants, employer sponsorship',
      roi: 'Quick entry to workforce, immediate income'
    },
    {
      type: 'Community College (Associate)',
      duration: '2 years',
      cost: '$6,000 - $12,000',
      examples: ['Registered Nurse', 'Engineering Technician', 'Paralegal'],
      financialAid: 'Pell Grants, state grants, scholarships, work-study',
      roi: 'Good balance of cost and earning potential'
    },
    {
      type: 'Four-Year College',
      duration: '4 years',
      cost: '$20,000 - $40,000 (in-state)',
      examples: ['Civil Engineer', 'Teacher', 'Business Manager'],
      financialAid: 'Federal loans, grants, scholarships, work-study',
      roi: 'Higher earning potential, more career options'
    },
    {
      type: 'Apprenticeships',
      duration: '2 - 4 years',
      cost: 'Paid training (earn while learning)',
      examples: ['Electrician', 'Plumber', 'Construction Worker'],
      financialAid: 'Employer-sponsored, some federal programs',
      roi: 'No debt, immediate income, high demand skills'
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
              <h1 className="text-2xl font-bold text-gray-900">Financial Planning</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Planning for Your Child's Career Education
          </h2>
          <p className="text-lg text-gray-600">
            Understanding costs and financial aid options for different career paths.
          </p>
        </div>

        {/* Education Path Costs */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Education Path Costs & Options</h3>
          <div className="grid gap-6 md:grid-cols-2">
            {educationPaths.map((path, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xl font-semibold text-gray-900">{path.type}</h4>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {path.duration}
                  </span>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div>
                    <span className="font-medium text-gray-700">Estimated Cost: </span>
                    <span className="text-green-600 font-semibold">{path.cost}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Career Examples: </span>
                    <span className="text-gray-600">{path.examples.join(', ')}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Financial Aid: </span>
                    <span className="text-gray-600">{path.financialAid}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">ROI: </span>
                    <span className="text-gray-600">{path.roi}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Planning Tips */}
        <div className="grid gap-6 md:grid-cols-2 mb-12">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Saving Strategies</h3>
            <ul className="space-y-2 text-gray-600">
              <li>• Start saving early, even small amounts help</li>
              <li>• Consider 529 education savings plans</li>
              <li>• Look into state-specific savings programs</li>
              <li>• Encourage your child to save from part-time jobs</li>
              <li>• Research employer tuition assistance programs</li>
              <li>• Consider community college for first two years</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Financial Aid Basics</h3>
            <ul className="space-y-2 text-gray-600">
              <li>• Complete FAFSA (Free Application for Federal Student Aid)</li>
              <li>• Apply for grants (money you don't have to repay)</li>
              <li>• Search for scholarships early and often</li>
              <li>• Consider work-study programs</li>
              <li>• Understand loan terms before borrowing</li>
              <li>• Look for local and regional scholarships</li>
            </ul>
          </div>
        </div>

        {/* Cost Comparison Tool */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-12">
          <h3 className="text-xl font-bold text-gray-900 mb-4">💰 Sample Career Path Costs</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Career</th>
                  <th className="text-left py-2">Education Required</th>
                  <th className="text-left py-2">Estimated Cost</th>
                  <th className="text-left py-2">Starting Salary</th>
                  <th className="text-left py-2">Payback Period</th>
                </tr>
              </thead>
              <tbody className="text-gray-600">
                <tr className="border-b">
                  <td className="py-2">Medical Assistant</td>
                  <td className="py-2">Certificate (1 year)</td>
                  <td className="py-2">$8,000</td>
                  <td className="py-2">$35,000</td>
                  <td className="py-2">3-4 months</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Registered Nurse</td>
                  <td className="py-2">Associate Degree (2 years)</td>
                  <td className="py-2">$12,000</td>
                  <td className="py-2">$75,000</td>
                  <td className="py-2">2-3 months</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Electrician</td>
                  <td className="py-2">Apprenticeship (4 years)</td>
                  <td className="py-2">$0 (paid training)</td>
                  <td className="py-2">$60,000</td>
                  <td className="py-2">Immediate</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Civil Engineer</td>
                  <td className="py-2">Bachelor's Degree (4 years)</td>
                  <td className="py-2">$40,000</td>
                  <td className="py-2">$85,000</td>
                  <td className="py-2">6-8 months</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            *Costs are estimates and vary by location and institution. Salaries are national averages.
          </p>
        </div>

        {/* Scholarship Resources */}
        <div className="bg-blue-50 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">🎓 Scholarship & Financial Aid Resources</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-blue-800 mb-3">Federal Resources</h4>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• FAFSA (Federal Student Aid)</li>
                <li>• Pell Grants (need-based)</li>
                <li>• Federal Work-Study Programs</li>
                <li>• Federal Student Loans</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-3">Other Sources</h4>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• State grant programs</li>
                <li>• Local community foundations</li>
                <li>• Industry-specific scholarships</li>
                <li>• Employer tuition assistance</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-3">Rural-Specific Aid</h4>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• USDA Rural Development grants</li>
                <li>• State rural scholarship programs</li>
                <li>• Healthcare workforce programs</li>
                <li>• Infrastructure training grants</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-3">Tips for Success</h4>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• Apply early and often</li>
                <li>• Meet all deadlines</li>
                <li>• Write compelling essays</li>
                <li>• Get strong recommendation letters</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Financial Planning Checklist */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Financial Planning Checklist</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Freshman/Sophomore Year</h4>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-700">Start saving for education costs</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-700">Research career education requirements</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-700">Look into 529 savings plans</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-700">Encourage child to save from jobs</span>
                </label>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Junior/Senior Year</h4>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-700">Complete FAFSA application</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-700">Apply for scholarships and grants</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-700">Compare education program costs</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-700">Understand loan terms and options</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Coming Soon */}
        <div className="bg-gray-100 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🔮 Coming Soon</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Cost Calculator</h4>
              <p className="text-sm text-gray-600">
                Interactive tool to estimate education costs for your child's career path
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Scholarship Database</h4>
              <p className="text-sm text-gray-600">
                Searchable database of scholarships relevant to rural students
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Financial Aid Timeline</h4>
              <p className="text-sm text-gray-600">
                Personalized timeline of financial aid deadlines and requirements
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/parent/dashboard"
            className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}