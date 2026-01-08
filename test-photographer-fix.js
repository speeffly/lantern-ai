const axios = require('axios');

// Test the photographer personalization fix
async function testPhotographerFix() {
  console.log('📸 Testing Photographer Career Personalization Fix...\n');

  const photographerProfile = {
    interests: ['Creative', 'Technology'], // Mixed interests - should prioritize creative career
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

  console.log(`🎯 Testing Photographer with Mixed Interests (Creative + Technology)`);
  console.log(`Expected: Should get CREATIVE career recommendations, not technology`);
  console.log(`${'='.repeat(70)}`);

  try {
    console.log('📊 Student Profile:', JSON.stringify(photographerProfile, null, 2));
    console.log('📝 Assessment Answers:', JSON.stringify(photographerAnswers, null, 2));

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
      const recommendations = response.data.recommendations;
      
      console.log('\n✅ AI Recommendations Generated Successfully!');
      
      // Check career matches first
      if (response.data.careerMatches && response.data.careerMatches.length > 0) {
        console.log('\n🎯 CAREER MATCHES ANALYSIS:');
        console.log('-'.repeat(50));
        const topCareer = response.data.careerMatches[0];
        console.log(`Top Career: ${topCareer.career.title} (${topCareer.matchScore}% match)`);
        console.log(`Sector: ${topCareer.career.sector}`);
        
        if (topCareer.career.sector === 'creative') {
          console.log('✅ SUCCESS: Top career is in creative sector');
        } else {
          console.log(`❌ ISSUE: Top career is in ${topCareer.career.sector} sector, should be creative`);
        }
      }
      
      // Check skill gaps
      console.log('\n🎯 SKILL GAPS ANALYSIS:');
      console.log('-'.repeat(50));
      
      if (recommendations.skillGaps && recommendations.skillGaps.length > 0) {
        let hasCreativeSkills = false;
        let hasTechSkills = false;
        let hasGenericTechSkills = false;
        
        recommendations.skillGaps.forEach((gap, index) => {
          console.log(`${index + 1}. ${gap.skill} (${gap.importance})`);
          console.log(`   How to acquire: ${gap.howToAcquire?.substring(0, 100)}...`);
          
          // Check for creative skills
          if (gap.skill.includes('Creative') || gap.skill.includes('Visual') || gap.skill.includes('Design')) {
            hasCreativeSkills = true;
            console.log(`   ✅ Creative skill detected`);
          }
          
          // Check for appropriate tech skills for creative careers
          if (gap.skill.includes('Digital Media') || gap.skill.includes('Photo editing')) {
            hasTechSkills = true;
            console.log(`   ✅ Appropriate tech skill for creative career`);
          }
          
          // Check for inappropriate generic tech skills
          if (gap.skill.includes('Programming') && gap.howToAcquire?.includes('Python or JavaScript')) {
            hasGenericTechSkills = true;
            console.log(`   ❌ ISSUE: Generic programming skill detected for creative career`);
          }
        });
        
        if (hasCreativeSkills && !hasGenericTechSkills) {
          console.log('\n✅ SUCCESS: Skill gaps are appropriate for creative career');
        } else if (hasGenericTechSkills) {
          console.log('\n❌ ISSUE: Generic tech skills found for creative career');
        } else {
          console.log('\n⚠️  WARNING: No clear creative skills found');
        }
      }

      // Check action items
      console.log('\n📋 ACTION ITEMS ANALYSIS:');
      console.log('-'.repeat(50));
      
      if (recommendations.actionItems && recommendations.actionItems.length > 0) {
        let hasCreativeActions = false;
        let hasTechActions = false;
        let hasGenericTechActions = false;
        
        recommendations.actionItems.forEach((action, index) => {
          console.log(`${index + 1}. ${action.title}`);
          console.log(`   Description: ${action.description?.substring(0, 100)}...`);
          
          // Check for creative actions
          if (action.title.includes('portfolio') || action.title.includes('art') || 
              action.title.includes('creative') || action.title.includes('photography')) {
            hasCreativeActions = true;
            console.log(`   ✅ Creative action detected`);
          }
          
          // Check for inappropriate tech actions
          if (action.title.includes('programming') || action.title.includes('IT Support') ||
              action.description?.includes('Python or JavaScript')) {
            hasGenericTechActions = true;
            console.log(`   ❌ ISSUE: Generic tech action detected for creative career`);
          }
          
          // Check for appropriate tech actions for creative careers
          if (action.title.includes('digital') && action.description?.includes('creative')) {
            hasTechActions = true;
            console.log(`   ✅ Appropriate tech action for creative career`);
          }
        });
        
        if (hasCreativeActions && !hasGenericTechActions) {
          console.log('\n✅ SUCCESS: Action items are appropriate for creative career');
        } else if (hasGenericTechActions) {
          console.log('\n❌ ISSUE: Generic tech actions found for creative career');
        } else {
          console.log('\n⚠️  WARNING: No clear creative actions found');
        }
      }

      // Overall assessment
      console.log('\n📊 OVERALL ASSESSMENT:');
      console.log('='.repeat(50));
      
      const topCareer = response.data.careerMatches?.[0];
      const isCreativeSector = topCareer?.career?.sector === 'creative';
      const hasAppropriateSkills = recommendations.skillGaps?.some(gap => 
        gap.skill.includes('Creative') || gap.skill.includes('Visual') || gap.skill.includes('Design')
      );
      const hasAppropriateActions = recommendations.actionItems?.some(action => 
        action.title.includes('portfolio') || action.title.includes('art') || action.title.includes('creative')
      );
      const hasInappropriateTechContent = 
        recommendations.skillGaps?.some(gap => gap.skill.includes('Programming') && gap.howToAcquire?.includes('Python')) ||
        recommendations.actionItems?.some(action => action.title.includes('programming') || action.title.includes('IT Support'));
      
      if (isCreativeSector && hasAppropriateSkills && hasAppropriateActions && !hasInappropriateTechContent) {
        console.log('🎉 PHOTOGRAPHER FIX SUCCESSFUL!');
        console.log('✅ Top career is in creative sector');
        console.log('✅ Skill gaps are creative-focused');
        console.log('✅ Action items are creative-focused');
        console.log('✅ No inappropriate tech recommendations');
      } else {
        console.log('❌ PHOTOGRAPHER FIX NEEDS MORE WORK:');
        if (!isCreativeSector) console.log('- Top career is not in creative sector');
        if (!hasAppropriateSkills) console.log('- Missing creative skill recommendations');
        if (!hasAppropriateActions) console.log('- Missing creative action items');
        if (hasInappropriateTechContent) console.log('- Still has inappropriate tech recommendations');
      }

    } else {
      console.log('❌ Test failed:', response.data.error);
    }

  } catch (error) {
    console.error('❌ Test error:', error.response?.data || error.message);
  }

  console.log('\n🏁 Photographer Personalization Test Complete!');
}

// Run the test
testPhotographerFix().catch(console.error);