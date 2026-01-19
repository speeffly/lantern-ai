const axios = require('axios');

const API_BASE = process.env.API_URL || 'http://localhost:3001';

async function testV1QuestionnaireComprehensiveDataCapture() {
  console.log('🚀 Testing V1 Questionnaire - Comprehensive Data Capture & AI Integration');
  console.log('=' .repeat(80));

  try {
    // Step 1: Test V1 questionnaire structure
    console.log('\n1. Testing V1 Questionnaire Structure...');
    const questionnaireResponse = await axios.get(`${API_BASE}/api/assessment/v2/v1`);
    
    if (questionnaireResponse.data.success) {
      const questionnaire = questionnaireResponse.data.data;
      console.log('✅ V1 questionnaire loaded successfully');
      console.log('   Version:', questionnaire.version);
      console.log('   Total questions:', questionnaire.questions.length);
    }

    // Step 2: Test comprehensive V1 questionnaire submission with ALL data types
    console.log('\n2. Testing Comprehensive V1 Questionnaire Submission...');
    
    const comprehensiveResponses = {
      // Basic demographics
      q1_grade_zip: {
        grade: '11',
        zipCode: '12345'
      },
      
      // Career knowledge and specific selection
      q3_career_knowledge: 'yes',
      q3a_career_categories: 'engineering',
      q3a2_engineering_careers: 'aerospace_engineer', // SPECIFIC CAREER SELECTION
      
      // Academic performance across all subjects
      q4_academic_performance: {
        'Math': 'Excellent',
        'Science (Biology, Chemistry, Physics)': 'Excellent',
        'English / Language Arts': 'Good',
        'Social Studies / History': 'Average',
        'Art / Creative Subjects': 'Good',
        'Physical Education / Health': 'Average',
        'Technology / Computer Science': 'Good',
        'Foreign Languages': 'Average',
        'Business / Economics': 'Average'
      },
      
      // Education willingness
      q5_education_willingness: 'advanced_degree',
      
      // Constraints and preferences
      q14_constraints: ['no_constraints', 'open_relocating'],
      
      // Support system
      q17_support_confidence: 'strong_support',
      
      // Impact and inspiration (detailed response)
      q19_20_impact_inspiration: 'I am deeply inspired by aerospace engineers like Katherine Johnson who worked on NASA space missions and made groundbreaking contributions to space exploration. I want to be remembered for advancing aerospace technology, particularly in sustainable space travel and Mars exploration. My goal is to design spacecraft systems that will help humanity become a multi-planetary species while also developing technologies that benefit life on Earth, such as improved satellite communications and weather monitoring systems.'
    };

    const submissionResponse = await axios.post(`${API_BASE}/api/assessment/v2/submit-v1`, {
      responses: comprehensiveResponses
    });

    if (submissionResponse.data.success) {
      const results = submissionResponse.data.data;
      console.log('✅ V1 questionnaire submitted successfully');
      console.log('   Assessment Version:', results.assessmentVersion);
      console.log('   Path Taken:', results.pathTaken);
      console.log('   Specific Career Choice:', results.specificCareerChoice);
      
      // Test comprehensive analysis
      if (results.comprehensiveAnalysis) {
        console.log('\n📊 Comprehensive Analysis:');
        console.log('   Total Questions Answered:', results.comprehensiveAnalysis.totalQuestionsAnswered);
        console.log('   Assessment Data Captured:', results.comprehensiveAnalysis.assessmentDataCaptured);
        console.log('   Primary Factor:', results.comprehensiveAnalysis.primaryFactor);
        console.log('   AI Processing Status:', results.comprehensiveAnalysis.aiProcessingStatus);
        
        if (results.comprehensiveAnalysis.totalQuestionsAnswered >= 7) {
          console.log('✅ Comprehensive data capture confirmed');
        } else {
          console.log('⚠️  Limited data captured');
        }
      }
      
      // Test student profile completeness
      if (results.studentProfile) {
        console.log('\n👤 Student Profile Data:');
        console.log('   Grade:', results.studentProfile.grade);
        console.log('   ZIP Code:', results.studentProfile.zipCode);
        console.log('   Career Knowledge:', results.studentProfile.careerKnowledge);
        console.log('   Education Willingness:', results.studentProfile.educationWillingness);
        console.log('   Constraints:', results.studentProfile.constraints);
        console.log('   Academic Performance Keys:', Object.keys(results.studentProfile.academicPerformance || {}));
        console.log('   Impact/Inspiration Length:', results.studentProfile.impactInspiration?.length || 0, 'characters');
        
        if (results.studentProfile.impactInspiration && results.studentProfile.impactInspiration.length > 100) {
          console.log('✅ Detailed impact/inspiration data captured');
        }
      }
      
      // Test AI recommendations
      if (results.aiRecommendations) {
        console.log('\n🤖 AI Recommendations:');
        console.log('   AI Recommendations Available:', !!results.aiRecommendations);
        console.log('   Academic Plan Available:', !!results.aiRecommendations.academicPlan);
        console.log('   Career Pathway Available:', !!results.aiRecommendations.careerPathway);
        console.log('   Local Jobs Count:', results.aiRecommendations.localJobs?.length || 0);
        
        if (results.aiRecommendations.academicPlan || results.aiRecommendations.careerPathway) {
          console.log('✅ Comprehensive AI recommendations generated');
          
          // Check if AI recommendations reference specific student data through career pathway
          let aiText = '';
          if (results.aiRecommendations.careerPathway?.steps) {
            aiText = results.aiRecommendations.careerPathway.steps.join(' ').toLowerCase();
          }
          
          const dataReferences = {
            'aerospace': aiText.includes('aerospace'),
            'engineering': aiText.includes('engineering'),
            'math': aiText.includes('math'),
            'science': aiText.includes('science'),
            'katherine johnson': aiText.includes('katherine johnson'),
            'nasa': aiText.includes('nasa'),
            'mars': aiText.includes('mars'),
            'space': aiText.includes('space')
          };
          
          console.log('   AI References Student Data:');
          Object.entries(dataReferences).forEach(([key, found]) => {
            console.log(`     ${found ? '✅' : '❌'} ${key}: ${found}`);
          });
          
          const referencesFound = Object.values(dataReferences).filter(Boolean).length;
          if (referencesFound >= 2) {
            console.log('🎉 SUCCESS: AI properly references specific student data!');
          } else {
            console.log('⚠️  AI may not be fully utilizing student data');
          }
        }
      }
      
      // Test career matches
      if (results.careerMatches && results.careerMatches.length > 0) {
        console.log('\n🎯 Career Matches:');
        results.careerMatches.slice(0, 3).forEach((match, index) => {
          console.log(`   ${index + 1}. ${match.career.title} (${match.matchScore}%)`);
          if (match.whyThisMatches) {
            console.log(`      Why: ${match.whyThisMatches.substring(0, 100)}...`);
          }
        });
        
        const aerospaceMatch = results.careerMatches.find(m => m.career.title === 'Aerospace Engineer');
        if (aerospaceMatch) {
          console.log('🎯 AEROSPACE ENGINEER FOUND!');
          console.log('   Position:', results.careerMatches.findIndex(m => m.career.title === 'Aerospace Engineer') + 1);
          console.log('   Match Score:', aerospaceMatch.matchScore + '%');
          
          if (aerospaceMatch.whyThisMatches) {
            console.log('   AI Explanation Length:', aerospaceMatch.whyThisMatches.length, 'characters');
            
            // Check if explanation references student's specific data
            const explanation = aerospaceMatch.whyThisMatches.toLowerCase();
            const specificReferences = {
              'katherine johnson': explanation.includes('katherine johnson'),
              'nasa': explanation.includes('nasa'),
              'mars': explanation.includes('mars'),
              'space exploration': explanation.includes('space exploration'),
              'excellent math': explanation.includes('excellent') && explanation.includes('math'),
              'excellent science': explanation.includes('excellent') && explanation.includes('science')
            };
            
            console.log('   Explanation References:');
            Object.entries(specificReferences).forEach(([key, found]) => {
              console.log(`     ${found ? '✅' : '❌'} ${key}`);
            });
          }
        }
      }

    } else {
      console.log('❌ V1 questionnaire submission failed:', submissionResponse.data.error);
    }

    // Step 3: Test undecided path with comprehensive data
    console.log('\n3. Testing Undecided Path with Comprehensive Data...');
    
    const undecidedResponses = {
      q1_grade_zip: {
        grade: '10',
        zipCode: '54321'
      },
      q3_career_knowledge: 'no',
      q10_traits: ['analytical', 'curious', 'hands_on', 'problem_solver'],
      q8_interests_text: 'I love building model rockets and airplanes, programming Arduino projects, and learning about space exploration. I enjoy solving complex math problems and understanding how things work. I spend my free time reading about aerospace engineering, watching documentaries about NASA missions, and experimenting with electronics.',
      q9_experience_text: 'I have been part of the robotics club for 2 years where I programmed autonomous robots and designed mechanical systems. Last summer I attended a NASA space camp where I learned about rocket design and mission planning. I also volunteer at the local science museum helping with STEM workshops for younger kids, and I built a weather balloon payload that collected atmospheric data.',
      q4_academic_performance: {
        'Math': 'Excellent',
        'Science (Biology, Chemistry, Physics)': 'Excellent',
        'English / Language Arts': 'Good',
        'Social Studies / History': 'Average',
        'Art / Creative Subjects': 'Average',
        'Physical Education / Health': 'Good',
        'Technology / Computer Science': 'Excellent',
        'Foreign Languages': 'Average',
        'Business / Economics': 'Average'
      },
      q5_education_willingness: 'advanced_degree',
      q14_constraints: ['no_constraints'],
      q17_support_confidence: 'strong_support',
      q19_20_impact_inspiration: 'I want to make an impact by developing technologies that help humanity explore space and understand our universe better. I am inspired by engineers like Elon Musk who are pushing the boundaries of space technology, and scientists like Neil deGrasse Tyson who make complex concepts accessible to everyone. I want to be remembered for contributing to missions that expand human presence in space while also creating technologies that improve life on Earth.'
    };

    const undecidedSubmissionResponse = await axios.post(`${API_BASE}/api/assessment/v2/submit-v1`, {
      responses: undecidedResponses
    });

    if (undecidedSubmissionResponse.data.success) {
      const undecidedResults = undecidedSubmissionResponse.data.data;
      console.log('✅ Undecided path submission successful');
      console.log('   Path Taken:', undecidedResults.pathTaken);
      console.log('   Data Captured:', undecidedResults.comprehensiveAnalysis?.assessmentDataCaptured);
      
      // Check if AI recommendations reference the detailed interests and experience
      if (undecidedResults.aiRecommendations?.careerPathway) {
        const aiText = undecidedResults.aiRecommendations.careerPathway.steps?.join(' ').toLowerCase() || '';
        const detailedReferences = {
          'robotics': aiText.includes('robotics'),
          'nasa': aiText.includes('nasa'),
          'space camp': aiText.includes('space camp'),
          'arduino': aiText.includes('arduino'),
          'weather balloon': aiText.includes('weather balloon'),
          'elon musk': aiText.includes('elon musk'),
          'neil degrasse tyson': aiText.includes('neil degrasse tyson')
        };
        
        console.log('   AI References Detailed Student Data:');
        Object.entries(detailedReferences).forEach(([key, found]) => {
          console.log(`     ${found ? '✅' : '❌'} ${key}`);
        });
        
        const detailedReferencesFound = Object.values(detailedReferences).filter(Boolean).length;
        if (detailedReferencesFound >= 3) {
          console.log('🎉 SUCCESS: AI utilizes detailed student interests and experience!');
        }
      }
      
      // Check if aerospace engineering appears in undecided results
      const engineeringMatches = undecidedResults.careerMatches?.filter(m => 
        m.career.title.toLowerCase().includes('engineer')
      ) || [];
      
      if (engineeringMatches.length > 0) {
        console.log('✅ Engineering careers suggested for undecided student:');
        engineeringMatches.forEach(match => {
          console.log(`   - ${match.career.title} (${match.matchScore}%)`);
        });
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('🏁 Comprehensive Data Capture Test Complete');
    console.log('✅ Key Success Criteria:');
    console.log('   - All V1 questionnaire responses captured');
    console.log('   - Student profile data properly extracted');
    console.log('   - AI recommendations reference specific student data');
    console.log('   - Career matches include detailed explanations');
    console.log('   - Both decided and undecided paths work correctly');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    if (error.response) {
      console.error('   Response status:', error.response.status);
      console.error('   Response data:', error.response.data);
    }
  }
}

// Run the test
testV1QuestionnaireComprehensiveDataCapture();