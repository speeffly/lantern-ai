'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ClearAssessmentPage() {
  const router = useRouter();
  const [cleared, setCleared] = useState(false);

  const clearOldData = () => {
    // Get user email
    const storedUser = localStorage.getItem('user');
    let userEmail = 'unknown';
    
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        userEmail = user.email || 'unknown';
      } catch (e) {
        console.error('Error parsing user:', e);
      }
    }

    console.log('🧹 Clearing old assessment data for:', userEmail);

    // Clear all assessment-related localStorage keys
    const keysToRemove = [
      'counselorAssessmentAnswers',
      'counselorAssessmentResults',
      `counselorAssessmentAnswers_user_${userEmail}`,
      `counselorAssessmentResults_user_${userEmail}`,
      'sessionId',
      'zipCode'
    ];

    keysToRemove.forEach(key => {
      if (localStorage.getItem(key)) {
        console.log(`   Removing: ${key}`);
        localStorage.removeItem(key);
      }
    });

    console.log('✅ Old assessment data cleared');
    setCleared(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Clear Old Assessment Data
        </h1>
        
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Important:</strong> This will clear your old assessment data from this browser.
                You will need to retake the assessment, but it will be properly saved to the database.
              </p>
            </div>
          </div>
        </div>

        {!cleared ? (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Why do I need to do this?</h2>
              <p className="text-gray-700 mb-3">
                Your assessment was completed before a recent system update. The old assessment data
                is only stored in your browser's local storage, which means:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>It disappears when you log out</li>
                <li>It's not available on other devices</li>
                <li>It's not backed up to our database</li>
              </ul>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">What happens after clearing?</h2>
              <p className="text-gray-700 mb-3">
                After clearing the old data and retaking the assessment:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>✅ Your assessment will be saved to the database</li>
                <li>✅ It will persist across logout/login</li>
                <li>✅ It will be available on all your devices</li>
                <li>✅ Your grade and location will be saved to your profile</li>
              </ul>
            </div>

            <button
              onClick={clearOldData}
              className="w-full bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition-colors font-semibold"
            >
              Clear Old Assessment Data
            </button>
          </>
        ) : (
          <>
            <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">
                    <strong>Success!</strong> Old assessment data has been cleared from your browser.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => router.push('/counselor-assessment')}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Take Assessment Now
              </button>

              <button
                onClick={() => router.push('/dashboard')}
                className="w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
              >
                Go to Dashboard
              </button>
            </div>
          </>
        )}

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            Need help? Contact support or check the FAQ.
          </p>
        </div>
      </div>
    </div>
  );
}
