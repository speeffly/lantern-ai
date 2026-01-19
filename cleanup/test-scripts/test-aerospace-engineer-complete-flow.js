const axios = require('axios');

const API_BASE = process.env.API_URL || 'http://localhost:3001';

async function testAerospaceEngineerFlow() {
  console.log('🚀 Testing Complete Aerospace Engineer Assessment Flow');
  console.log('=' .repeat(60));

  try {
    // Step 1: Test assessment structure
    console.log('\n1. Testing Assessment Structure...');
    const assessmentResponse = await axios.get(`${API_BASE}/api/assessment/v2`);
    
    if (assessmentResponse.data.success) {
      const assessment = assessmentResponse.data.data;
      console.log('✅ Assessment loaded successfully');
      
      // Check if work preference question has engineering option
      const workPrefQuestion = assessment.questions.find(q => q.id === 'work_preference_main');
      if (workPrefQuestion) {
        const engineeringOption = workPrefQuestion.options.find(opt => 
          opt.value === 'hard_hat_creating_designs'
        );
        if (engineeringOption) {
          console.log('✅ Engineering option found:', engineeringOption.label);
          console.log('   Description:', engineeringOption.description);
        } else {
          console.log('❌ Engineering option not found in work preference question');
        }
      }
      
      // Check career mapping
      if (assessment.careerMapping && assessment.careerMapping.hard_hat_creating_designs) {
        const engineeringCareers = assessment.careerMapping.hard_hat_creating_designs.careers;
        console.log('✅ Engineering careers in mapping:', engineeringCareers.slice(0, 5).join(', '));
        
        if (engineeringCareers.includes('Aerospace Engineer')) {
          console.log('✅ Aerospace Engineer found in career mapping');
        } else {
          console.log('❌ Aerospace Engineer not found in career mapping');
        }
      }
    }

    // Step 2: Test career service
    console.log('\n2. Testing Career Service...');
    const careerServiceResponse = await axios.get(`${API_BASE}/api/careers/all`);
    
    if (careerServiceResponse.data.success) {
      const careers = careerServiceResponse.data.data;
      const aerospaceEngineer = careers.find(c => c.title === 'Aerospace Engineer');
      
      if (aerospaceEngineer) {
        console.log('✅ Aerospace Engineer found in career service');
        console.log('   ID:', aerospaceEngineer.id);
        console.log('   Sector:', aerospaceEngineer.sector);
        console.log('   Salary:', aerospaceEngineer.averageSalary);
        console.log('   Education:', aerospaceEngineer.requiredEducation);
      } else {
        console.log('❌ Aerospace Engineer not found in career service');
      }
    }

    // Step 3: Test complete assessment submission with aerospace engineer selection
    console.log('\n3. Testing Assessment Submission with Aerospace Engineer Selection...');
    
    const testResponses = {
      basic_info: {
        grade: '11',
        zipCode: '12345'
      },
      work_preference_main: 'hard_hat_creating_designs', // This should lead to aerospace engineer
      subject_strengths: {
        math: '5',      // Very interested in math (important for engineering)
        science: '5',   // Very interested in science (important for engineering)
        english: '3',   // Moderate interest
        history: '2',   // Low interest
        art: '3',       // Moderate interest
        technology: '4', // High interest (relevant for aerospace)
        languages: '2', // Low interest
        physical_ed: '2' // Low interest
      },
      education_commitment: 'bachelor', // Bachelor's degree (required for aerospace engineering)
      decided_career_constraints: 'Interested in aerospace and aviation industry',
      decided_education_support: 'strong_support',
      decided_impact_and_inspiration: 'I am inspired by aerospace engineers who design spacecraft and aircraft. I want to be remembered for contributing to space exploration and aviation safety.'
    };

    const submissionResponse = await axios.post(`${API_BASE}/api/assessment/v2/submit`, {
      responses: testResponses,
      path: 'decided'
    });

    if (submissionResponse.data.success) {
      const results = submissionResponse.data.data;
      console.log('✅ Assessment submitted successfully');
      console.log('   Path taken:', results.pathTaken);
      console.log('   Work preference determined:', results.determinedWorkPreference);
      
      if (results.careerMatches && results.careerMatches.length > 0) {
        console.log('\n📊 Top Career Matches:');
        results.careerMatches.slice(0, 5).forEach((match, index) => {
          console.log(`   ${index + 1}. ${match.career.title} (${match.matchScore}%)`);
          if (match.career.title === 'Aerospace Engineer') {
            console.log('   🎯 AEROSPACE ENGINEER FOUND IN RESULTS!');
            console.log('   📝 Explanation:', match.explanation || 'No explanation provided');
          }
        });
        
        // Check if aerospace engineer is in top 3
        const topThree = results.careerMatches.slice(0, 3);
        const aerospaceInTopThree = topThree.find(m => m.career.title === 'Aerospace Engineer');
        
        if (aerospaceInTopThree) {
          console.log('🎉 SUCCESS: Aerospace Engineer is in top 3 matches!');
          console.log('   Match Score:', aerospaceInTopThree.matchScore + '%');
        } else {
          console.log('⚠️  WARNING: Aerospace Engineer not in top 3 matches');
          
          // Check if it's in the full list
          const aerospaceInResults = results.careerMatches.find(m => m.career.title === 'Aerospace Engineer');
          if (aerospaceInResults) {
            console.log('   But it is in the results at position:', 
              results.careerMatches.findIndex(m => m.career.title === 'Aerospace Engineer') + 1);
            console.log('   Match Score:', aerospaceInResults.matchScore + '%');
          } else {
            console.log('❌ CRITICAL: Aerospace Engineer not found in any results');
          }
        }
      } else {
        console.log('❌ No career matches returned');
      }

      // Test AI recommendation if available
      if (results.aiRecommendation) {
        console.log('\n🤖 AI Recommendation Analysis:');
        console.log('   Length:', results.aiRecommendation.length, 'characters');
        
        if (results.aiRecommendation.toLowerCase().includes('aerospace')) {
          console.log('✅ AI recommendation mentions aerospace');
        } else {
          console.log('⚠️  AI recommendation does not mention aerospace');
        }
        
        if (results.aiRecommendation.toLowerCase().includes('engineer')) {
          console.log('✅ AI recommendation mentions engineering');
        } else {
          console.log('⚠️  AI recommendation does not mention engineering');
        }
      }

    } else {
      console.log('❌ Assessment submission failed:', submissionResponse.data.error);
    }

    // Step 4: Test subject-career alignment specifically
    console.log('\n4. Testing Subject-Career Alignment...');
    
    // Test if math and science subjects properly align with aerospace engineering
    const alignmentTestResponse = await axios.post(`${API_BASE}/api/careers/match`, {
      profile: {
        interests: ['Infrastructure', 'Technology'],
        skills: ['Problem Solving', 'Mathematics', 'Science'],
        educationGoal: 'bachelor',
        workEnvironment: 'indoor'
      },
      zipCode: '12345'
    });

    if (alignmentTestResponse.data.success) {
      const matches = alignmentTestResponse.data.data;
      const aerospaceMatch = matches.find(m => m.career.title === 'Aerospace Engineer');
      
      if (aerospaceMatch) {
        console.log('✅ Aerospace Engineer found in career matching service');
        console.log('   Match Score:', aerospaceMatch.matchScore + '%');
        console.log('   Reasoning Factors:', aerospaceMatch.reasoningFactors.slice(0, 2));
      } else {
        console.log('❌ Aerospace Engineer not found in career matching service');
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('🏁 Test Complete');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    if (error.response) {
      console.error('   Response status:', error.response.status);
      console.error('   Response data:', error.response.data);
    }
  }
}

// Run the test
testAerospaceEngineerFlow();