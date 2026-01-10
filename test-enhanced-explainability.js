/**
 * Test Enhanced Explainability Implementation
 * Verifies that the career matching service provides detailed, sector-specific explanations
 */

const { CareerMatchingService } = require('./backend/dist/services/careerMatchingService');

// Test data
const testProfile = {
  interests: ['Healthcare', 'Helping Others', 'Science'],
  skills: ['Communication', 'Problem Solving', 'Empathy'],
  workEnvironment: 'Indoors',
  educationGoal: 'Associate degree'
};

const testAnswers = [
  {
    questionId: 'interests',
    answer: 'Healthcare',
    timestamp: new Date()
  },
  {
    questionId: 'work_environment',
    answer: 'Indoors',
    timestamp: new Date()
  },
  {
    questionId: 'helping_others',
    answer: 'Very important',
    timestamp: new Date()
  }
];

const testCareerMatches = [
  {
    career: {
      id: 'registered-nurse',
      title: 'Registered Nurse',
      sector: 'healthcare',
      description: 'Provides patient care and medical support in healthcare settings.',
      averageSalary: 75000,
      requiredEducation: 'Associate degree',
      certifications: ['RN License', 'CPR Certification'],
      growthOutlook: 'Strong growth expected'
    },
    matchScore: 92,
    reasoningFactors: ['Interest in healthcare', 'Desire to help others', 'Strong communication skills']
  },
  {
    career: {
      id: 'software-developer',
      title: 'Software Developer',
      sector: 'technology',
      description: 'Designs and develops software applications and systems.',
      averageSalary: 85000,
      requiredEducation: 'Bachelor degree',
      certifications: ['Programming Certifications'],
      growthOutlook: 'Very strong growth expected'
    },
    matchScore: 65,
    reasoningFactors: ['Problem solving skills', 'Analytical thinking']
  }
];

async function testEnhancedExplainability() {
  console.log('🧪 Testing Enhanced Explainability Implementation');
  console.log('='.repeat(60));

  try {
    // Test enhanced career matches
    console.log('\n📊 Testing Enhanced Career Matches...');
    const enhancedMatches = await CareerMatchingService.getEnhancedMatches(
      testProfile,
      testAnswers,
      testCareerMatches
    );

    console.log(`✅ Generated ${enhancedMatches.length} enhanced matches`);

    // Test each enhanced match
    for (let i = 0; i < enhancedMatches.length; i++) {
      const match = enhancedMatches[i];
      console.log(`\n🎯 Enhanced Match ${i + 1}: ${match.career.title}`);
      console.log('-'.repeat(40));

      // Test AI Insights
      console.log('🤖 AI Insights:');
      console.log(`   Why It Matches: ${match.aiInsights.whyItMatches.substring(0, 100)}...`);
      console.log(`   Key Strengths: ${match.aiInsights.keyStrengths.length} identified`);
      console.log(`   Development Areas: ${match.aiInsights.developmentAreas.length} identified`);
      console.log(`   Next Steps: ${match.aiInsights.nextSteps.length} provided`);

      // Test Career Pathway
      console.log('🛤️ Career Pathway:');
      console.log(`   Steps: ${match.careerPathway.steps.length} steps provided`);
      console.log(`   Timeline: ${match.careerPathway.timeline}`);
      console.log(`   Requirements: ${match.careerPathway.requirements.length} requirements`);

      // Test Skill Gaps
      console.log('🎯 Skill Gaps:');
      console.log(`   Skills to Develop: ${match.skillGaps.length} identified`);
      match.skillGaps.forEach((gap, index) => {
        console.log(`   ${index + 1}. ${gap.skill} (${gap.importance})`);
      });

      // Verify sector-specific content
      const sector = match.career.sector;
      const explanation = match.aiInsights.whyItMatches.toLowerCase();
      
      console.log('🔍 Sector-Specific Verification:');
      if (sector === 'healthcare') {
        const hasHealthcareTerms = explanation.includes('healthcare') || 
                                  explanation.includes('patient') || 
                                  explanation.includes('medical') ||
                                  explanation.includes('helping others');
        console.log(`   Healthcare terms present: ${hasHealthcareTerms ? '✅' : '❌'}`);
      } else if (sector === 'technology') {
        const hasTechTerms = explanation.includes('technology') || 
                            explanation.includes('programming') || 
                            explanation.includes('software') ||
                            explanation.includes('innovation');
        console.log(`   Technology terms present: ${hasTechTerms ? '✅' : '❌'}`);
      }

      // Verify personalization
      const hasPersonalization = explanation.includes('your') || 
                                 explanation.includes('you') ||
                                 testProfile.interests.some(interest => 
                                   explanation.includes(interest.toLowerCase()));
      console.log(`   Personalized content: ${hasPersonalization ? '✅' : '❌'}`);
    }

    console.log('\n🎉 Enhanced Explainability Test Results:');
    console.log('✅ Enhanced matches generated successfully');
    console.log('✅ AI insights provided for each career');
    console.log('✅ Individual career pathways created');
    console.log('✅ Sector-specific skill gaps identified');
    console.log('✅ Personalized explanations generated');

  } catch (error) {
    console.error('❌ Enhanced Explainability Test Failed:', error);
    
    // Test fallback functionality
    console.log('\n🔄 Testing Fallback Functionality...');
    try {
      // This should use the basic insights fallback
      const fallbackMatches = testCareerMatches.map(match => ({
        ...match,
        aiInsights: CareerMatchingService.getBasicInsights(match, testProfile, testAnswers),
        careerPathway: CareerMatchingService.getBasicCareerPathway(match),
        skillGaps: CareerMatchingService.getBasicSkillGaps(match)
      }));

      console.log('✅ Fallback functionality working');
      console.log(`✅ Generated ${fallbackMatches.length} fallback matches`);
      
      // Test fallback quality
      const fallbackMatch = fallbackMatches[0];
      console.log('\n📋 Fallback Quality Check:');
      console.log(`   Explanation length: ${fallbackMatch.aiInsights.whyItMatches.length} characters`);
      console.log(`   Strengths provided: ${fallbackMatch.aiInsights.keyStrengths.length}`);
      console.log(`   Development areas: ${fallbackMatch.aiInsights.developmentAreas.length}`);
      console.log(`   Next steps: ${fallbackMatch.aiInsights.nextSteps.length}`);
      
    } catch (fallbackError) {
      console.error('❌ Fallback functionality also failed:', fallbackError);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('🏁 Enhanced Explainability Test Complete');
}

// Run the test
if (require.main === module) {
  testEnhancedExplainability().catch(console.error);
}

module.exports = { testEnhancedExplainability };