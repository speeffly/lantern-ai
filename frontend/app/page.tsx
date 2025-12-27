'use client';

import { useRouter } from 'next/navigation';
import Header from './components/Header';

export default function Home() {
  const router = useRouter();

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
                <h3 className="font-semibold text-gray-900 mb-2">Comprehensive Assessment</h3>
                <p className="text-sm text-gray-600">15 strategic questions about your interests, values, and goals</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">AI-Powered Matching</h3>
                <p className="text-sm text-gray-600">Get personalized career recommendations with detailed action plans</p>
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
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Start Your Career Journey</h3>
                <p className="text-gray-600">Discover careers that match your interests and values</p>
              </div>
              
              <div className="max-w-md mx-auto">
                {/* Enhanced Assessment Card */}
                <div className="bg-gradient-to-br from-blue-50 to-green-50 border-2 border-blue-200 rounded-lg p-8 hover:border-blue-400 transition-colors">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">Career Assessment</h4>
                    <p className="text-gray-700 text-sm mb-4">Professional-grade career guidance powered by AI</p>
                    <ul className="text-sm text-gray-600 mb-6 space-y-2">
                      <li>• 15 comprehensive questions</li>
                      <li>• Detailed 4-year action plan</li>
                      <li>• Personalized career matches</li>
                      <li>• Local job opportunities</li>
                      <li>• Parent sharing features</li>
                    </ul>
                    <button
                      onClick={() => router.push('/counselor-assessment')}
                      className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-green-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-green-700 transition-all transform hover:scale-105"
                    >
                      🚀 Start Assessment
                    </button>
                  </div>
                </div>
              </div>

              <div className="text-center mt-6">
                <p className="text-sm text-gray-500">
                  No account needed • Completely free • Save results by creating an account
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Takes about 10-15 minutes to complete
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