'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Header from './components/Header';

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleGetStarted = async () => {
    setIsLoading(true);
    try {
      // Create a new session
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sessions/start`, {
        method: 'POST',
      });
      const data = await response.json();
      
      if (data.success && data.data.sessionId) {
        // Store session ID and redirect to assessment
        localStorage.setItem('sessionId', data.data.sessionId);
        router.push('/assessment');
      } else {
        alert('Failed to start session. Please try again.');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error starting session:', error);
      alert('Failed to connect to server. Please make sure the backend is running.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Header />
      <div className="pt-8">
        <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Lantern AI
          </h1>
          <p className="text-2xl text-gray-600 mb-4">
            Discover Your Future Career Path
          </p>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            AI-powered career guidance for rural students exploring healthcare and infrastructure careers
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 max-w-3xl mx-auto">
          <div className="space-y-8">
            {/* Features */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Quick Assessment</h3>
                <p className="text-sm text-gray-600">12 simple questions about your interests and goals</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Personalized Matches</h3>
                <p className="text-sm text-gray-600">Get career recommendations based on your profile</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Local Opportunities</h3>
                <p className="text-sm text-gray-600">Find training programs and jobs near you</p>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center pt-8">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Choose Your Assessment</h3>
                <p className="text-gray-600">Select the assessment that best fits your needs</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Quick Assessment Card */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 hover:border-blue-400 transition-colors">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-blue-900 mb-2">Quick Start</h4>
                    <p className="text-blue-700 text-sm mb-4">Perfect for initial exploration</p>
                    <ul className="text-xs text-blue-600 mb-4 space-y-1">
                      <li>• 12 questions, 5 minutes</li>
                      <li>• Basic career matches</li>
                      <li>• Immediate results</li>
                      <li>• Great for demos</li>
                    </ul>
                    <button
                      onClick={handleGetStarted}
                      disabled={isLoading}
                      className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {isLoading ? 'Starting...' : 'Start Quick Assessment'}
                    </button>
                  </div>
                </div>

                {/* Enhanced Assessment Card */}
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 hover:border-green-400 transition-colors relative">
                  <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                    RECOMMENDED
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-green-900 mb-2">Professional Guidance</h4>
                    <p className="text-green-700 text-sm mb-4">Comprehensive career planning</p>
                    <ul className="text-xs text-green-600 mb-4 space-y-1">
                      <li>• 10 strategic questions</li>
                      <li>• Detailed 4-year action plan</li>
                      <li>• Parent sharing features</li>
                      <li>• Counselor-grade analysis</li>
                    </ul>
                    <button
                      onClick={() => router.push('/counselor-assessment')}
                      className="w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                    >
                      🎓 Start Enhanced Assessment
                    </button>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-500">
                  No account needed • Completely free • Save results by creating an account
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Both assessments provide valuable career guidance - choose based on your time and needs
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-16 text-center text-gray-600">
          <p className="text-sm">
            Helping rural students explore careers in healthcare and infrastructure
          </p>
        </div>
        </div>
      </div>
    </div>
  );
}
