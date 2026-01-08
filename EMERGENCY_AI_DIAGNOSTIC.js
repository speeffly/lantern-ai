const axios = require('axios');

// Emergency diagnostic to identify why AI is falling back
async function emergencyAIDiagnostic() {
  console.log('🚨 EMERGENCY AI DIAGNOSTIC');
  console.log('='.repeat(50));
  console.log('This script will identify why the system is using fallback recommendations');
  console.log('instead of real AI despite USE_REAL_AI=true\n');

  const baseURL = process.env.NODE_ENV === 'production' 
    ? 'https://lantern-ai-backend.onrender.com'
    : 'http://localhost:3001';

  const photographerProfile = {
    interests: ['Creative'],
    skills: ['Creativity'],
    workEnvironment: 'Mixed',
    educationGoal: 'associate'
  };

  const photographerAnswers = [
    { questionId: 'interests', answer: 'Creative' }
  ];

  try {
    console.log('🔍 STEP 1: Testing API Response...');
    
    const response = await axios.post(`${baseURL}/api/test-ai`, {
      profile: photographerProfile,
      answers: photographerAnswers,
      zipCode: '12345',
      currentGrade: 11
    }, {
      timeout: 120000, // 2 minutes
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.data.success) {
      console.log('❌ API call failed:', response.data.error);
      return;
    }

    console.log('✅ API call succeeded\n');

    // STEP 2: Analyze career matches
    console.log('🔍 STEP 2: Analyzing Career Matches...');
    const careerMatches = response.data.careerMatches;
    
    if (!careerMatches || careerMatches.length === 0) {
      console.log('❌ CRITICAL: No career matches found!');
      return;
    }

    const topCareer = careerMatches[0];
    console.log(`Top Career: ${topCareer.career.title} (${topCareer.career.sector} sector)`);
    console.log(`Match Score: ${topCareer.matchScore}%`);

    const photographerMatch = careerMatches.find(m => m.career.title === 'Photographer');
    if (photographerMatch) {
      const photographerRank = careerMatches.findIndex(m => m.career.title === 'Photographer') + 1;
      console.log(`Photographer Rank: #${photographerRank} (${photographerMatch.matchScore}% match)`);
      
      if (photographerRank === 1) {
        console.log('✅ Career matching is working correctly');
      } else {
        console.log('⚠️  Career matching may need adjustment');
      }
    } else {
      console.log('❌ CRITICAL: Photographer not found in matches!');
    }

    // STEP 3: Analyze recommendation type
    console.log('\n🔍 STEP 3: Analyzing Recommendation Type...');
    const recommendations = response.data.recommendations;
    
    if (!recommendations) {
      console.log('❌ CRITICAL: No recommendations found!');
      return;
    }

    // Check career pathway for fallback indicators
    const careerPathway = recommendations.careerPathway;
    if (careerPathway && careerPathway.steps) {
      console.log('Career Pathway Steps:');
      careerPathway.steps.forEach((step, index) => {
        console.log(`  ${index + 1}. ${step}`);
      });

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
        console.log('\n❌ CONFIRMED: Using FALLBACK recommendations');
        console.log('   The system is NOT using real AI despite USE_REAL_AI=true');
      } else {
        console.log('\n✅ Using AI-generated recommendations');
      }

      // Check timeline
      console.log(`\nTimeline: ${careerPathway.timeline}`);
      if (careerPathway.timeline === '2-4 years') {
        console.log('⚠️  Generic timeline detected (fallback indicator)');
      }
    }

    // STEP 4: Analyze skill gaps
    console.log('\n🔍 STEP 4: Analyzing Skill Gaps...');
    const skillGaps = recommendations.skillGaps;
    
    if (skillGaps && skillGaps.length > 0) {
      console.log('Skill Gaps:');
      skillGaps.forEach((gap, index) => {
        console.log(`  ${index + 1}. ${gap.skill} (${gap.importance})`);
        console.log(`     ${gap.howToAcquire?.substring(0, 80)}...`);
      });

      // Check for inappropriate tech skills
      const hasProgrammingSkills = skillGaps.some(gap => 
        gap.skill.includes('Programming') && gap.howToAcquire?.includes('Python or JavaScript')
      );

      if (hasProgrammingSkills) {
        console.log('\n❌ INAPPROPRIATE: Programming skills found for creative profile');
        console.log('   This confirms fallback logic is being used');
      }

      const hasCreativeSkills = skillGaps.some(gap => 
        gap.skill.includes('Creative') || gap.skill.includes('Visual') || gap.skill.includes('Design')
      );

      if (hasCreativeSkills) {
        console.log('\n✅ Creative skills found (appropriate for profile)');
      }
    }

    // STEP 5: Analyze action items
    console.log('\n🔍 STEP 5: Analyzing Action Items...');
    const actionItems = recommendations.actionItems;
    
    if (actionItems && actionItems.length > 0) {
      console.log('Action Items:');
      actionItems.forEach((item, index) => {
        console.log(`  ${index + 1}. ${item.title}`);
        console.log(`     ${item.description?.substring(0, 80)}...`);
      });

      // Check for IT Support Specialist references
      const hasITReferences = actionItems.some(item => 
        item.title?.includes('IT Support Specialist') || 
        item.description?.includes('IT Support Specialist')
      );

      if (hasITReferences) {
        console.log('\n❌ CRITICAL: IT Support Specialist references found');
        console.log('   This indicates wrong career matching or fallback logic');
      }

      const hasCreativeActions = actionItems.some(item =>
        item.title?.includes('portfolio') || 
        item.title?.includes('art') || 
        item.title?.includes('creative')
      );

      if (hasCreativeActions) {
        console.log('\n✅ Creative actions found (appropriate for profile)');
      }
    }

    // STEP 6: Final diagnosis
    console.log('\n🏥 FINAL DIAGNOSIS:');
    console.log('='.repeat(50));

    const usingFallback = careerPathway?.steps?.some(step => 
      step.includes('Complete high school with strong grades') ||
      step.includes('Pursue relevant training or education')
    );

    const hasWrongCareer = actionItems?.some(item => 
      item.title?.includes('IT Support Specialist')
    );

    const hasWrongSkills = skillGaps?.some(gap => 
      gap.skill.includes('Programming') && gap.howToAcquire?.includes('Python')
    );

    if (usingFallback) {
      console.log('❌ PRIMARY ISSUE: System is using FALLBACK recommendations');
      console.log('\n🔧 POSSIBLE CAUSES:');
      console.log('   1. USE_REAL_AI environment variable is not "true" on the server');
      console.log('   2. AI API key is missing, invalid, or expired');
      console.log('   3. AI API calls are failing due to rate limits or network issues');
      console.log('   4. AI response parsing is failing, triggering fallback');
      
      console.log('\n💡 IMMEDIATE SOLUTIONS:');
      console.log('   1. Check server environment variables (USE_REAL_AI, AI_PROVIDER, API keys)');
      console.log('   2. Check server logs for AI API errors');
      console.log('   3. Verify API key validity and credits/quota');
      console.log('   4. Test AI API directly outside the application');
    } else if (hasWrongCareer || hasWrongSkills) {
      console.log('❌ SECONDARY ISSUE: AI is working but generating wrong content');
      console.log('\n🔧 POSSIBLE CAUSES:');
      console.log('   1. Career matching algorithm is incorrect');
      console.log('   2. AI prompts need further enhancement');
      console.log('   3. Student profile is not being passed correctly to AI');
      
      console.log('\n💡 IMMEDIATE SOLUTIONS:');
      console.log('   1. Debug career matching algorithm');
      console.log('   2. Enhance AI prompts with more specific instructions');
      console.log('   3. Verify student profile data integrity');
    } else {
      console.log('✅ SYSTEM APPEARS TO BE WORKING CORRECTLY');
      console.log('   The issue may be intermittent or profile-specific');
    }

  } catch (error) {
    console.error('❌ DIAGNOSTIC ERROR:', error.response?.data || error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 SOLUTION: Backend server is not running');
      console.log('   Start the server: cd lantern-ai/backend && npm start');
    } else if (error.message.includes('timeout')) {
      console.log('\n💡 SOLUTION: Request timed out');
      console.log('   This could indicate AI API issues or server overload');
    }
  }

  console.log('\n🏁 Emergency Diagnostic Complete!');
}

// Run the diagnostic
emergencyAIDiagnostic().catch(console.error);