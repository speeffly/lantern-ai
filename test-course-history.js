const axios = require('axios');

async function testCourseHistory() {
  console.log('🧪 Testing Course History Grid Functionality');
  console.log('===========================================');
  
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

    console.log('📝 Submitting assessment with course history data...');
    
    const response = await axios.post('http://localhost:3002/api/counselor-assessment/submit', requestData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      console.log('✅ Assessment submitted successfully!');
      console.log('📊 Full response keys:', Object.keys(response.data));
      if (response.data.data) {
        console.log('📊 Data keys:', Object.keys(response.data.data));
      }
      
      // Check if course history is included in the AI prompt
      if (response.data.data && response.data.data.aiPrompt) {
        console.log('\n🤖 Checking AI prompt for course history data...');
        const aiPrompt = response.data.data.aiPrompt;
        
        if (aiPrompt.includes('Course History') || aiPrompt.includes('AP Calculus') || aiPrompt.includes('course_history')) {
          console.log('✅ Course history data found in AI prompt!');
          console.log('📝 Course history section:');
          const lines = aiPrompt.split('\n');
          let inCourseSection = false;
          for (const line of lines) {
            if (line.includes('Course History') || line.includes('course_history')) {
              inCourseSection = true;
            }
            if (inCourseSection) {
              console.log('   ', line);
              if (line.trim() === '' && inCourseSection) {
                break;
              }
            }
          }
        } else {
          console.log('❌ Course history data NOT found in AI prompt');
          console.log('📝 AI Prompt preview (first 500 chars):');
          console.log(aiPrompt.substring(0, 500) + '...');
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

testCourseHistory();