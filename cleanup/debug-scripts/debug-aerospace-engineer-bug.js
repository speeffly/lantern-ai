const axios = require('axios');

const API_BASE = process.env.API_URL || 'http://localhost:3002';

async function debugAerospaceEngineerBug() {
  console.log('🐛 DEBUGGING: Aerospace Engineer Bug - Why are we getting Photographer?');
  console.log('=' .repeat(80));

  try {
    // Step 1: Test the career database directly
    console.log('\n1. Testing Career Database...');
    const careersResponse = await axios.get(`${API_BASE}/api/careers/all`);
    
    if (careersResponse.data.success) {
      const careers = careersResponse.data.data;
      console.log('   Total careers in database:', careers.length);
      
      const aerospaceEngineer = careers.find(c => c.title === 'Aerospace Engineer');
      const photographer = careers.find(c => c.title === 'Photographer');
      
      console.log('   🚀 Aerospace Engineer in database:', !!aerospaceEngineer);
      if (aerospaceEngineer) {
        console.log('      ID:', aerospaceEngineer.id);
        console.log('      Sector:', aerospaceEngineer.sector);
        console.log('      Salary:', aerospaceEngineer.averageSalary);
      }
      
      console.log('   📸 Photographer in database:', !!photographer);
      if (photographer) {
        console.log('      ID:', photographer.id);
        console.log('      Sector:', photographer.sector);
        console.log('      Salary:', photographer.averageSalary);
      }
    }

    // Step 2: Test the V1 career mapping function
    console.log('\n2. Testing V1 Career Mapping Function...');
    
    // Simulate the mapping function call
    const testMappingResponse = await axios.post(`${API_BASE}/api/debug/test-career-mapping`, {
      specificCareer: 'aerospace_engineer'
    });
    
    if (testMappingResponse.data) {
      console.log('   Mapping result:', testMappingResponse.data);
    } else {
      console.log('   ❌ Mapping endpoint not available, testing manually...');
      
      // Test the mapping logic manually
      const engineeringMapping = {
        'aerospace_engineer': 'Aerospace Engineer',
        'mechanical_engineer': 'Mechanical Engineer',
        'electrical_engineer': 'Electrical Engineer',
        'civil_engineer': 'Civil Engineer'
      };
      
      const mappedTitle = engineeringMapping['aerospace_engineer'];
      console.log('   Manual mapping result:', mappedTitle);
      
      if (careersResponse.data.success) {
        const careers = careersResponse.data.data;
        const foundCareer = careers.find(c => c.title === mappedTitle);
        console.log('   Found in database:', !!foundCareer);
        if (foundCareer) {
          console.log('   Career details:', {
            id: foundCareer.id,
            title: foundCareer.title,
            sector: foundCareer.sector
          });
        }
      }
    }

    // Step 3: Test V1 submission with detailed logging
    console.log('\n3. Testing V1 Submission with Aerospace Engineer...');
    
    const testResponses = {
      q1_grade_zip: {
        grade: '11',
        zipCode: '12345'
      },
      q3_career_knowledge: 'yes',
      q3a_career_categories: 'engineering',
      q3a2_engineering_careers: 'aerospace_engineer', // CRITICAL TEST
      q4_academic_performance: {
        'Math': 'Excellent',
        'Science (Biology, Chemistry, Physics)': 'Excellent'
      },
      q5_education_willingness: 'advanced_degree',
      q14_constraints: ['no_constraints'],
      q17_support_confidence: 'strong_support',
      q19_20_impact_inspiration: 'I want to work in aerospace engineering.'
    };

    console.log('   Submitting test responses...');
    console.log('   Key selection: q3a2_engineering_careers =', testResponses.q3a2_engineering_careers);
    
    const submissionResponse = await axios.post(`${API_BASE}/api/assessment/v2/submit-v1`, {
      responses: testResponses
    });

    if (submissionResponse.data.success) {
      const results = submissionResponse.data.data;
      console.log('   ✅ Submission successful');
      console.log('   Specific Career Choice:', results.specificCareerChoice);
      console.log('   Career Category:', results.determinedWorkPreference);
      
      if (results.careerMatches && results.careerMatches.length > 0) {
        console.log('\n   📊 CAREER MATCHES RETURNED:');
        results.careerMatches.forEach((match, index) => {
          console.log(`      ${index + 1}. ${match.career.title} (${match.matchScore}%)`);
          if (match.career.title === 'Photographer') {
            console.log('         🐛 BUG FOUND: Photographer returned instead of Aerospace Engineer!');
            console.log('         Career ID:', match.career.id);
            console.log('         Career Sector:', match.career.sector);
            console.log('         Match explanation:', match.explanation);
          }
          if (match.career.title === 'Aerospace Engineer') {
            console.log('         ✅ Aerospace Engineer found at position', index + 1);
          }
        });
        
        // Check if Aerospace Engineer is anywhere in the results
        const aerospaceMatch = results.careerMatches.find(m => m.career.title === 'Aerospace Engineer');
        if (!aerospaceMatch) {
          console.log('\n   🚨 CRITICAL BUG: Aerospace Engineer NOT FOUND in any results!');
          console.log('   This means the career mapping or matching logic is broken.');
        }
      }
      
      // Check the comprehensive analysis
      if (results.comprehensiveAnalysis) {
        console.log('\n   📋 Comprehensive Analysis:');
        console.log('      Primary Factor:', results.comprehensiveAnalysis.primaryFactor);
        console.log('      Total Questions Answered:', results.comprehensiveAnalysis.totalQuestionsAnswered);
        console.log('      Assessment Data Captured:', results.comprehensiveAnalysis.assessmentDataCaptured);
      }
      
    } else {
      console.log('   ❌ Submission failed:', submissionResponse.data.error);
    }

    // Step 4: Test the legacy assessment system for comparison
    console.log('\n4. Testing Legacy Assessment System...');
    
    const legacyResponses = {
      basic_info: {
        grade: '11',
        zipCode: '12345'
      },
      work_preference_main: 'hard_hat_creating_designs',
      subject_strengths: {
        math: '5',
        science: '5',
        english: '3',
        technology: '4'
      },
      education_commitment: 'bachelor'
    };
    
    const legacySubmissionResponse = await axios.post(`${API_BASE}/api/assessment/v2/submit`, {
      responses: legacyResponses,
      path: 'decided'
    });
    
    if (legacySubmissionResponse.data.success) {
      const legacyResults = legacySubmissionResponse.data.data;
      console.log('   ✅ Legacy submission successful');
      
      if (legacyResults.careerMatches && legacyResults.careerMatches.primaryMatches) {
        console.log('   📊 Legacy Career Matches:');
        legacyResults.careerMatches.primaryMatches.forEach((career, index) => {
          console.log(`      ${index + 1}. ${career}`);
          if (career === 'Aerospace Engineer') {
            console.log('         ✅ Aerospace Engineer found in legacy system!');
          }
        });
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('🔍 BUG ANALYSIS COMPLETE');
    console.log('Next steps: Check the career mapping function and database queries');

  } catch (error) {
    console.error('❌ Debug failed with error:', error.message);
    if (error.response) {
      console.error('   Response status:', error.response.status);
      console.error('   Response data:', error.response.data);
    }
  }
}

// Run the debug
debugAerospaceEngineerBug();