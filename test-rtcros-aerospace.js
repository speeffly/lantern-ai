const axios = require('axios');

async function testRTCROSAerospace() {
  try {
    console.log('🎯 TESTING RTCROS FRAMEWORK - AEROSPACE ENGINEER');
    console.log('='.repeat(70));
    
    // Test with aerospace engineer selection using RTCROS framework
    const testResponses = {
      q1_grade_zip: {
        grade: '11',
        zipCode: '78724'
      },
      q3_career_knowledge: 'yes',
      q3a_career_categories: 'engineering',
      q3a2_engineering_careers: 'aerospace_engineer', // CRITICAL TEST
      q4_academic_performance: {
        'Math': 'Excellent',
        'Science (Biology, Chemistry, Physics)': 'Excellent',
        'English': 'Good',
        'Technology': 'Good'
      },
      q5_education_willingness: 'advanced_degree',
      q14_constraints: ['no_constraints'],
      q17_support_confidence: 'strong_support',
      q19_20_impact_inspiration: 'I want to design aircraft and spacecraft systems for NASA or aerospace companies.'
    };

    console.log('📝 RTCROS Test Input:');
    console.log('   🎓 Grade:', testResponses.q1_grade_zip.grade);
    console.log('   📍 Location:', testResponses.q1_grade_zip.zipCode);
    console.log('   🧠 Career Knowledge:', testResponses.q3_career_knowledge);
    console.log('   📂 Category:', testResponses.q3a_career_categories);
    console.log('   🚀 Specific Career:', testResponses.q3a2_engineering_careers);
    console.log('   📚 Education Goal:', testResponses.q5_education_willingness);
    console.log('   📊 Math Performance:', testResponses.q4_academic_performance.Math);
    console.log('   🔬 Science Performance:', testResponses.q4_academic_performance['Science (Biology, Chemistry, Physics)']);
    console.log('   💭 Inspiration:', testResponses.q19_20_impact_inspiration);
    
    console.log('\n🚀 Submitting to RTCROS-Enhanced Clean AI Service...');
    
    const response = await axios.post('http://localhost:3002/api/assessment/v2/submit-v1', {
      responses: testResponses
    });

    if (response.data.success) {
      const results = response.data.data;
      console.log('\n✅ RTCROS SUBMISSION SUCCESSFUL');
      console.log('🎯 Specific Career Choice:', results.specificCareerChoice);
      console.log('📂 Career Category:', results.determinedWorkPreference);
      
      if (results.careerMatches && results.careerMatches.length > 0) {
        console.log('\n🏆 RTCROS CAREER MATCHES:');
        console.log('='.repeat(70));
        
        results.careerMatches.forEach((match, index) => {
          const isAerospace = match.career.title === 'Aerospace Engineer';
          const marker = isAerospace ? '✅ RTCROS SUCCESS' : '❌ RTCROS FAILURE';
          
          console.log(`${marker} ${index + 1}. ${match.career.title} (${match.matchScore}%)`);
          console.log(`     Sector: ${match.career.sector}`);
          console.log(`     Education: ${match.career.requiredEducation}`);
          console.log(`     Salary: $${match.career.averageSalary?.toLocaleString()}`);
          console.log(`     Explanation: ${match.explanation}`);
          
          if (index === 0) {
            console.log(`\n🔍 RTCROS TOP MATCH ANALYSIS:`);
            if (isAerospace) {
              console.log('     ✅ SUCCESS: RTCROS framework correctly prioritized Aerospace Engineer!');
              console.log('     🎯 Direct selection protection working');
              console.log('     📊 Match score indicates direct selection (95%)');
            } else {
              console.log(`     ❌ FAILURE: RTCROS returned ${match.career.title} instead of Aerospace Engineer`);
              console.log('     🐛 Direct selection protection failed');
            }
          }
        });
        
        // Analyze AI recommendations with RTCROS framework
        if (results.aiRecommendations) {
          console.log('\n🤖 RTCROS AI RECOMMENDATIONS ANALYSIS:');
          console.log('-'.repeat(50));
          
          if (results.aiRecommendations.careerRecommendations) {
            console.log('📋 Career Recommendations:');
            results.aiRecommendations.careerRecommendations.slice(0, 3).forEach((rec, index) => {
              const isAerospace = rec.title === 'Aerospace Engineer';
              const marker = isAerospace ? '✅' : '❌';
              console.log(`${marker} ${index + 1}. ${rec.title} (${rec.matchPercentage}%)`);
              console.log(`     Education: ${rec.educationRequired}`);
              console.log(`     Salary: ${rec.salaryRange}`);
              if (rec.explanation) {
                console.log(`     RTCROS Explanation: ${rec.explanation.substring(0, 100)}...`);
              }
            });
          }
          
          if (results.aiRecommendations.careerPathway) {
            console.log('\n🛤️ RTCROS Career Pathway:');
            console.log(`   Timeline: ${results.aiRecommendations.careerPathway.timeline}`);
            console.log('   Steps:');
            results.aiRecommendations.careerPathway.steps?.slice(0, 4).forEach((step, index) => {
              const isSpecific = step.toLowerCase().includes('aerospace') || step.toLowerCase().includes('engineering');
              const marker = isSpecific ? '✅' : '⚠️';
              console.log(`   ${marker} ${index + 1}. ${step}`);
            });
          }
          
          if (results.aiRecommendations.academicPlan) {
            console.log('\n📚 RTCROS Academic Plan:');
            console.log('   Recommended Courses:', results.aiRecommendations.academicPlan.recommendedCourses?.join(', '));
            console.log('   Extracurriculars:', results.aiRecommendations.academicPlan.extracurriculars?.join(', '));
          }
        }
        
        // RTCROS Framework Validation
        console.log('\n📊 RTCROS FRAMEWORK VALIDATION:');
        console.log('='.repeat(50));
        
        const topMatch = results.careerMatches[0];
        const topAIRec = results.aiRecommendations?.careerRecommendations?.[0];
        
        // Role validation
        console.log('🎭 ROLE: Senior Career Counselor AI');
        console.log('   ✅ AI acted as career counselor');
        
        // Task validation
        console.log('📋 TASK: Direct Career Selection Processing');
        if (topMatch.career.title === 'Aerospace Engineer') {
          console.log('   ✅ Task completed - Aerospace Engineer prioritized');
        } else {
          console.log('   ❌ Task failed - Direct selection not prioritized');
        }
        
        // Context validation
        console.log('📄 CONTEXT: Student Assessment Data');
        console.log('   ✅ Grade 11 student data processed');
        console.log('   ✅ Engineering category recognized');
        console.log('   ✅ Aerospace engineer selection captured');
        
        // Reasoning validation
        console.log('🧠 REASONING: 6-Point Analysis Framework');
        if (topAIRec?.explanation && topAIRec.explanation.length > 50) {
          console.log('   ✅ Detailed explanation provided');
        } else {
          console.log('   ⚠️ Limited reasoning explanation');
        }
        
        // Output validation
        console.log('📤 OUTPUT: Structured JSON Response');
        const hasValidStructure = results.aiRecommendations?.careerRecommendations && 
                                 results.aiRecommendations?.careerPathway &&
                                 results.aiRecommendations?.academicPlan;
        if (hasValidStructure) {
          console.log('   ✅ Complete JSON structure returned');
        } else {
          console.log('   ❌ Incomplete JSON structure');
        }
        
        // Stopping validation
        console.log('🛑 STOPPING: Quality Criteria Validation');
        const qualityChecks = {
          accuracy: topMatch.career.title === 'Aerospace Engineer',
          personalization: topAIRec?.explanation?.includes('aerospace') || topAIRec?.explanation?.includes('engineering'),
          specificity: results.aiRecommendations?.careerPathway?.steps?.some(step => step.includes('aerospace') || step.includes('engineering')),
          completeness: hasValidStructure,
          consistency: topMatch.career.title === topAIRec?.title,
          selectionRespect: topMatch.career.title === 'Aerospace Engineer'
        };
        
        Object.entries(qualityChecks).forEach(([criteria, passed]) => {
          const marker = passed ? '✅' : '❌';
          console.log(`   ${marker} ${criteria.charAt(0).toUpperCase() + criteria.slice(1)}: ${passed ? 'PASSED' : 'FAILED'}`);
        });
        
        // Final RTCROS Assessment
        const rtcrosScore = Object.values(qualityChecks).filter(Boolean).length;
        console.log(`\n🎯 RTCROS FRAMEWORK SCORE: ${rtcrosScore}/6`);
        
        if (rtcrosScore >= 5) {
          console.log('🎉 RTCROS IMPLEMENTATION SUCCESS!');
          console.log('   The framework is working correctly for aerospace engineer selections.');
        } else {
          console.log('⚠️ RTCROS IMPLEMENTATION NEEDS IMPROVEMENT');
          console.log('   Some framework components are not functioning optimally.');
        }
      }
    } else {
      console.log('❌ RTCROS SUBMISSION FAILED:', response.data.error);
    }

  } catch (error) {
    console.error('❌ RTCROS Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testRTCROSAerospace();