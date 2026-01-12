const axios = require('axios');

async function testUndecidedPath() {
  console.log('🧪 Testing Undecided Path Detection Fix...\n');

  const testResponses = {
    grade: 9,
    zipCode: "78724",
    q3_career_knowledge: "No", // This should trigger undecided path
    personalTraits: ["Creative and artistic", "Analytical and logical", "Leadership-oriented"],
    interestsPassions: "volunteering",
    workExperience: "volunteered at round rock community center",
    academicPerformance: {
      "English / Language Arts": "Excellent",
      "Social Studies / History": "Excellent",
      "Art / Creative Subjects": "Excellent",
      "Math": "Average",
      "Science (Biology, Chemistry, Physics)": "Average",
      "Physical Education / Health": "Average",
      "Technology / Computer Science": "Average",
      "Foreign Languages": "Average",
      "Business / Economics": "Average"
    },
    educationCommitment: "Work immediately after high school",
    constraints: ["Start earning money as soon as possible", "Flexible hours"],
    supportLevel: "Strong support",
    impactStatement: "some one who is always there to support community"
  };

  try {
    console.log('📤 Sending test assessment with q3_career_knowledge: "No"...');
    
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
      
      console.log('✅ Assessment completed successfully!');
      console.log('\n📊 Results Summary:');
      console.log('   - Total career matches:', recommendations.topJobMatches?.length || 0);
      console.log('   - Undecided path detected:', recommendations.undecidedPath || false);
      console.log('   - Has selection rationale:', !!recommendations.selectionRationale);
      console.log('   - Student path type:', recommendations.studentProfile?.pathType || 'not specified');
      
      if (recommendations.topJobMatches && recommendations.topJobMatches.length > 0) {
        console.log('\n🎯 Career Matches:');
        recommendations.topJobMatches.forEach((match, index) => {
          console.log(`   ${index + 1}. ${match.career.title} (${match.career.sector})`);
          console.log(`      - Match Score: ${match.matchScore}%`);
          console.log(`      - Salary: $${match.localOpportunities.averageLocalSalary.toLocaleString()}`);
        });
      }
      
      if (recommendations.selectionRationale) {
        console.log('\n💡 Selection Rationale:');
        console.log('   ', recommendations.selectionRationale);
      }
      
      if (recommendations.nextSteps) {
        console.log('\n🚀 Next Steps:');
        recommendations.nextSteps.forEach((step, index) => {
          console.log(`   ${index + 1}. ${step}`);
        });
      }
      
      // Verify this is actually the undecided path
      if (recommendations.topJobMatches?.length === 3 && recommendations.undecidedPath) {
        console.log('\n✅ SUCCESS: Undecided path correctly detected and 3 career options provided!');
      } else if (recommendations.topJobMatches?.length !== 3) {
        console.log(`\n❌ ISSUE: Expected 3 career matches, got ${recommendations.topJobMatches?.length || 0}`);
      } else if (!recommendations.undecidedPath) {
        console.log('\n❌ ISSUE: undecidedPath flag not set to true');
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
testUndecidedPath();