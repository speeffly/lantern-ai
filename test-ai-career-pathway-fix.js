const axios = require('axios');

// Test the AI career pathway fix
async function testAICareerPathwayFix() {
  console.log('🧪 Testing AI Career Pathway Personalization Fix...\n');

  const testCases = [
    {
      name: 'Healthcare Interest Student',
      profile: {
        interests: ['Healthcare'],
        skills: ['Communication', 'Empathy'],
        workEnvironment: 'Indoor',
        educationGoal: 'associate'
      },
      answers: [
        { questionId: 'interests', answer: 'Healthcare' },
        { questionId: 'work_environment', answer: 'Indoor' },
        { questionId: 'education', answer: 'associate' }
      ]
    },
    {
      name: 'Hands-on Work Student',
      profile: {
        interests: ['Hands-on Work'],
        skills: ['Problem Solving', 'Manual Dexterity'],
        workEnvironment: 'Outdoor',
        educationGoal: 'certificate'
      },
      answers: [
        { questionId: 'interests', answer: 'Hands-on Work' },
        { questionId: 'work_environment', answer: 'Outdoor' },
        { questionId: 'education', answer: 'certificate' }
      ]
    },
    {
      name: 'Technology Interest Student',
      profile: {
        interests: ['Technology'],
        skills: ['Analytical Thinking', 'Problem Solving'],
        workEnvironment: 'Indoor',
        educationGoal: 'bachelor'
      },
      answers: [
        { questionId: 'interests', answer: 'Technology' },
        { questionId: 'work_environment', answer: 'Indoor' },
        { questionId: 'education', answer: 'bachelor' }
      ]
    }
  ];

  const baseURL = process.env.NODE_ENV === 'production' 
    ? 'https://lantern-ai-backend.onrender.com'
    : 'http://localhost:3001';

  for (const testCase of testCases) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🎯 Testing: ${testCase.name}`);
    console.log(`${'='.repeat(60)}`);

    try {
      console.log('📊 Student Profile:', JSON.stringify(testCase.profile, null, 2));
      console.log('📝 Assessment Answers:', JSON.stringify(testCase.answers, null, 2));

      const response = await axios.post(`${baseURL}/api/test-ai`, {
        profile: testCase.profile,
        answers: testCase.answers,
        zipCode: '12345',
        currentGrade: 11
      }, {
        timeout: 60000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        const recommendations = response.data.recommendations;
        
        console.log('\n✅ AI Recommendations Generated Successfully!');
        console.log('\n📋 CAREER PATHWAY ANALYSIS:');
        console.log('-'.repeat(50));
        
        if (recommendations.careerPathway && recommendations.careerPathway.steps) {
          console.log('🛤️ Career Pathway Steps:');
          recommendations.careerPathway.steps.forEach((step, index) => {
            console.log(`   ${index + 1}. ${step}`);
            
            // Check for generic content
            if (step.includes('Step ') || step.includes('[') || step.includes('generic')) {
              console.log(`   ⚠️  WARNING: Generic content detected in step ${index + 1}`);
            } else {
              console.log(`   ✅ Specific content detected`);
            }
          });
          
          console.log(`\n⏱️ Timeline: ${recommendations.careerPathway.timeline || 'Not specified'}`);
          console.log(`📋 Requirements: ${recommendations.careerPathway.requirements?.join(', ') || 'Not specified'}`);
          
          // Overall assessment
          const hasGenericSteps = recommendations.careerPathway.steps.some(step => 
            step.includes('Step ') || step.includes('[') || step.includes('generic')
          );
          
          if (hasGenericSteps) {
            console.log('\n❌ ISSUE DETECTED: Career pathway contains generic content');
          } else {
            console.log('\n✅ SUCCESS: Career pathway appears to be personalized');
          }
        } else {
          console.log('❌ No career pathway found in response');
        }

        // Check academic plan for personalization
        if (recommendations.academicPlan && recommendations.academicPlan.currentYear) {
          console.log('\n📚 ACADEMIC PLAN ANALYSIS:');
          console.log('-'.repeat(50));
          console.log(`Current Year Courses: ${recommendations.academicPlan.currentYear.length}`);
          
          recommendations.academicPlan.currentYear.forEach((course, index) => {
            console.log(`   ${index + 1}. ${course.courseName}`);
            console.log(`      Reasoning: ${course.reasoning?.substring(0, 100)}...`);
            
            // Check for specific career connections
            if (course.reasoning && (
              course.reasoning.includes(testCase.profile.interests[0]) ||
              course.reasoning.includes('healthcare') ||
              course.reasoning.includes('technology') ||
              course.reasoning.includes('construction')
            )) {
              console.log(`      ✅ Career-specific reasoning detected`);
            } else {
              console.log(`      ⚠️  Generic reasoning detected`);
            }
          });
        }

        // Check skill gaps for personalization
        if (recommendations.skillGaps && recommendations.skillGaps.length > 0) {
          console.log('\n🎯 SKILL GAPS ANALYSIS:');
          console.log('-'.repeat(50));
          
          recommendations.skillGaps.forEach((gap, index) => {
            console.log(`   ${index + 1}. ${gap.skill} (${gap.importance})`);
            console.log(`      How to acquire: ${gap.howToAcquire?.substring(0, 100)}...`);
            
            // Check for career-specific skills
            const isCareerSpecific = gap.howToAcquire && (
              gap.howToAcquire.includes(testCase.profile.interests[0]) ||
              gap.howToAcquire.includes('healthcare') ||
              gap.howToAcquire.includes('technology') ||
              gap.howToAcquire.includes('construction') ||
              gap.howToAcquire.includes('trades')
            );
            
            if (isCareerSpecific) {
              console.log(`      ✅ Career-specific guidance detected`);
            } else {
              console.log(`      ⚠️  Generic guidance detected`);
            }
          });
        }

      } else {
        console.log('❌ Test failed:', response.data.error);
      }

    } catch (error) {
      console.error('❌ Test error:', error.response?.data || error.message);
    }

    console.log('\n' + '='.repeat(60));
  }

  console.log('\n🏁 AI Career Pathway Personalization Test Complete!');
  console.log('\nKey Success Indicators:');
  console.log('✅ Career pathway steps mention specific careers (not "Step 1", "Step 2")');
  console.log('✅ Academic courses connect to student interests');
  console.log('✅ Skill gaps are relevant to chosen career sector');
  console.log('✅ No placeholder text like [SPECIFIC CAREER TITLE] remains');
}

// Run the test
testAICareerPathwayFix().catch(console.error);