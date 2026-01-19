const axios = require('axios');

// Test AI personalization improvements
async function testAIPersonalization() {
  console.log('🧪 Testing AI Recommendation Personalization');
  console.log('='.repeat(60));

  const baseUrl = 'https://lantern-ai.onrender.com';
  
  // Test data for a healthcare-interested student
  const testProfile = {
    interests: ['Healthcare', 'Community Impact'],
    skills: ['Communication', 'Empathy'],
    workEnvironment: 'indoor',
    teamPreference: 'team',
    educationGoal: 'associate',
    zipCode: '12345'
  };

  const testAnswers = [
    { questionId: 'interests', answer: 'Healthcare' },
    { questionId: 'work_environment', answer: 'Indoors' },
    { questionId: 'education', answer: 'associate' }
  ];

  const testCareerMatches = [
    {
      careerId: 'nurse',
      career: {
        id: 'nurse',
        title: 'Registered Nurse',
        sector: 'healthcare',
        description: 'Provide patient care and support',
        averageSalary: 65000,
        requiredEducation: 'associate',
        certifications: ['RN License', 'CPR Certification']
      },
      matchScore: 92,
      reasoningFactors: ['Strong interest in healthcare', 'Enjoys helping people'],
      localDemand: 'high'
    }
  ];

  try {
    // Test 1: Check if USE_REAL_AI is enabled
    console.log('\n1. Testing AI Configuration...');
    const envResponse = await axios.get(`${baseUrl}/api/debug/environment`);
    console.log('   USE_REAL_AI:', envResponse.data.USE_REAL_AI);
    console.log('   AI_PROVIDER:', envResponse.data.AI_PROVIDER);
    console.log('   OpenAI Key Present:', !!envResponse.data.OPENAI_API_KEY);

    // Test 2: Generate recommendations directly
    console.log('\n2. Testing AI Recommendation Generation...');
    const recommendationPayload = {
      profile: testProfile,
      answers: testAnswers,
      careerMatches: testCareerMatches,
      zipCode: '12345',
      currentGrade: 11
    };

    console.log('   Sending test data:', JSON.stringify(recommendationPayload, null, 2));

    const aiResponse = await axios.post(`${baseUrl}/api/test/ai-recommendations`, recommendationPayload);
    
    if (aiResponse.data.success) {
      const recommendations = aiResponse.data.data;
      
      console.log('\n✅ AI Recommendations Generated Successfully!');
      console.log('\n📚 Academic Plan:');
      console.log('   Current Year Courses:', recommendations.academicPlan?.currentYear?.length || 0);
      if (recommendations.academicPlan?.currentYear?.length > 0) {
        recommendations.academicPlan.currentYear.forEach((course, i) => {
          console.log(`   ${i + 1}. ${course.courseName} - ${course.description}`);
        });
      }

      console.log('\n🎯 Career Pathway:');
      if (recommendations.careerPathway?.steps) {
        recommendations.careerPathway.steps.slice(0, 3).forEach((step, i) => {
          console.log(`   ${i + 1}. ${step}`);
        });
      }

      console.log('\n🎓 Skill Gaps:');
      if (recommendations.skillGaps) {
        recommendations.skillGaps.forEach((skill, i) => {
          console.log(`   ${i + 1}. ${skill.skill} (${skill.importance}) - ${skill.howToAcquire}`);
        });
      }

      console.log('\n✅ Action Items:');
      if (recommendations.actionItems) {
        recommendations.actionItems.slice(0, 3).forEach((item, i) => {
          console.log(`   ${i + 1}. ${item.title} - ${item.description}`);
        });
      }

      console.log('\n💼 Local Jobs:', recommendations.localJobs?.length || 0, 'found');

      // Test personalization quality
      console.log('\n🔍 Personalization Quality Check:');
      
      // Check if recommendations mention specific interests
      const academicText = JSON.stringify(recommendations.academicPlan);
      const pathwayText = JSON.stringify(recommendations.careerPathway);
      const skillsText = JSON.stringify(recommendations.skillGaps);
      const actionsText = JSON.stringify(recommendations.actionItems);
      
      const allText = academicText + pathwayText + skillsText + actionsText;
      
      const healthcareReferences = (allText.match(/healthcare|medical|nurse|patient|hospital/gi) || []).length;
      const specificReferences = (allText.match(/Registered Nurse|Biology|Chemistry|Health Sciences/gi) || []).length;
      
      console.log('   Healthcare references:', healthcareReferences);
      console.log('   Specific career/course references:', specificReferences);
      
      if (healthcareReferences > 5 && specificReferences > 2) {
        console.log('   ✅ GOOD: Recommendations appear personalized for healthcare interest');
      } else {
        console.log('   ⚠️ WARNING: Recommendations may still be too generic');
        console.log('   Sample text:', allText.substring(0, 200) + '...');
      }

    } else {
      console.log('❌ AI Recommendation Generation Failed:', aiResponse.data.error);
    }

    // Test 3: Test fallback recommendations
    console.log('\n3. Testing Fallback Recommendations...');
    const fallbackPayload = {
      ...recommendationPayload,
      forceFallback: true
    };

    const fallbackResponse = await axios.post(`${baseUrl}/api/test/ai-recommendations`, fallbackPayload);
    
    if (fallbackResponse.data.success) {
      console.log('   ✅ Fallback recommendations generated successfully');
      const fallbackRecs = fallbackResponse.data.data;
      
      // Check if fallback is also personalized
      const fallbackText = JSON.stringify(fallbackRecs);
      const fallbackHealthcareRefs = (fallbackText.match(/healthcare|medical|nurse|Biology|Chemistry/gi) || []).length;
      
      console.log('   Fallback healthcare references:', fallbackHealthcareRefs);
      
      if (fallbackHealthcareRefs > 3) {
        console.log('   ✅ GOOD: Fallback recommendations are also personalized');
      } else {
        console.log('   ⚠️ WARNING: Fallback recommendations may be generic');
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }

  console.log('\n' + '='.repeat(60));
  console.log('🧪 AI Personalization Test Complete');
}

// Run the test
testAIPersonalization().catch(console.error);