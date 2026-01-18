'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Header from '../components/Header';

interface TestProfile {
  profile_id: string;
  name: string;
  q1_grade_zip: {
    grade: string;
    zipCode: string;
  };
  q3_career_knowledge: string;
  q3a_career_categories?: string;
  q3a1_trade_careers?: string;
  q3a2_engineering_careers?: string;
  q3a3_business_careers?: string;
  q3a4_technology_careers?: string;
  q3a5_educator_careers?: string;
  q3a6_healthcare_careers?: string;
  q3a7_public_safety_careers?: string;
  q3a8_researcher_careers?: string;
  q3a9_artist_careers?: string;
  q3a10_law_careers?: string;
  q3a11_other_career?: string;
  q3a3_business_other?: string;
  q3a4_technology_other?: string;
  q3a5_educator_other?: string;
  q3a7_public_safety_other?: string;
  q10_traits?: string[];
  q8_interests_text?: string;
  q9_experience_text?: string;
  q4_academic_performance: Record<string, string>;
  q4b_course_history: Record<string, string>;
  q5_education_willingness: string;
  q14_constraints: string[];
  q17_support_confidence: string;
  q19_20_impact_inspiration: string;
}

// Helper function to get profile display info
const getProfileDisplayInfo = (profile: TestProfile) => {
  const profileId = profile.profile_id;
  
  // Use the name from the profile as default
  let name = profile.name || 'Unknown Profile';
  let description = 'Bias testing profile';
  let icon = '🎓';
  
  // Handle Sex Bias profiles (BT_SEX)
  if (profileId.startsWith('BT_SEX0')) {
    icon = '⚖️';
    if (profileId.includes('female') && profileId.includes('softwaredev')) {
      description = 'Female software developer - tests for gender bias in tech recommendations';
    } else if (profileId.includes('male') && profileId.includes('softwaredev')) {
      description = 'Male software developer - tests for gender bias in tech recommendations';
    } else if (profileId.includes('female') && profileId.includes('registerednurse')) {
      description = 'Female registered nurse - tests for gender bias in healthcare recommendations';
    } else if (profileId.includes('male') && profileId.includes('registerednurse')) {
      description = 'Male registered nurse - tests for gender bias in healthcare recommendations';
    } else if (profileId.includes('female') && profileId.includes('paralegal')) {
      description = 'Female undecided legal - tests for gender bias in legal career recommendations';
    } else if (profileId.includes('male') && profileId.includes('paralegal')) {
      description = 'Male undecided legal - tests for gender bias in legal career recommendations';
    } else if (profileId.includes('female') && profileId.includes('electrician')) {
      description = 'Female undecided trades - tests for gender bias in skilled trades recommendations';
    } else if (profileId.includes('male') && profileId.includes('electrician')) {
      description = 'Male undecided trades - tests for gender bias in skilled trades recommendations';
    } else {
      description = 'Gender bias testing profile - tests for bias in career recommendations based on sex';
    }
  }
  
  // Handle Race Bias profiles (BT_RACE)
  else if (profileId.startsWith('BT_RACE0')) {
    icon = '🤝';
    if (profileId.includes('black') && profileId.includes('registerednurse')) {
      description = 'Black registered nurse - tests for racial bias in healthcare recommendations';
    } else if (profileId.includes('white') && profileId.includes('registerednurse')) {
      description = 'White registered nurse - tests for racial bias in healthcare recommendations';
    } else if (profileId.includes('latino') && profileId.includes('electrician')) {
      description = 'Latino electrician - tests for racial bias in trades recommendations';
    } else if (profileId.includes('white') && profileId.includes('electrician')) {
      description = 'White electrician - tests for racial bias in trades recommendations';
    } else if (profileId.includes('asian') && profileId.includes('softwaredev')) {
      description = 'Asian software developer - tests for racial bias in tech recommendations';
    } else if (profileId.includes('white') && profileId.includes('softwaredev')) {
      description = 'White software developer - tests for racial bias in tech recommendations';
    } else if (profileId.includes('native') && profileId.includes('paralegal')) {
      description = 'Native American paralegal - tests for racial bias in legal recommendations';
    } else if (profileId.includes('white') && profileId.includes('paralegal')) {
      description = 'White paralegal - tests for racial bias in legal recommendations';
    } else {
      description = 'Racial bias testing profile - tests for bias in career recommendations based on race/ethnicity';
    }
  }
  
  // Handle Social Background Bias profiles (BT_SOC)
  else if (profileId.startsWith('BT_SOC0')) {
    icon = '🏛️';
    if (profileId.includes('firstgen_lowincome') && profileId.includes('softwaredev')) {
      description = 'First-gen low-income software developer - tests for socioeconomic bias in tech recommendations';
    } else if (profileId.includes('affluent') && profileId.includes('softwaredev')) {
      description = 'Affluent software developer - tests for socioeconomic bias in tech recommendations';
    } else if (profileId.includes('firstgen_lowincome') && profileId.includes('registerednurse')) {
      description = 'First-gen low-income registered nurse - tests for socioeconomic bias in healthcare recommendations';
    } else if (profileId.includes('affluent') && profileId.includes('registerednurse')) {
      description = 'Affluent registered nurse - tests for socioeconomic bias in healthcare recommendations';
    } else if (profileId.includes('firstgen_lowincome') && profileId.includes('paralegal')) {
      description = 'First-gen low-income paralegal - tests for socioeconomic bias in legal recommendations';
    } else if (profileId.includes('affluent') && profileId.includes('paralegal')) {
      description = 'Affluent paralegal - tests for socioeconomic bias in legal recommendations';
    } else if (profileId.includes('firstgen_lowincome') && profileId.includes('electrician')) {
      description = 'First-gen low-income electrician - tests for socioeconomic bias in trades recommendations';
    } else if (profileId.includes('affluent') && profileId.includes('electrician')) {
      description = 'Affluent electrician - tests for socioeconomic bias in trades recommendations';
    } else {
      description = 'Social background bias testing profile - tests for bias based on socioeconomic background';
    }
  }
  
  // Handle Urban vs Rural Bias profiles (BT_UR)
  else if (profileId.startsWith('BT_UR0')) {
    icon = '🏙️🌾';
    if (profileId.includes('urban') && profileId.includes('softwaredev')) {
      description = 'Urban software developer - tests for geographic bias in tech opportunities';
    } else if (profileId.includes('rural') && profileId.includes('softwaredev')) {
      description = 'Rural software developer - tests for geographic bias in tech opportunities';
    } else if (profileId.includes('urban') && profileId.includes('registerednurse')) {
      description = 'Urban registered nurse - tests for geographic bias in healthcare opportunities';
    } else if (profileId.includes('rural') && profileId.includes('registerednurse')) {
      description = 'Rural registered nurse - tests for geographic bias in healthcare opportunities';
    } else if (profileId.includes('urban') && profileId.includes('paralegal')) {
      description = 'Urban paralegal - tests for geographic bias in legal opportunities';
    } else if (profileId.includes('rural') && profileId.includes('paralegal')) {
      description = 'Rural paralegal - tests for geographic bias in legal opportunities';
    } else if (profileId.includes('urban') && profileId.includes('electrician')) {
      description = 'Urban electrician - tests for geographic bias in trades opportunities';
    } else if (profileId.includes('rural') && profileId.includes('electrician')) {
      description = 'Rural electrician - tests for geographic bias in trades opportunities';
    } else {
      description = 'Urban vs Rural bias testing profile - tests for bias based on geographic location';
    }
  }
  
  // Handle legacy profiles (D_, U_ prefixes)
  else if (profileId.startsWith('D')) {
    // Decided profiles
    icon = '🎯';
    description = 'Legacy decided student profile for baseline testing';
  } else if (profileId.startsWith('U') && !profileId.startsWith('BT_UR')) {
    // Legacy undecided profiles
    icon = '❓';
    description = 'Legacy undecided student profile for baseline testing';
  }
  
  return { name, description, icon };
};

export default function TestProfilesPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);
  const [testProfiles, setTestProfiles] = useState<TestProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch test profiles from API
  useEffect(() => {
    const fetchTestProfiles = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/questionnaire/test-profiles`);
        const data = await response.json();
        
        if (data.success) {
          setTestProfiles(data.data);
        } else {
          setError('Failed to load test profiles');
        }
      } catch (err) {
        console.error('Error fetching test profiles:', err);
        setError('Failed to load test profiles');
      } finally {
        setLoading(false);
      }
    };

    fetchTestProfiles();
  }, []);

  const handleProfileSelect = async (profile: TestProfile) => {
    setIsSubmitting(profile.profile_id);

    try {
      const sessionId = localStorage.getItem('sessionId');
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      console.log('🧪 Submitting test profile:', profile.profile_id);
      console.log('📊 Profile responses:', profile);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/counselor-assessment/submit`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({ 
          sessionId, 
          responses: profile,
          userId: userId ? parseInt(userId) : null
        })
      });

      const data = await response.json();
      if (data.success) {
        // Store results for the results page with timestamp
        const storedUser = localStorage.getItem('user');
        const user = storedUser ? JSON.parse(storedUser) : null;
        
        const resultsWithTimestamp = {
          ...data.data,
          timestamp: new Date().toISOString(),
          userEmail: user?.email || 'test-profile',
          testProfile: getProfileDisplayInfo(profile).name
        };
        
        // Save results with user-specific key
        const getUserSpecificKey = (baseKey: string): string => {
          const storedUser = localStorage.getItem('user');
          if (!storedUser) {
            return `${baseKey}_anonymous`;
          }
          
          try {
            const user = JSON.parse(storedUser);
            if (user?.email) {
              return `${baseKey}_user_${user.email}`;
            }
          } catch (error) {
            console.error('Error parsing user data:', error);
          }
          
          return `${baseKey}_anonymous`;
        };

        const userSpecificResultsKey = getUserSpecificKey('counselorAssessmentResults');
        localStorage.setItem(userSpecificResultsKey, JSON.stringify(resultsWithTimestamp));
        localStorage.setItem('zipCode', profile.q1_grade_zip.zipCode || '');
        
        console.log('✅ Test profile assessment completed successfully');
        
        // Navigate to results page
        router.push('/counselor-results');
      } else {
        alert('Failed to process test profile: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error submitting test profile:', error);
      alert('Failed to submit test profile');
    } finally {
      setIsSubmitting(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Test Profiles" />
        <div className="py-12 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading test profiles...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Test Profiles" />
        <div className="py-12 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="text-red-600 text-lg">{error}</div>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Test Profiles" />
      <div className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">AI Bias Testing Suite</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Select a bias testing profile to evaluate AI fairness across demographic dimensions. 
              Each profile is designed to test for potential bias in career recommendations.
            </p>
          </div>

          {/* Back Button */}
          <div className="mb-6">
            <button
              onClick={() => router.push('/counselor-assessment')}
              className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Back to Assessment
            </button>
          </div>

          {/* Profile Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testProfiles.map((profile) => {
              const displayInfo = getProfileDisplayInfo(profile);
              return (
                <div key={profile.profile_id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-start space-x-4">
                    <div className="text-4xl">{displayInfo.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{displayInfo.name}</h3>
                      <p className="text-gray-600 mb-4">{displayInfo.description}</p>
                      
                      {/* Profile Details */}
                      <div className="space-y-2 text-sm text-gray-500 mb-4">
                        <div>📍 ZIP: {profile.q1_grade_zip.zipCode}</div>
                        <div>🎓 Grade: {profile.q1_grade_zip.grade}</div>
                        <div>📚 Education: {profile.q5_education_willingness}</div>
                        <div>🎯 Career Knowledge: {profile.q3_career_knowledge === 'yes' ? 'Decided' : 'Exploring'}</div>
                      </div>

                      <button
                        onClick={() => handleProfileSelect(profile)}
                        disabled={isSubmitting === profile.profile_id}
                        className={`w-full px-4 py-3 rounded-lg font-semibold transition-colors ${
                          isSubmitting === profile.profile_id
                            ? 'bg-gray-400 text-white cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {isSubmitting === profile.profile_id ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Generating Career Plan...
                          </span>
                        ) : (
                          'Generate Career Plan'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Info Box */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <svg className="w-6 h-6 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="text-lg font-semibold text-blue-900 mb-2">Comprehensive Bias Testing Suite</h4>
                <ul className="text-blue-800 space-y-1">
                  <li>• <strong>Sex Bias (BT_SEX):</strong> 8 profiles testing gender bias across software development, nursing, legal, and trades careers</li>
                  <li>• <strong>Race Bias (BT_RACE):</strong> 8 profiles testing racial bias across nursing, trades, technology, and legal careers</li>
                  <li>• <strong>Social Background Bias (BT_SOC):</strong> 8 profiles testing socioeconomic bias between first-gen/low-income vs affluent backgrounds</li>
                  <li>• <strong>Urban vs Rural Bias (BT_UR):</strong> 8 profiles testing geographic bias across software development, nursing, legal, and trades</li>
                  <li>• <strong>Legacy Profiles (D/U):</strong> 4 baseline profiles for comparison testing</li>
                  <li>• Each profile pair has identical qualifications with only demographic cues changed</li>
                  <li>• Designed to evaluate AI fairness and identify potential bias in career recommendations</li>
                  <li>• Total of 32 profiles: 28 bias testing + 4 legacy baseline profiles</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}