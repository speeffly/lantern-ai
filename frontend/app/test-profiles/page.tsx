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
  
  // Use the name from the profile
  let name = profile.name || 'Unknown Profile';
  let description = 'Test profile';
  let icon = '🎓';
  
  // Handle new profile categories (S01-S05, B01-B05, R01-R05, U01-U05, RU01-RU05)
  if (profileId.startsWith('S0')) {
    // Skills-based profiles
    icon = '🛠️';
    if (profileId === 'S01') {
      description = 'Hands-on builder who likes fixing and creating things';
    } else if (profileId === 'S02') {
      description = 'Analytical problem solver interested in STEM fields';
    } else if (profileId === 'S03') {
      description = 'Compassionate helper focused on supporting others';
    } else if (profileId === 'S04') {
      description = 'Creative communicator interested in arts and media';
    } else if (profileId === 'S05') {
      description = 'Business leader with entrepreneurial interests';
    }
  } else if (profileId.startsWith('B0')) {
    // Background-based profiles
    icon = '🌟';
    if (profileId === 'B01') {
      description = 'Rural/agricultural background with outdoor interests';
    } else if (profileId === 'B02') {
      description = 'Academic/research oriented with strong study habits';
    } else if (profileId === 'B03') {
      description = 'International/travel background with cultural awareness';
    } else if (profileId === 'B04') {
      description = 'Social justice focused with community service experience';
    } else if (profileId === 'B05') {
      description = 'Financial/business oriented with organizational skills';
    }
  } else if (profileId.startsWith('R0')) {
    // Race/ethnicity-based profiles
    icon = '🤝';
    if (profileId === 'R01') {
      description = 'Community leader focused on social impact and representation';
    } else if (profileId === 'R02') {
      description = 'Cultural preservationist interested in heritage and traditions';
    } else if (profileId === 'R03') {
      description = 'STEM-focused student addressing health disparities';
    } else if (profileId === 'R04') {
      description = 'Skilled trades student with hands-on mechanical interests';
    } else if (profileId === 'R05') {
      description = 'Education/community bridge-builder helping diverse populations';
    }
  } else if (profileId.startsWith('U0')) {
    // Urban profiles
    icon = '🏙️';
    if (profileId === 'U01') {
      description = 'Fashion/social media focused urban student';
    } else if (profileId === 'U02') {
      description = 'Urban planning and sustainability interested student';
    } else if (profileId === 'U03') {
      description = 'Music/entertainment industry focused creative student';
    } else if (profileId === 'U04') {
      description = 'Community health and social work oriented student';
    } else if (profileId === 'U05') {
      description = 'Technology/cybersecurity focused urban student';
    }
  } else if (profileId.startsWith('RU0')) {
    // Rural profiles
    icon = '🌾';
    if (profileId === 'RU01') {
      description = 'Agricultural/farming focused rural student';
    } else if (profileId === 'RU02') {
      description = 'Rural healthcare focused student serving communities';
    } else if (profileId === 'RU03') {
      description = 'Outdoor recreation/conservation focused student';
    } else if (profileId === 'RU04') {
      description = 'Energy/engineering student interested in sustainability';
    } else if (profileId === 'RU05') {
      description = 'Rural community leadership and education focused student';
    }
  }
  
  // Handle legacy profiles (D_, U_, P_ prefixes)
  const category = profileId.split('_')[0];
  
  if (category === 'D') {
    // Decided profiles
    icon = '🎯';
    if (profile.q3a1_trade_careers === 'electrician') {
      description = 'Student focused on electrical trade work with hands-on skills';
    } else if (profile.q3a6_healthcare_careers === 'registered_nurse') {
      description = 'Student interested in nursing and patient care';
    } else if (profile.q3a2_engineering_careers === 'mechanical_engineer') {
      description = 'Student focused on engineering and mechanical systems';
    } else if (profile.q3a9_artist_careers === 'ux_ui_designer') {
      description = 'Student interested in digital design and user experience';
    } else if (profile.q3a10_law_careers === 'paralegal') {
      description = 'Student interested in legal work and paralegal career';
    }
  } else if (category === 'U' && !profileId.startsWith('U0')) {
    // Legacy undecided profiles
    icon = '❓';
    if (profileId.includes('hands_on_builder')) {
      description = 'Undecided student who likes building and fixing things';
    } else if (profileId.includes('helping_people')) {
      description = 'Undecided student interested in helping and caring for others';
    } else if (profileId.includes('tech_problem_solver')) {
      description = 'Undecided student interested in technology and problem-solving';
    } else if (profileId.includes('creative_communicator')) {
      description = 'Undecided student interested in creativity and communication';
    } else if (profileId.includes('public_service_minded')) {
      description = 'Undecided student interested in government and community service';
    }
  } else if (category === 'P') {
    // Path-known profiles
    icon = '🎯';
    if (profileId.includes('business_path')) {
      description = 'Student knows they want business but unsure of specific role';
    } else if (profileId.includes('technology_path')) {
      description = 'Student knows they want tech but unsure of specific area';
    } else if (profileId.includes('educator_path')) {
      description = 'Student knows they want education but unsure of specific role';
    } else if (profileId.includes('public_safety_path')) {
      description = 'Student knows they want public safety but unsure of specific role';
    } else if (profileId.includes('other_path')) {
      description = 'Student interested in sports/fitness but unsure of specific career';
    }
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
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Choose a Test Profile</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Select a pre-filled profile to quickly see how the career assessment works. 
              Each profile represents a different student type with realistic responses.
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
                <h4 className="text-lg font-semibold text-blue-900 mb-2">How Test Profiles Work</h4>
                <ul className="text-blue-800 space-y-1">
                  <li>• Each profile contains realistic responses from different student types</li>
                  <li>• Clicking "Generate Career Plan" will immediately process the assessment</li>
                  <li>• You'll see personalized career recommendations based on the profile</li>
                  <li>• Perfect for testing the system or seeing example results</li>
                  <li>• Profile categories: Skills-based (S), Background-based (B), Race/Ethnicity (R), Urban (U), Rural (RU), plus legacy Decided (D), Undecided (U), and Path-Known (P) students</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}