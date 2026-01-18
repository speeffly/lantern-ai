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
  
  // Handle Sex Bias profiles (SB)
  if (profileId.startsWith('SB0')) {
    icon = '⚖️';
    if (profileId === 'SB01_male_engineering') {
      description = 'Male engineering student - tests for gender bias in STEM recommendations';
    } else if (profileId === 'SB02_female_engineering') {
      description = 'Female engineering student - tests for gender bias in STEM recommendations';
    } else if (profileId === 'SB03_male_healthcare') {
      description = 'Male healthcare student - tests for gender bias in care profession recommendations';
    } else if (profileId === 'SB04_female_healthcare') {
      description = 'Female healthcare student - tests for gender bias in care profession recommendations';
    } else if (profileId === 'SB05_male_business') {
      description = 'Male business student - tests for gender bias in leadership recommendations';
    } else if (profileId === 'SB06_female_business') {
      description = 'Female business student - tests for gender bias in leadership recommendations';
    } else if (profileId === 'SB07_male_education') {
      description = 'Male education student - tests for gender bias in teaching recommendations';
    } else if (profileId === 'SB08_female_education') {
      description = 'Female education student - tests for gender bias in teaching recommendations';
    }
  }
  
  // Handle Social Background Bias profiles (SOB)
  else if (profileId.startsWith('SOB0')) {
    icon = '🏛️';
    if (profileId === 'SOB01_upper_middle_class') {
      description = 'Upper middle class student - tests for socioeconomic bias in career recommendations';
    } else if (profileId === 'SOB02_working_class') {
      description = 'Working class student - tests for socioeconomic bias in career recommendations';
    } else if (profileId === 'SOB03_first_generation_college') {
      description = 'First-generation college student - tests for educational background bias';
    } else if (profileId === 'SOB04_legacy_student') {
      description = 'Legacy student - tests for privilege bias in career recommendations';
    } else if (profileId === 'SOB05_rural_background') {
      description = 'Rural background student - tests for geographic bias in opportunities';
    } else if (profileId === 'SOB06_urban_background') {
      description = 'Urban background student - tests for geographic bias in opportunities';
    } else if (profileId === 'SOB07_immigrant_family') {
      description = 'Immigrant family student - tests for cultural background bias';
    } else if (profileId === 'SOB08_military_family') {
      description = 'Military family student - tests for family background bias';
    }
  }
  
  // Handle Race Bias profiles (RB)
  else if (profileId.startsWith('RB0')) {
    icon = '🤝';
    if (profileId === 'RB01_african_american_male') {
      description = 'African American male student - tests for racial bias in law career recommendations';
    } else if (profileId === 'RB02_white_male') {
      description = 'White male student - tests for racial bias in law career recommendations';
    } else if (profileId === 'RB03_latina_female') {
      description = 'Latina female student - tests for racial bias in healthcare recommendations';
    } else if (profileId === 'RB04_white_female') {
      description = 'White female student - tests for racial bias in healthcare recommendations';
    } else if (profileId === 'RB05_asian_american_male') {
      description = 'Asian American male student - tests for racial bias in tech recommendations';
    } else if (profileId === 'RB06_white_male_tech') {
      description = 'White male tech student - tests for racial bias in tech recommendations';
    } else if (profileId === 'RB07_native_american_female') {
      description = 'Native American female student - tests for racial bias in education recommendations';
    } else if (profileId === 'RB08_white_female_education') {
      description = 'White female education student - tests for racial bias in education recommendations';
    }
  }
  
  // Handle Urban Bias profiles (UB)
  else if (profileId.startsWith('UB0')) {
    icon = '🏙️';
    if (profileId === 'UB01_urban_entrepreneurship') {
      description = 'Urban entrepreneurship student - tests for geographic bias in business opportunities';
    } else if (profileId === 'UB02_urban_social_work') {
      description = 'Urban social work student - tests for geographic bias in service recommendations';
    } else if (profileId === 'UB03_urban_arts') {
      description = 'Urban arts student - tests for geographic bias in creative career recommendations';
    } else if (profileId === 'UB04_urban_technology') {
      description = 'Urban technology student - tests for geographic bias in tech opportunities';
    } else if (profileId === 'UB05_urban_healthcare') {
      description = 'Urban healthcare student - tests for geographic bias in medical recommendations';
    } else if (profileId === 'UB06_urban_education') {
      description = 'Urban education student - tests for geographic bias in teaching opportunities';
    } else if (profileId === 'UB07_urban_law_enforcement') {
      description = 'Urban law enforcement student - tests for geographic bias in public safety careers';
    } else if (profileId === 'UB08_urban_finance') {
      description = 'Urban finance student - tests for geographic bias in financial career recommendations';
    }
  }
  
  // Handle Rural Bias profiles (RUB)
  else if (profileId.startsWith('RUB0')) {
    icon = '🌾';
    if (profileId === 'RUB01_rural_agriculture') {
      description = 'Rural agriculture student - tests for geographic bias in agricultural recommendations';
    } else if (profileId === 'RUB02_rural_healthcare') {
      description = 'Rural healthcare student - tests for geographic bias in medical opportunities';
    } else if (profileId === 'RUB03_rural_education') {
      description = 'Rural education student - tests for geographic bias in teaching recommendations';
    } else if (profileId === 'RUB04_rural_engineering') {
      description = 'Rural engineering student - tests for geographic bias in STEM opportunities';
    } else if (profileId === 'RUB05_rural_business') {
      description = 'Rural business student - tests for geographic bias in entrepreneurship recommendations';
    } else if (profileId === 'RUB06_rural_conservation') {
      description = 'Rural conservation student - tests for geographic bias in environmental careers';
    } else if (profileId === 'RUB07_rural_technology') {
      description = 'Rural technology student - tests for geographic bias in tech accessibility';
    } else if (profileId === 'RUB08_rural_trades') {
      description = 'Rural trades student - tests for geographic bias in skilled labor recommendations';
    }
  }
  
  // Handle legacy profiles (D_, U_ prefixes)
  else if (profileId.startsWith('D')) {
    // Decided profiles
    icon = '🎯';
    description = 'Legacy decided student profile for baseline testing';
  } else if (profileId.startsWith('U') && !profileId.startsWith('UB')) {
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
                <h4 className="text-lg font-semibold text-blue-900 mb-2">Bias Testing Suite</h4>
                <ul className="text-blue-800 space-y-1">
                  <li>• <strong>Sex Bias (SB):</strong> 8 profiles testing gender bias in engineering, healthcare, business, and education</li>
                  <li>• <strong>Social Background Bias (SOB):</strong> 8 profiles testing socioeconomic and family background bias</li>
                  <li>• <strong>Race Bias (RB):</strong> 8 profiles testing racial bias across law, healthcare, technology, and education</li>
                  <li>• <strong>Urban Bias (UB):</strong> 8 profiles testing geographic bias in urban career opportunities</li>
                  <li>• <strong>Rural Bias (RUB):</strong> 8 profiles testing geographic bias in rural career opportunities</li>
                  <li>• <strong>Legacy Profiles (D/U):</strong> 4 baseline profiles for comparison testing</li>
                  <li>• Each profile pair has identical qualifications with only demographic cues changed</li>
                  <li>• Designed to evaluate AI fairness and identify potential bias in career recommendations</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}