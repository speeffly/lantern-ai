const axios = require('axios');

// Test AI JSON parsing specifically for photographer profile
async function testAIJSONParsing() {
  console.log('🔍 Testing AI JSON Parsing for Photographer Profile...\n');

  const photographerProfile = {
    interests: ['Creative'],
    skills: ['Creativity', 'Visual Design'],
    workEnvironment: 'Mixed',
    educationGoal: 'associate'
  };

  const photographerAnswers = [
    { questionId: 'interests', answer: 'Creative' },
    { questionId: 'work_environment', answer: 'Mixed' },
    { questionId: 'education', answer: 'associate' }
  ];

  const baseURL = process.env.NODE_ENV === 'production' 
    ? 'https://lantern-ai-backend.onrender.com'
    : 'http://localhost:3002';

  console.log(`🎯 Testing with Photographer Profile`);
  console.log(`Base URL: ${baseURL}`);
  console.log(`${'='.repeat(70)}`);

  try {
    console.log('📊 Student Profile:', JSON.stringify(photographerProfile, null, 2));

    console.log('\n🚀 Making AI API call...');
    const startTime = Date.now();

    const response = await axios.post(`${baseURL}/api/comprehensive-guidance`, {
      profile: photographerProfile,
      answers: photographerAnswers,
      zipCode: '12345',
      currentGrade: 11
    }, {
      timeout: 120000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const endTime = Date.now();
    console.log(`⏱️  Total Response Time: ${(endTime - startTime) / 1000}s`);

    if (!response.data.success) {
      console.log('❌ API call failed:', response.data.error);
      return;
    }

    console.log('\n✅ API Response Received Successfully!');

    // Check career matches first
    console.log('\n🔍 STEP 1: Career Matching Analysis');
    console.log('-'.repeat(50));
    
    const careerMatches = response.data.enhancedCareerMatches || response.data.careerMatches;
    if (!careerMatches || careerMatches.length === 0) {
      console.log('❌ CRITICAL: No career matches found!');
      return;
    }

    const topCareer = careerMatches[0];
    console.log(`✅ Top Career Found: ${topCareer.career?.title || topCareer.title}`);
    console.log(`   Sector: ${topCareer.career?.sector || topCareer.sector}`);
    console.log(`   Match Score: ${topCareer.matchScore}%`);

    const photographerMatch = careerMatches.find(m => 
      (m.career?.title || m.title) === 'Photographer'
    );
    
    if (photographerMatch) {
      const rank = careerMatches.findIndex(m => 
        (m.career?.title || m.title) === 'Photographer'
      ) + 1;
      console.log(`✅ Photographer Found: Rank #${rank} (${photographerMatch.matchScore}% match)`);
      
      if (rank === 1) {
        console.log('✅ Career matching is working correctly');
      } else {
        console.log('⚠️  Photographer should be ranked higher for Creative interest');
      }
    } else {
      console.log('❌ CRITICAL: Photographer not found in career matches');
      console.log('Available careers:', careerMatches.map(m => m.career?.title || m.title).join(', '));
    }

    // Check AI recommendations
    console.log('\n🔍 STEP 2: AI Recommendations Analysis');
    console.log('-'.repeat(50));
    
    const recommendations = response.data.counselorRecommendations;
    if (!recommendations) {
      console.log('❌ CRITICAL: No counselor recommendations found');
      return;
    }

    // Check career pathway specifically
    console.log('\n🔍 STEP 3: Career Pathway Analysis');
    console.log('-'.repeat(50));
    
    const careerPathway = recommendations.careerPathway;
    if (!careerPathway || !careerPathway.steps) {
      console.log('❌ CRITICAL: No career pathway in recommendations');
      return;
    }

    console.log('Career Pathway Steps:');
    careerPathway.steps.forEach((step, index) => {
      console.log(`  ${index + 1}. ${step}`);
    });

    console.log(`Timeline: ${careerPathway.timeline}`);
    console.log(`Requirements: ${careerPathway.requirements?.join(', ') || 'None'}`);

    // Check for fallback indicators
    const fallbackIndicators = [
      'Complete high school with strong grades',
      'Pursue relevant training or education',
      'Enter chosen career field',
      'Explore careers related to'
    ];

    const hasFallbackContent = careerPathway.steps.some(step => 
      fallbackIndicators.some(indicator => step.includes(indicator))
    );

    if (hasFallbackContent) {
      console.log('\n❌ CONFIRMED: Using FALLBACK career pathway');
      console.log('   This indicates AI JSON parsing failed');
      
      // Check if steps mention photographer specifically
      const hasPhotographerContent = careerPathway.steps.some(step => 
        step.toLowerCase().includes('photographer') || 
        step.toLowerCase().includes('photography') ||
        step.toLowerCase().includes('creative')
      );
      
      if (hasPhotographerContent) {
        console.log('✅ But fallback is personalized for photographer');
      } else {
        console.log('❌ Fallback is completely generic');
      }
    } else {
      console.log('\n✅ Using AI-generated career pathway');
      
      // Check if AI content is specific to photographer
      const hasSpecificContent = careerPathway.steps.some(step => 
        step.toLowerCase().includes('photographer') || 
        step.toLowerCase().includes('photography') ||
        step.toLowerCase().includes('portfolio') ||
        step.toLowerCase().includes('creative')
      );
      
      if (hasSpecificContent) {
        console.log('✅ AI generated photographer-specific content');
      } else {
        console.log('⚠️  AI content seems generic despite parsing success');
      }
    }

    // Check skill gaps
    console.log('\n🔍 STEP 4: Skill Gaps Analysis');
    console.log('-'.repeat(50));
    
    if (recommendations.skillGaps && recommendations.skillGaps.length > 0) {
      console.log(`Skill Gaps: ${recommendations.skillGaps.length}`);
      recommendations.skillGaps.forEach((gap, index) => {
        console.log(`  ${index + 1}. ${gap.skill} (${gap.importance})`);
        console.log(`     How to acquire: ${gap.howToAcquire}`);
      });
      
      // Check if skill gaps are appropriate for photographer
      const hasCreativeSkills = recommendations.skillGaps.some(gap => 
        gap.skill.toLowerCase().includes('creative') || 
        gap.skill.toLowerCase().includes('visual') || 
        gap.skill.toLowerCase().includes('design') ||
        gap.skill.toLowerCase().includes('portfolio')
      );
      
      const hasProgrammingSkills = recommendations.skillGaps.some(gap => 
        gap.skill.toLowerCase().includes('programming') && 
        gap.howToAcquire?.toLowerCase().includes('python')
      );
      
      if (hasCreativeSkills) {
        console.log('✅ Creative skills found (appropriate for photographer)');
      }
      
      if (hasProgrammingSkills) {
        console.log('❌ Programming skills found (inappropriate for photographer)');
        console.log('   This suggests skill gaps are not properly personalized');
      }
      
      if (!hasCreativeSkills && !hasProgrammingSkills) {
        console.log('⚠️  Neither creative nor programming skills found');
      }
    }

    // Final diagnosis
    console.log('\n🏥 FINAL DIAGNOSIS:');
    console.log('='.repeat(50));

    if (photographerMatch && photographerMatch === topCareer) {
      console.log('✅ Career matching is working correctly');
      
      if (hasFallbackContent) {
        console.log('❌ PRIMARY ISSUE: AI JSON parsing is failing');
        console.log('   The system correctly identifies photographer as top career');
        console.log('   But AI-generated content is not being parsed successfully');
        console.log('   This causes fallback to generic career pathway steps');
        
        console.log('\n🔧 RECOMMENDED SOLUTIONS:');
        console.log('   1. Check server logs for specific JSON parsing errors');
        console.log('   2. Test AI response cleaning/fixing logic');
        console.log('   3. Enhance JSON extraction methods');
        console.log('   4. Improve AI prompts for cleaner JSON generation');
      } else {
        console.log('✅ AI parsing appears to be working correctly');
        console.log('   Both career matching and AI content generation are successful');
      }
    } else {
      console.log('❌ PRIMARY ISSUE: Career matching is incorrect');
      console.log('   This causes wrong career information to be sent to AI');
      console.log('   Even if AI parsing works, the content will be wrong');
      
      console.log('\n🔧 RECOMMENDED SOLUTIONS:');
      console.log('   1. Debug career matching algorithm');
      console.log('   2. Check interest-to-career mapping for Creative interest');
      console.log('   3. Verify photographer is in career database');
    }

  } catch (error) {
    console.error('❌ Test error:', error.response?.data || error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 SOLUTION: Start the backend server first:');
      console.log('   cd lantern-ai/backend && npm start');
    }
  }

  console.log('\n🏁 AI JSON Parsing Test Complete!');
}

// Run the test
testAIJSONParsing().catch(console.error);