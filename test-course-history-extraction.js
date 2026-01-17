const axios = require('axios');

async function testCourseHistoryExtraction() {
  console.log('🧪 Testing Course History Data Extraction');
  console.log('========================================');
  
  try {
    // Test data with course history
    const testData = {
      grade: 11,
      zipCode: '12345',
      q1_work_environment: 'office',
      q2_hands_on: 'somewhat',
      q3_career_knowledge: 'yes',
      q3a_career_category: 'technology',
      q3a1_technology_careers: 'software_engineer',
      q4_academic_performance: {
        'Math': 'excellent',
        'Science (Biology, Chemistry, Physics)': 'good',
        'English / Language Arts': 'good',
        'Social Studies / History': 'average',
        'Art / Creative Subjects': 'poor',
        'Physical Education / Health': 'average',
        'Technology / Computer Science': 'excellent',
        'Foreign Languages': 'average',
        'Business / Economics': 'good'
      },
      q4b_course_history: {
        'Math': 'AP Calculus BC, AP Statistics, Honors Algebra II',
        'Science (Biology, Chemistry, Physics)': 'AP Computer Science A, Honors Physics, Honors Chemistry',
        'English / Language Arts': 'AP English Language, Honors English 10',
        'Technology / Computer Science': 'AP Computer Science A, Web Development, Robotics',
        'Business / Economics': 'AP Economics, Business Management'
      },
      q5_problem_solving: 'love_it',
      q6_helping_others: 'somewhat_important',
      q7_education_commitment: 'bachelors',
      q8_income_importance: 'somewhat_important',
      q9_job_security: 'very_important'
    };

    const requestData = {
      responses: testData
    };

    console.log('📝 Course history data being sent:');
    console.log(JSON.stringify(testData.q4b_course_history, null, 2));
    
    console.log('\n📤 Submitting assessment...');
    
    const response = await axios.post('http://localhost:3002/api/counselor-assessment/submit', requestData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      console.log('✅ Assessment submitted successfully!');
      console.log('📊 Response structure:');
      console.log('- Success:', response.data.success);
      console.log('- Message:', response.data.message);
      console.log('- Data keys:', Object.keys(response.data.data || {}));
      
      if (response.data.data && response.data.data.recommendations) {
        console.log('\n📋 Recommendations found:');
        const recs = response.data.data.recommendations;
        console.log('- Top career matches:', recs.topJobMatches?.length || 0);
        if (recs.topJobMatches && recs.topJobMatches[0]) {
          console.log('- Top career:', recs.topJobMatches[0].career?.title);
        }
        
        // Check if student profile includes course history
        if (recs.studentProfile) {
          console.log('\n👤 Student profile keys:', Object.keys(recs.studentProfile));
          if (recs.studentProfile.courseHistory) {
            console.log('✅ Course history found in student profile!');
            console.log('📚 Course history data:', JSON.stringify(recs.studentProfile.courseHistory, null, 2));
          } else {
            console.log('❌ Course history NOT found in student profile');
          }
        }
      }
    } else {
      console.log('❌ Assessment failed:', response.data.message);
    }

  } catch (error) {
    console.log('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.status) {
      console.log('Status:', error.response.status);
    }
  }
}

testCourseHistoryExtraction();