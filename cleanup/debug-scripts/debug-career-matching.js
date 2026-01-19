const axios = require('axios');

// Debug career matching for photographer profile
async function debugCareerMatching() {
  console.log('🔍 Debugging Career Matching for Photographer Profile...\n');

  const photographerProfile = {
    interests: ['Creative', 'Technology'], // Mixed interests
    skills: ['Creativity', 'Visual Design'],
    workEnvironment: 'Mixed',
    educationGoal: 'associate'
  };

  const photographerAnswers = [
    { questionId: 'interests', answer: 'Creative' },
    { questionId: 'secondary_interest', answer: 'Technology' },
    { questionId: 'work_environment', answer: 'Mixed' },
    { questionId: 'education', answer: 'associate' }
  ];

  const baseURL = process.env.NODE_ENV === 'production' 
    ? 'https://lantern-ai-backend.onrender.com'
    : 'http://localhost:3001';

  console.log(`🎯 Testing Career Matching with Photographer Profile`);
  console.log(`Expected: Photographer should be the TOP career match`);
  console.log(`${'='.repeat(70)}`);

  try {
    console.log('📊 Student Profile:', JSON.stringify(photographerProfile, null, 2));
    console.log('📝 Assessment Answers:', JSON.stringify(photographerAnswers, null, 2));

    console.log('\n🚀 Calling Career Matching API...');

    const response = await axios.post(`${baseURL}/api/test-ai`, {
      profile: photographerProfile,
      answers: photographerAnswers,
      zipCode: '12345',
      currentGrade: 11
    }, {
      timeout: 60000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      console.log('\n✅ API Response Received Successfully!');
      
      // Check career matches in detail
      if (response.data.careerMatches && response.data.careerMatches.length > 0) {
        console.log('\n🎯 DETAILED CAREER MATCHES ANALYSIS:');
        console.log('-'.repeat(70));
        
        response.data.careerMatches.forEach((match, index) => {
          console.log(`${index + 1}. ${match.career.title} (${match.matchScore}% match)`);
          console.log(`   Sector: ${match.career.sector}`);
          console.log(`   Education: ${match.career.requiredEducation}`);
          console.log(`   Salary: $${match.career.averageSalary.toLocaleString()}`);
          console.log(`   Local Demand: ${match.localDemand}`);
          
          if (index === 0) {
            console.log(`   >>> THIS IS THE TOP CAREER MATCH <<<`);
            if (match.career.title === 'Photographer') {
              console.log(`   ✅ SUCCESS: Photographer is correctly the top match`);
            } else {
              console.log(`   ❌ ISSUE: ${match.career.title} is top match, should be Photographer`);
            }
          }
          
          if (match.career.title === 'Photographer') {
            console.log(`   📸 PHOTOGRAPHER FOUND at position ${index + 1}`);
            if (index === 0) {
              console.log(`   ✅ Photographer is correctly ranked #1`);
            } else {
              console.log(`   ❌ Photographer should be ranked higher (currently #${index + 1})`);
            }
          }
          
          if (match.career.title === 'IT Support Specialist') {
            console.log(`   💻 IT SUPPORT SPECIALIST FOUND at position ${index + 1}`);
            if (index === 0) {
              console.log(`   ❌ IT Support Specialist should NOT be the top match for creative interests`);
            }
          }
          
          console.log('');
        });
        
        // Analysis
        const topCareer = response.data.careerMatches[0];
        const photographerMatch = response.data.careerMatches.find(m => m.career.title === 'Photographer');
        const itMatch = response.data.careerMatches.find(m => m.career.title === 'IT Support Specialist');
        
        console.log('\n📊 CAREER MATCHING ANALYSIS:');
        console.log('-'.repeat(50));
        console.log(`Top Career: ${topCareer.career.title} (${topCareer.career.sector} sector)`);
        
        if (photographerMatch) {
          console.log(`Photographer Match Score: ${photographerMatch.matchScore}%`);
          console.log(`Photographer Rank: #${response.data.careerMatches.findIndex(m => m.career.title === 'Photographer') + 1}`);
        } else {
          console.log(`❌ CRITICAL: Photographer not found in career matches!`);
        }
        
        if (itMatch) {
          console.log(`IT Support Specialist Match Score: ${itMatch.matchScore}%`);
          console.log(`IT Support Specialist Rank: #${response.data.careerMatches.findIndex(m => m.career.title === 'IT Support Specialist') + 1}`);
        }
        
        // Check if the issue is in career matching or AI recommendations
        if (topCareer.career.title === 'Photographer') {
          console.log('\n✅ CAREER MATCHING IS CORRECT');
          console.log('   The issue is likely in the AI recommendation generation or fallback logic');
        } else {
          console.log('\n❌ CAREER MATCHING IS INCORRECT');
          console.log('   The career matching algorithm is not properly prioritizing creative careers');
          console.log('   This explains why the student gets IT recommendations');
        }
        
      } else {
        console.log('❌ No career matches found in response');
      }

      // Check what type of recommendations were generated
      const recommendations = response.data.recommendations;
      if (recommendations) {
        console.log('\n🤖 RECOMMENDATION TYPE ANALYSIS:');
        console.log('-'.repeat(50));
        
        // Check career pathway for generic vs specific content
        if (recommendations.careerPathway && recommendations.careerPathway.steps) {
          const hasGenericSteps = recommendations.careerPathway.steps.some(step => 
            step.includes('Complete high school with strong grades') ||
            step.includes('Pursue relevant training') ||
            step.includes('Enter chosen career field')
          );
          
          if (hasGenericSteps) {
            console.log('❌ USING FALLBACK RECOMMENDATIONS (generic steps detected)');
            console.log('   This means either:');
            console.log('   1. USE_REAL_AI is false');
            console.log('   2. AI API call failed and system fell back');
            console.log('   3. AI returned unparseable content');
          } else {
            console.log('✅ USING AI-GENERATED RECOMMENDATIONS (specific steps detected)');
          }
        }
        
        // Check action items for IT vs Creative focus
        if (recommendations.actionItems) {
          const hasITActions = recommendations.actionItems.some(action => 
            action.title?.includes('IT Support Specialist') ||
            action.description?.includes('programming') ||
            action.description?.includes('Python or JavaScript')
          );
          
          const hasCreativeActions = recommendations.actionItems.some(action =>
            action.title?.includes('portfolio') ||
            action.title?.includes('art') ||
            action.title?.includes('creative')
          );
          
          if (hasITActions) {
            console.log('❌ ACTION ITEMS CONTAIN IT RECOMMENDATIONS');
            console.log('   This confirms the system is treating the student as a tech career candidate');
          }
          
          if (hasCreativeActions) {
            console.log('✅ ACTION ITEMS CONTAIN CREATIVE RECOMMENDATIONS');
          }
          
          if (!hasCreativeActions && hasITActions) {
            console.log('❌ CRITICAL: No creative actions found, only IT actions');
          }
        }
      }

    } else {
      console.log('❌ API call failed:', response.data.error);
    }

  } catch (error) {
    console.error('❌ Debug error:', error.response?.data || error.message);
  }

  console.log('\n🏁 Career Matching Debug Complete!');
  console.log('\nNext Steps:');
  console.log('1. If Photographer is not the top career match → Fix career matching algorithm');
  console.log('2. If Photographer is top match but getting IT recommendations → Fix AI/fallback logic');
  console.log('3. If using fallback recommendations → Check AI configuration and error handling');
}

// Run the debug
debugCareerMatching().catch(console.error);