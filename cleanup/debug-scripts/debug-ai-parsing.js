const axios = require('axios');

// Debug AI response parsing specifically
async function debugAIParsing() {
  console.log('🔍 Debugging AI Response Parsing for Career Pathways...\n');

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
    : 'http://localhost:3001';

  console.log(`🎯 Testing AI Response Parsing with Photographer Profile`);
  console.log(`Goal: Identify if AI generates content but parsing fails`);
  console.log(`${'='.repeat(70)}`);

  try {
    console.log('📊 Student Profile:', JSON.stringify(photographerProfile, null, 2));

    console.log('\n🚀 Making AI API call with detailed logging...');
    const startTime = Date.now();

    const response = await axios.post(`${baseURL}/api/test-ai`, {
      profile: photographerProfile,
      answers: photographerAnswers,
      zipCode: '12345',
      currentGrade: 11,
      debug: true // Request debug info if available
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

    // STEP 1: Check career matches
    console.log('\n🔍 STEP 1: Career Matching Analysis');
    console.log('-'.repeat(50));
    
    const careerMatches = response.data.careerMatches;
    if (!careerMatches || careerMatches.length === 0) {
      console.log('❌ CRITICAL: No career matches found!');
      console.log('   This explains why career pathway is generic');
      return;
    }

    const topCareer = careerMatches[0];
    console.log(`✅ Top Career Found: ${topCareer.career.title}`);
    console.log(`   Sector: ${topCareer.career.sector}`);
    console.log(`   Match Score: ${topCareer.matchScore}%`);
    console.log(`   Required Education: ${topCareer.career.requiredEducation}`);

    const photographerMatch = careerMatches.find(m => m.career.title === 'Photographer');
    if (photographerMatch) {
      const rank = careerMatches.findIndex(m => m.career.title === 'Photographer') + 1;
      console.log(`✅ Photographer Found: Rank #${rank} (${photographerMatch.matchScore}% match)`);
      
      if (rank === 1) {
        console.log('✅ Career matching is working correctly');
      } else {
        console.log('⚠️  Photographer should be ranked higher');
      }
    } else {
      console.log('❌ CRITICAL: Photographer not found in career matches');
    }

    // STEP 2: Analyze AI-generated content
    console.log('\n🔍 STEP 2: AI Response Analysis');
    console.log('-'.repeat(50));
    
    const recommendations = response.data.recommendations;
    if (!recommendations) {
      console.log('❌ CRITICAL: No recommendations found');
      return;
    }

    // Check if we can access raw AI response (if debug info is available)
    if (response.data.debug && response.data.debug.rawAIResponse) {
      console.log('🤖 RAW AI RESPONSE DETECTED:');
      console.log('Length:', response.data.debug.rawAIResponse.length, 'characters');
      console.log('Preview:', response.data.debug.rawAIResponse.substring(0, 500) + '...');
      
      // Try to find career pathway in raw response
      if (response.data.debug.rawAIResponse.includes('careerPathway')) {
        console.log('✅ AI generated careerPathway content');
        
        // Extract career pathway section
        const careerPathwayMatch = response.data.debug.rawAIResponse.match(/"careerPathway"\s*:\s*\{[^}]*(?:\{[^}]*\}[^}]*)*\}/);
        if (careerPathwayMatch) {
          console.log('✅ Career pathway structure found in AI response');
          console.log('Career pathway content:', careerPathwayMatch[0].substring(0, 200) + '...');
        } else {
          console.log('❌ Career pathway structure malformed in AI response');
        }
      } else {
        console.log('❌ AI did not generate careerPathway content');
      }
    } else {
      console.log('⚠️  Raw AI response not available (no debug info)');
    }

    // STEP 3: Check final career pathway
    console.log('\n🔍 STEP 3: Final Career Pathway Analysis');
    console.log('-'.repeat(50));
    
    const careerPathway = recommendations.careerPathway;
    if (!careerPathway || !careerPathway.steps) {
      console.log('❌ CRITICAL: No career pathway in final recommendations');
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
      console.log('   This means either:');
      console.log('   1. AI JSON parsing failed');
      console.log('   2. AI did not generate career pathway content');
      console.log('   3. Career matching failed (no topCareer)');
    } else {
      console.log('\n✅ Using AI-generated career pathway');
    }

    // STEP 4: Check other AI components
    console.log('\n🔍 STEP 4: Other AI Components Analysis');
    console.log('-'.repeat(50));
    
    // Check academic plan
    if (recommendations.academicPlan && recommendations.academicPlan.currentYear) {
      console.log(`Academic Plan Courses: ${recommendations.academicPlan.currentYear.length}`);
      if (recommendations.academicPlan.currentYear.length > 0) {
        console.log('✅ AI generated academic plan content');
        console.log('Sample course:', recommendations.academicPlan.currentYear[0].courseName);
      } else {
        console.log('⚠️  Academic plan is empty');
      }
    }

    // Check skill gaps
    if (recommendations.skillGaps && recommendations.skillGaps.length > 0) {
      console.log(`Skill Gaps: ${recommendations.skillGaps.length}`);
      console.log('Sample skill:', recommendations.skillGaps[0].skill);
      
      // Check if skill gaps are appropriate
      const hasCreativeSkills = recommendations.skillGaps.some(gap => 
        gap.skill.includes('Creative') || gap.skill.includes('Visual') || gap.skill.includes('Design')
      );
      
      const hasProgrammingSkills = recommendations.skillGaps.some(gap => 
        gap.skill.includes('Programming') && gap.howToAcquire?.includes('Python')
      );
      
      if (hasCreativeSkills) {
        console.log('✅ Creative skills found (appropriate)');
      }
      
      if (hasProgrammingSkills) {
        console.log('❌ Programming skills found (inappropriate for photographer)');
      }
    }

    // STEP 5: Final diagnosis
    console.log('\n🏥 FINAL DIAGNOSIS:');
    console.log('='.repeat(50));

    if (topCareer && topCareer.career.title === 'Photographer') {
      console.log('✅ Career matching is working correctly');
      
      if (hasFallbackContent) {
        console.log('❌ PRIMARY ISSUE: AI parsing is failing');
        console.log('   The AI is being called but the response is not being parsed correctly');
        console.log('   This causes fallback to generic career pathway steps');
        
        console.log('\n🔧 SOLUTIONS:');
        console.log('   1. Check server logs for JSON parsing errors');
        console.log('   2. Improve AI response cleaning/fixing logic');
        console.log('   3. Add more robust JSON extraction methods');
        console.log('   4. Enhance AI prompts to generate cleaner JSON');
      } else {
        console.log('✅ AI parsing is working correctly');
      }
    } else {
      console.log('❌ PRIMARY ISSUE: Career matching is incorrect');
      console.log('   This causes wrong career to be used in AI prompts');
      
      console.log('\n🔧 SOLUTIONS:');
      console.log('   1. Debug career matching algorithm');
      console.log('   2. Check interest-to-career mapping');
      console.log('   3. Verify career database integrity');
    }

  } catch (error) {
    console.error('❌ Debug error:', error.response?.data || error.message);
  }

  console.log('\n🏁 AI Parsing Debug Complete!');
}

// Run the debug
debugAIParsing().catch(console.error);