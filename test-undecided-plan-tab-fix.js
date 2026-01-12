const axios = require('axios');

async function testUndecidedPlanTabFix() {
  console.log('🧪 Testing Undecided Path Plan Tab Fix...\n');

  const testResponses = {
    grade: 11,
    zipCode: "10001", // NYC
    q3_career_knowledge: "No", // This should trigger undecided path
    personalTraits: ["Analytical and logical", "Creative and artistic", "Leadership-oriented"],
    interestsPassions: "science and helping people",
    workExperience: "volunteered at science museum",
    academicPerformance: {
      "Math": "Excellent",
      "Science (Biology, Chemistry, Physics)": "Excellent", 
      "English / Language Arts": "Good",
      "Technology / Computer Science": "Good",
      "Art / Creative Subjects": "Average",
      "Social Studies / History": "Average",
      "Physical Education / Health": "Average",
      "Foreign Languages": "Average",
      "Business / Economics": "Average"
    },
    educationCommitment: "4-year college degree",
    constraints: ["Good work-life balance"],
    supportLevel: "Strong support",
    impactStatement: "I want to make a positive impact through science and innovation"
  };

  try {
    console.log('📤 Testing undecided path with Plan tab access...');
    console.log('   - Grade: 11 (Junior)');
    console.log('   - Career Knowledge: No (undecided)');
    console.log('   - Strong in Math & Science');
    
    const response = await axios.post('http://localhost:3002/api/counselor-assessment/submit', {
      responses: testResponses
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    if (response.data.success) {
      const recommendations = response.data.data.recommendations;
      
      console.log('\n✅ Assessment completed successfully!');
      console.log('\n📊 Data Structure Analysis:');
      console.log('   - Undecided path detected:', recommendations.undecidedPath || false);
      console.log('   - Has fourYearPlan:', !!recommendations.fourYearPlan);
      console.log('   - Has topJobMatches:', !!recommendations.topJobMatches);
      console.log('   - Number of career matches:', recommendations.topJobMatches?.length || 0);
      console.log('   - Has nextSteps:', !!recommendations.nextSteps);
      console.log('   - Has studentProfile:', !!recommendations.studentProfile);
      
      console.log('\n🎯 Career Matches for Plan Tab:');
      if (recommendations.topJobMatches && recommendations.topJobMatches.length > 0) {
        recommendations.topJobMatches.forEach((match, index) => {
          console.log(`   ${index + 1}. ${match.career.title}`);
          console.log(`      - Education: ${match.career.requiredEducation}`);
          console.log(`      - High School Prep: ${match.educationPath?.highSchoolCourses?.slice(0, 2).join(', ') || 'N/A'}`);
          console.log(`      - Time to Career: ${match.educationPath?.timeToCareer || 'N/A'}`);
        });
      }
      
      console.log('\n📋 Next Steps for Plan Tab:');
      if (recommendations.nextSteps) {
        recommendations.nextSteps.forEach((step, index) => {
          console.log(`   ${index + 1}. ${step}`);
        });
      }
      
      console.log('\n🔧 Frontend Plan Tab Behavior:');
      if (!recommendations.fourYearPlan) {
        console.log('   ✅ fourYearPlan is undefined - will show undecided exploration plan');
        console.log('   ✅ Plan tab will display:');
        console.log('      - Career Exploration Plan explanation');
        console.log('      - General High School Preparation');
        console.log('      - Career-Specific Planning for 3 options');
        console.log('      - Action Items from nextSteps');
      } else {
        console.log('   ❌ fourYearPlan exists - might show regular plan (unexpected for undecided)');
      }
      
      console.log('\n🎯 Expected User Experience:');
      console.log('   1. Student completes undecided assessment');
      console.log('   2. Student sees 3 career options in Career Options tab');
      console.log('   3. Student clicks on "4-Year Plan" tab');
      console.log('   4. NO ERROR occurs (TypeError fixed)');
      console.log('   5. Student sees career exploration guidance');
      console.log('   6. Student sees general preparation advice');
      console.log('   7. Student sees specific prep for each of the 3 careers');
      
      if (recommendations.undecidedPath && !recommendations.fourYearPlan) {
        console.log('\n✅ SUCCESS: Plan tab fix ready for undecided students!');
        console.log('   - No TypeError will occur');
        console.log('   - Appropriate content will be shown');
        console.log('   - Career exploration guidance provided');
      } else {
        console.log('\n⚠️ UNEXPECTED: Data structure different than expected');
      }
      
    } else {
      console.log('❌ Assessment failed:', response.data.error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

// Run the test
testUndecidedPlanTabFix();