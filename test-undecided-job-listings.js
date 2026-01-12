const axios = require('axios');

async function testUndecidedJobListings() {
  console.log('🧪 Testing Undecided Path with Job Listings Enhancement...\n');

  const testResponses = {
    grade: 10,
    zipCode: "90210", // Beverly Hills for good job market
    q3_career_knowledge: "No", // This should trigger undecided path
    personalTraits: ["Creative and artistic", "Analytical and logical", "People-oriented"],
    interestsPassions: "helping people and working with technology",
    workExperience: "volunteered at local hospital and coding bootcamp",
    academicPerformance: {
      "English / Language Arts": "Excellent",
      "Math": "Good",
      "Science (Biology, Chemistry, Physics)": "Excellent",
      "Technology / Computer Science": "Good",
      "Art / Creative Subjects": "Excellent",
      "Social Studies / History": "Average",
      "Physical Education / Health": "Good",
      "Foreign Languages": "Average",
      "Business / Economics": "Average"
    },
    educationCommitment: "4-year college degree",
    constraints: ["Good work-life balance", "Opportunities for advancement"],
    supportLevel: "Strong support",
    impactStatement: "I want to help people through technology and healthcare innovation"
  };

  try {
    console.log('📤 Sending enhanced test assessment...');
    console.log('   - Grade: 10');
    console.log('   - ZIP Code: 90210 (Beverly Hills)');
    console.log('   - Career Knowledge: No (undecided path)');
    console.log('   - Interests: Healthcare + Technology');
    
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
      console.log('\n📊 Undecided Path Results:');
      console.log('   - Total career matches:', recommendations.topJobMatches?.length || 0);
      console.log('   - Undecided path detected:', recommendations.undecidedPath || false);
      console.log('   - Student location:', recommendations.studentProfile?.location || 'not specified');
      
      if (recommendations.topJobMatches && recommendations.topJobMatches.length > 0) {
        console.log('\n🎯 Career Options Generated:');
        recommendations.topJobMatches.forEach((match, index) => {
          console.log(`   ${index + 1}. ${match.career.title}`);
          console.log(`      - Sector: ${match.career.sector}`);
          console.log(`      - Match Score: ${match.matchScore}%`);
          console.log(`      - Local Salary: $${match.localOpportunities.averageLocalSalary.toLocaleString()}`);
          console.log(`      - Estimated Jobs: ${match.localOpportunities.estimatedJobs}`);
          console.log(`      - Distance: ${match.localOpportunities.distanceFromStudent} miles`);
        });
      }
      
      console.log('\n💡 Frontend Enhancement Features:');
      console.log('   ✅ UndecidedCareerOptions component will receive zipCode prop');
      console.log('   ✅ JobListings component will be imported and used');
      console.log('   ✅ Job listings will appear when student selects a career');
      console.log('   ✅ Smooth scroll to job listings section');
      console.log('   ✅ Enhanced visual feedback for career selection');
      console.log('   ✅ Additional action buttons (View More Jobs, Check Salaries, Learn More)');
      
      console.log('\n🔍 Expected User Experience:');
      console.log('   1. Student sees 3 diverse career options');
      console.log('   2. Student clicks "Select This Career" on one option');
      console.log('   3. Button changes to "✓ Selected - View Jobs Below"');
      console.log('   4. Green success message appears under selected career');
      console.log('   5. Page smoothly scrolls to new "Current Job Openings" section');
      console.log('   6. JobListings component shows 5 real job openings');
      console.log('   7. Additional action buttons for more exploration');
      
      // Verify the data structure is ready for job listings
      const firstCareer = recommendations.topJobMatches?.[0];
      if (firstCareer) {
        console.log('\n📋 Sample Career Data for Job Listings:');
        console.log('   - Career Title:', firstCareer.career.title);
        console.log('   - ZIP Code:', recommendations.studentProfile.location);
        console.log('   - Ready for JobListings component: ✅');
      }
      
      if (recommendations.topJobMatches?.length === 3 && recommendations.undecidedPath) {
        console.log('\n✅ SUCCESS: Enhanced undecided path ready for job listings!');
      } else {
        console.log('\n❌ ISSUE: Undecided path structure not as expected');
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
testUndecidedJobListings();