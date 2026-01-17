'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Header from '../components/Header';

interface TestProfile {
  id: string;
  name: string;
  description: string;
  icon: string;
  responses: any;
}

const testProfiles: TestProfile[] = [
  {
    id: 'engineer',
    name: 'Software Engineer',
    description: 'Tech-focused student interested in coding, systems, and problem-solving',
    icon: '💻',
    responses: {
      // Basic info
      q1_grade_zip: {
        grade: '11',
        zipCode: '78735'
      },

      // Career knowledge - "yes" path
      q3_career_knowledge: 'yes',
      q3a_career_categories: 'technology',
      q3a4_technology_careers: 'software_developer',

      // Academic performance matrix
      q4_academic_performance: {
        'Math': 'Excellent',
        'Science (Biology, Chemistry, Physics)': 'Good',
        'English / Language Arts': 'Good',
        'Social Studies / History': 'Good',
        'Art / Creative Subjects': 'Average',
        'Physical Education / Health': 'Good',
        'Technology / Computer Science': 'Excellent',
        'Foreign Languages': 'Good',
        'Business / Economics': 'Good'
      },

      // Education willingness
      q5_education_willingness: 'advanced_degree',

      // Constraints
      q14_constraints: [
        'flexible_hours',
        'open_relocating'
      ],

      // Support confidence
      q17_support_confidence: 'strong_support',

      // Impact and inspiration
      q19_20_impact_inspiration: 'I want to create technology that makes systems more efficient and solves real-world problems. I\'m inspired by engineers and developers who build products that improve everyday life, like accessible software tools and systems that help people work more effectively.'
    }
  },
  {
    id: 'healthcare',
    name: 'Healthcare Professional',
    description: 'Caring student interested in helping people and medical sciences',
    icon: '🏥',
    responses: {
      // Basic info
      q1_grade_zip: {
        grade: '12',
        zipCode: '90210'
      },

      // Career knowledge - "yes" path
      q3_career_knowledge: 'yes',
      q3a_career_categories: 'healthcare',
      q3a6_healthcare_careers: 'registered_nurse',

      // Academic performance matrix
      q4_academic_performance: {
        'Math': 'Good',
        'Science (Biology, Chemistry, Physics)': 'Excellent',
        'English / Language Arts': 'Excellent',
        'Social Studies / History': 'Good',
        'Art / Creative Subjects': 'Average',
        'Physical Education / Health': 'Excellent',
        'Technology / Computer Science': 'Good',
        'Foreign Languages': 'Excellent',
        'Business / Economics': 'Good'
      },

      // Education willingness
      q5_education_willingness: 'advanced_degree',

      // Constraints
      q14_constraints: [
        'predictable_hours',
        'stay_close_home'
      ],

      // Support confidence
      q17_support_confidence: 'strong_support',

      // Impact and inspiration
      q19_20_impact_inspiration: 'I want to be remembered as someone who made a real difference in people\'s health and wellbeing, especially for underserved communities. I\'m inspired by my family doctor who always takes time to listen and explain things clearly, and nurses who work tirelessly to care for patients with compassion and skill.'
    }
  },
  {
    id: 'creative',
    name: 'Creative Professional',
    description: 'Artistic student interested in design, media, and creative expression',
    icon: '🎨',
    responses: {
      // Basic info
      q1_grade_zip: {
        grade: '10',
        zipCode: '10001'
      },

      // Career knowledge - "yes" path
      q3_career_knowledge: 'yes',
      q3a_career_categories: 'artist',
      q3a9_artist_careers: 'graphic_designer',

      // Academic performance matrix
      q4_academic_performance: {
        'Math': 'Average',
        'Science (Biology, Chemistry, Physics)': 'Good',
        'English / Language Arts': 'Excellent',
        'Social Studies / History': 'Good',
        'Art / Creative Subjects': 'Excellent',
        'Physical Education / Health': 'Average',
        'Technology / Computer Science': 'Good',
        'Foreign Languages': 'Good',
        'Business / Economics': 'Average'
      },

      // Education willingness
      q5_education_willingness: 'college_technical',

      // Constraints
      q14_constraints: [
        'flexible_hours',
        'open_relocating'
      ],

      // Support confidence
      q17_support_confidence: 'some_support',

      // Impact and inspiration
      q19_20_impact_inspiration: 'I want to create art and media that inspires people and brings beauty into the world, maybe through films, games, or public art. I\'m inspired by artists and filmmakers who use their creativity to tell important stories and connect with people emotionally, showing that art can change perspectives and make a difference.'
    }
  },
  {
    id: 'business',
    name: 'Business Leader',
    description: 'Entrepreneurial student interested in leadership, organization, and business',
    icon: '💼',
    responses: {
      // Basic info
      q1_grade_zip: {
        grade: '12',
        zipCode: '60601'
      },

      // Career knowledge - "yes" path
      q3_career_knowledge: 'yes',
      q3a_career_categories: 'business_management',
      q3a3_business_careers: 'business_analyst',

      // Academic performance matrix
      q4_academic_performance: {
        'Math': 'Excellent',
        'Science (Biology, Chemistry, Physics)': 'Good',
        'English / Language Arts': 'Excellent',
        'Social Studies / History': 'Excellent',
        'Art / Creative Subjects': 'Average',
        'Physical Education / Health': 'Good',
        'Technology / Computer Science': 'Good',
        'Foreign Languages': 'Good',
        'Business / Economics': 'Excellent'
      },

      // Education willingness
      q5_education_willingness: 'advanced_degree',

      // Constraints
      q14_constraints: [
        'predictable_hours',
        'open_relocating'
      ],

      // Support confidence
      q17_support_confidence: 'strong_support',

      // Impact and inspiration
      q19_20_impact_inspiration: 'I want to build or lead organizations that create jobs and make a positive impact on the economy and community. I\'m inspired by successful entrepreneurs who built companies from the ground up and business leaders who prioritize both profit and social responsibility, showing that business can be a force for good.'
    }
  },
  {
    id: 'undecided',
    name: 'Undecided Explorer',
    description: 'Student who is genuinely unsure about career direction and wants to explore options',
    icon: '🤔',
    responses: {
      // Basic info - matches q1_grade_zip structure
      q1_grade_zip: {
        grade: '11',
        zipCode: '30309'
      },

      // Career knowledge - KEY: "no" triggers the undecided path
      q3_career_knowledge: 'no',

      // Conditional questions that appear when q3_career_knowledge = "no"
      q10_traits: [
        'curious',
        'analytical', 
        'collaborative',
        'detail_oriented'
      ],

      q8_interests_text: 'I have a lot of different interests but haven\'t found my main passion yet. I enjoy reading books, playing basketball with friends, volunteering at the local animal shelter, and learning about different topics online. I like both creative activities like drawing and analytical tasks like solving math problems. I\'m curious about many things but haven\'t found the one thing that really excites me for a career.',

      q9_experience_text: 'I\'ve tried different types of work to see what I might like. I helped at my family\'s small restaurant during busy weekends, which taught me about customer service and working under pressure. I also volunteered at an animal shelter for 6 months, helping with feeding and cleaning, which I really enjoyed. I tutored younger kids in math and science, and worked part-time at a grocery store. Each job taught me something different, but I\'m still figuring out what type of work environment and tasks I prefer.',

      // Academic performance matrix - matches exact structure
      q4_academic_performance: {
        'Math': 'Good',
        'Science (Biology, Chemistry, Physics)': 'Good',
        'English / Language Arts': 'Excellent',
        'Social Studies / History': 'Good',
        'Art / Creative Subjects': 'Average',
        'Physical Education / Health': 'Good',
        'Technology / Computer Science': 'Average',
        'Foreign Languages': 'Good',
        'Business / Economics': 'Average'
      },

      // Education willingness
      q5_education_willingness: 'not_sure',

      // Constraints
      q14_constraints: [
        'stay_close_home',
        'flexible_hours'
      ],

      // Support confidence
      q17_support_confidence: 'some_support',

      // Impact and inspiration
      q19_20_impact_inspiration: 'I want to find work that feels meaningful and makes a positive difference in some way, but I\'m still figuring out what that looks like for me. I hope to discover a career that combines my interests and allows me to grow as a person while contributing something valuable to society. I\'m inspired by people who found their passion later in life and weren\'t afraid to change directions. I admire professionals who seem genuinely happy with their work, regardless of what field they\'re in.'
    }
  }
];

export default function TestProfilesPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);

  const handleProfileSelect = async (profile: TestProfile) => {
    setIsSubmitting(profile.id);

    try {
      const sessionId = localStorage.getItem('sessionId');
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      console.log('🧪 Submitting test profile:', profile.name);
      console.log('📊 Profile responses:', profile.responses);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/counselor-assessment/submit`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({ 
          sessionId, 
          responses: profile.responses,
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
          testProfile: profile.name
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
        localStorage.setItem('zipCode', profile.responses.zipCode || '');
        
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
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
            {testProfiles.map((profile) => (
              <div key={profile.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-start space-x-4">
                  <div className="text-4xl">{profile.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{profile.name}</h3>
                    <p className="text-gray-600 mb-4">{profile.description}</p>
                    
                    {/* Profile Details */}
                    <div className="space-y-2 text-sm text-gray-500 mb-4">
                      <div>📍 ZIP: {profile.responses.zipCode}</div>
                      <div>🎓 Grade: {profile.responses.grade}</div>
                      <div>💼 Work Style: {profile.responses.handsOnPreference}</div>
                      <div>🎯 Education: {profile.responses.educationCommitment}</div>
                    </div>

                    <button
                      onClick={() => handleProfileSelect(profile)}
                      disabled={isSubmitting === profile.id}
                      className={`w-full px-4 py-3 rounded-lg font-semibold transition-colors ${
                        isSubmitting === profile.id
                          ? 'bg-gray-400 text-white cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {isSubmitting === profile.id ? (
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
            ))}
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
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}