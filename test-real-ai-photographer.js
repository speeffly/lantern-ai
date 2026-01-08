const axios = require('axios');

// Test the real AI with photographer profile
async function testRealAIPhotographer() {
  console.log('🤖 Testing Real AI with Photographer Profile...\n');
  console.log('⚠️  Note: This test requires USE_REAL_AI=true and valid API keys\n');

  const photographerProfile = {
    interests: ['Creative', 'Technology'], // Mixed interests to test prioritization
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

  console.log(`🎯 Testing Real AI with Photographer (Creative + Technology interests)`);
  console.log(`Expected: AI should generate SPECIFIC career pathways, not generic steps`);
  console.log(`${'='.repeat(80)}`);

  try {
    console.log('📊 Student Profile:', JSON.stringify(photographerProfile, null, 2));
    console.log('📝 Assessment Answers:', JSON.stringify(photographerAnswers, null, 2));

    console.log('\n🚀 Calling Real AI API...');
    const startTime = Date.now();

    const response = await axios.post(`${baseURL}/api/test-ai`, {
      profile: photographerProfile,
      answers: photographerAnswers,
      zipCode: '12345',
      currentGrade: 11
    }, {
      timeout: 120000, // 2 minutes for AI processing
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const endTime = Date.now();
    console.log(`⏱️  AI Response Time: ${(endTime - startTime) / 1000}s`);

    if (response.data.success) {
      const recommendations = response.data.recommendations;
      
      console.log('\n✅ Real AI Recommendations Generated Successfully!');
      
      // Check career matches first
      if (response.data.careerMatches && response.data.careerMatches.length > 0) {
        console.log('\n🎯 CAREER MATCHES ANALYSIS:');
        console.log('-'.repeat(50));
        const topCareer = response.data.careerMatches[0];
        console.log(`Top Career: ${topCareer.career.title} (${topCareer.matchScore}% match)`);
        console.log(`Sector: ${topCareer.career.sector}`);
        console.log(`Education Required: ${topCareer.career.requiredEducation}`);
        console.log(`Average Salary: $${topCareer.career.averageSalary.toLocaleString()}`);
        
        if (topCareer.career.sector === 'creative') {
          console.log('✅ SUCCESS: Top career is in creative sector');
        } else {
          console.log(`❌ ISSUE: Top career is in ${topCareer.career.sector} sector, should be creative`);
        }
      }
      
      // Check AI-generated career pathway (most important test)
      console.log('\n🛤️  AI-GENERATED CAREER PATHWAY ANALYSIS:');
      console.log('-'.repeat(50));
      
      if (recommendations.careerPathway && recommendations.careerPathway.steps) {
        console.log('📋 Career Pathway Steps:');
        let hasSpecificSteps = true;
        let hasGenericSteps = false;
        
        recommendations.careerPathway.steps.forEach((step, index) => {
          console.log(`   ${index + 1}. ${step}`);
          
          // Check for generic content that indicates AI prompt failure
          if (step.includes('Step ') || step.includes('[SPECIFIC') || step.includes('generic')) {
            hasGenericSteps = true;
            console.log(`   ❌ GENERIC CONTENT: Step ${index + 1} contains placeholder or generic text`);
          } else if (step.toLowerCase().includes('photographer') || 
                     step.toLowerCase().includes('creative') || 
                     step.toLowerCase().includes('portfolio') ||
                     step.toLowerCase().includes('art') ||
                     step.toLowerCase().includes('design')) {
            console.log(`   ✅ SPECIFIC CONTENT: Step ${index + 1} is photographer/creative-specific`);
          } else {
            console.log(`   ⚠️  UNCLEAR: Step ${index + 1} may be generic`);
            hasSpecificSteps = false;
          }
        });
        
        console.log(`\n⏱️  Timeline: ${recommendations.careerPathway.timeline || 'Not specified'}`);
        console.log(`📋 Requirements: ${recommendations.careerPathway.requirements?.join(', ') || 'Not specified'}`);
        
        // Overall career pathway assessment
        if (!hasGenericSteps && hasSpecificSteps) {
          console.log('\n🎉 AI CAREER PATHWAY SUCCESS: Specific, personalized steps generated');
        } else if (hasGenericSteps) {
          console.log('\n❌ AI CAREER PATHWAY ISSUE: Generic placeholder content detected');
        } else {
          console.log('\n⚠️  AI CAREER PATHWAY WARNING: Steps may not be specific enough');
        }
      } else {
        console.log('❌ No career pathway found in AI response');
      }

      // Check AI-generated academic plan
      if (recommendations.academicPlan && recommendations.academicPlan.currentYear) {
        console.log('\n📚 AI-GENERATED ACADEMIC PLAN ANALYSIS:');
        console.log('-'.repeat(50));
        console.log(`Current Year Courses: ${recommendations.academicPlan.currentYear.length}`);
        
        let hasCreativeCourses = false;
        let hasInappropriateTechCourses = false;
        
        recommendations.academicPlan.currentYear.forEach((course, index) => {
          console.log(`   ${index + 1}. ${course.courseName}`);
          console.log(`      Reasoning: ${course.reasoning?.substring(0, 100)}...`);
          
          // Check for creative-appropriate courses
          if (course.courseName?.toLowerCase().includes('art') || 
              course.courseName?.toLowerCase().includes('design') ||
              course.courseName?.toLowerCase().includes('visual') ||
              course.courseName?.toLowerCase().includes('creative')) {
            hasCreativeCourses = true;
            console.log(`      ✅ Creative course detected`);
          }
          
          // Check for inappropriate tech courses
          if (course.courseName?.toLowerCase().includes('programming') ||
              course.courseName?.toLowerCase().includes('computer science') ||
              course.reasoning?.includes('Python or JavaScript')) {
            hasInappropriateTechCourses = true;
            console.log(`      ❌ ISSUE: Inappropriate tech course for photographer`);
          }
          
          // Check for career-specific reasoning
          if (course.reasoning && (
              course.reasoning.includes('photographer') ||
              course.reasoning.includes('creative') ||
              course.reasoning.includes('visual') ||
              course.reasoning.includes('art')
          )) {
            console.log(`      ✅ Career-specific reasoning detected`);
          } else {
            console.log(`      ⚠️  Generic reasoning detected`);
          }
        });
        
        if (hasCreativeCourses && !hasInappropriateTechCourses) {
          console.log('\n✅ AI ACADEMIC PLAN SUCCESS: Creative-focused courses recommended');
        } else if (hasInappropriateTechCourses) {
          console.log('\n❌ AI ACADEMIC PLAN ISSUE: Inappropriate tech courses recommended');
        } else {
          console.log('\n⚠️  AI ACADEMIC PLAN WARNING: May not be creative-focused enough');
        }
      }

      // Check AI-generated skill gaps
      if (recommendations.skillGaps && recommendations.skillGaps.length > 0) {
        console.log('\n🎯 AI-GENERATED SKILL GAPS ANALYSIS:');
        console.log('-'.repeat(50));
        
        let hasCreativeSkills = false;
        let hasInappropriateTechSkills = false;
        
        recommendations.skillGaps.forEach((gap, index) => {
          console.log(`   ${index + 1}. ${gap.skill} (${gap.importance})`);
          console.log(`      How to acquire: ${gap.howToAcquire?.substring(0, 100)}...`);
          
          // Check for creative skills
          if (gap.skill.includes('Creative') || gap.skill.includes('Visual') || 
              gap.skill.includes('Design') || gap.skill.includes('Artistic')) {
            hasCreativeSkills = true;
            console.log(`      ✅ Creative skill detected`);
          }
          
          // Check for inappropriate tech skills
          if (gap.skill.includes('Programming') && gap.howToAcquire?.includes('Python or JavaScript')) {
            hasInappropriateTechSkills = true;
            console.log(`      ❌ ISSUE: Generic programming skill for photographer`);
          }
          
          // Check for appropriate tech skills for creative careers
          if (gap.skill.includes('Digital Media') || gap.skill.includes('Photo editing')) {
            console.log(`      ✅ Appropriate tech skill for creative career`);
          }
        });
        
        if (hasCreativeSkills && !hasInappropriateTechSkills) {
          console.log('\n✅ AI SKILL GAPS SUCCESS: Creative-focused skills recommended');
        } else if (hasInappropriateTechSkills) {
          console.log('\n❌ AI SKILL GAPS ISSUE: Inappropriate tech skills recommended');
        } else {
          console.log('\n⚠️  AI SKILL GAPS WARNING: May not be creative-focused enough');
        }
      }

      // Overall AI assessment
      console.log('\n📊 OVERALL REAL AI ASSESSMENT:');
      console.log('='.repeat(50));
      
      const topCareer = response.data.careerMatches?.[0];
      const isCreativeSector = topCareer?.career?.sector === 'creative';
      const hasSpecificCareerPathway = recommendations.careerPathway?.steps?.some(step => 
        !step.includes('Step ') && !step.includes('[SPECIFIC') && 
        (step.toLowerCase().includes('photographer') || step.toLowerCase().includes('creative'))
      );
      const hasAppropriateContent = !recommendations.skillGaps?.some(gap => 
        gap.skill.includes('Programming') && gap.howToAcquire?.includes('Python')
      );
      
      if (isCreativeSector && hasSpecificCareerPathway && hasAppropriateContent) {
        console.log('🎉 REAL AI SUCCESS! All systems working correctly:');
        console.log('✅ Career matching identifies creative sector');
        console.log('✅ AI generates specific, personalized career pathways');
        console.log('✅ AI provides appropriate creative recommendations');
        console.log('✅ No inappropriate tech content for photographers');
      } else {
        console.log('⚠️  REAL AI NEEDS IMPROVEMENT:');
        if (!isCreativeSector) console.log('- Career matching not identifying creative sector');
        if (!hasSpecificCareerPathway) console.log('- AI generating generic career pathways');
        if (!hasAppropriateContent) console.log('- AI providing inappropriate tech recommendations');
      }

    } else {
      console.log('❌ Test failed:', response.data.error);
      
      if (response.data.error?.includes('API key')) {
        console.log('\n💡 SOLUTION: Check your AI API key configuration:');
        console.log('   - Ensure OPENAI_API_KEY or GEMINI_API_KEY is set');
        console.log('   - Verify the API key is valid and has sufficient credits');
        console.log('   - Check AI_PROVIDER environment variable (openai/gemini)');
      }
    }

  } catch (error) {
    console.error('❌ Test error:', error.response?.data || error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 SOLUTION: Start the backend server first:');
      console.log('   cd lantern-ai/backend && npm start');
    } else if (error.message.includes('timeout')) {
      console.log('\n💡 SOLUTION: AI processing took too long. This could indicate:');
      console.log('   - API rate limiting');
      console.log('   - Complex prompt processing');
      console.log('   - Network issues');
    }
  }

  console.log('\n🏁 Real AI Photographer Test Complete!');
  console.log('\nKey Success Indicators:');
  console.log('✅ Career pathway steps mention specific careers (not "Step 1", "Step 2")');
  console.log('✅ Academic courses are creative-focused (Art, Design, Visual Arts)');
  console.log('✅ Skill gaps are creative-appropriate (not Programming/JavaScript)');
  console.log('✅ No placeholder text like [SPECIFIC CAREER TITLE] remains');
}

// Run the test
testRealAIPhotographer().catch(console.error);