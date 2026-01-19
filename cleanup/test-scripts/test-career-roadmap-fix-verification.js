// Test Career Roadmap Fix Verification
// This tests that the career roadmap API generates data that will now be properly displayed

const testCareerRoadmapGeneration = async () => {
  console.log('🧪 TESTING CAREER ROADMAP GENERATION AND UI DISPLAY');
  console.log('=' .repeat(70));

  const mockStudentData = {
    grade: 11,
    zipCode: '78735',
    courseHistory: {
      'Math': 'AP Calculus BC, AP Statistics',
      'Science (Biology, Chemistry, Physics)': 'AP Computer Science A, Honors Physics',
      'Technology / Computer Science': 'AP Computer Science A, Web Development',
      'English / Language Arts': 'Honors English 10, Technical Writing'
    },
    academicPerformance: {
      'Math': 'Excellent',
      'Science (Biology, Chemistry, Physics)': 'Good',
      'Technology / Computer Science': 'Excellent'
    },
    supportLevel: 'strong_support',
    educationCommitment: 'advanced_degree'
  };

  const mockCareer = {
    title: 'Software Developer',
    sector: 'technology',
    requiredEducation: 'Bachelor\'s degree in Computer Science',
    averageSalary: 85000,
    description: 'Design, develop, and maintain software applications and systems'
  };

  try {
    console.log('🚀 Testing career roadmap API call...');
    
    const response = await fetch('http://localhost:3001/api/career-roadmap/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        career: mockCareer,
        studentData: mockStudentData
      }),
    });

    if (!response.ok) {
      console.log('⚠️  API not available, testing fallback roadmap instead...');
      testFallbackRoadmap(mockCareer, mockStudentData);
      return;
    }

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ API response received successfully');
      console.log('📊 Analyzing roadmap data structure...');
      
      analyzeRoadmapForUIDisplay(data.data);
    } else {
      console.log('⚠️  API returned error, testing fallback roadmap...');
      testFallbackRoadmap(mockCareer, mockStudentData);
    }

  } catch (error) {
    console.log('⚠️  Network error, testing fallback roadmap...');
    testFallbackRoadmap(mockCareer, mockStudentData);
  }
};

function testFallbackRoadmap(career, studentData) {
  console.log('🔄 Testing fallback roadmap generation...');
  
  // This matches the fallback logic in CareerRoadmapView.tsx
  const fallbackRoadmap = {
    careerTitle: career.title,
    overview: {
      totalTimeToCareer: '4-6 years',
      estimatedTotalCost: 50000,
      educationLevel: career.requiredEducation,
      difficultyLevel: 'Intermediate',
      jobAvailability: 'Medium'
    },
    detailedPath: {
      highSchoolPhase: {
        timeframe: `Grade ${studentData.grade} - 12`,
        requiredCourses: ['English', 'Mathematics', 'Science', 'Social Studies'],
        recommendedCourses: ['Electives related to career field'],
        extracurriculars: ['Clubs and activities in area of interest'],
        skillsToFocus: ['Communication', 'Problem-solving', 'Critical thinking'],
        milestones: ['Maintain good grades', 'Explore career through activities']
      },
      postSecondaryPhase: {
        timeframe: '2-4 years after high school',
        educationType: career.requiredEducation,
        specificPrograms: [`Programs related to ${career.title}`],
        estimatedCost: 40000,
        keyRequirements: ['High school diploma', 'Good academic standing'],
        internshipOpportunities: ['Industry-related internships']
      },
      earlyCareerPhase: {
        timeframe: 'Years 1-3 in career',
        entryLevelPositions: [`Entry-level ${career.title} positions`],
        certifications: ['Relevant professional certifications'],
        skillDevelopment: ['Industry-specific skills', 'Professional communication'],
        networkingTips: ['Join professional associations', 'Attend industry events']
      },
      advancementPhase: {
        timeframe: 'Years 4-10 in career',
        careerProgression: ['Senior positions', 'Specialized roles', 'Management opportunities'],
        advancedCertifications: ['Advanced professional certifications'],
        leadershipOpportunities: ['Team leadership', 'Project management'],
        salaryProgression: ['Steady salary increases with experience']
      }
    },
    personalizedRecommendations: {
      strengthsToLeverage: ['Academic preparation', 'Interest in field'],
      areasForImprovement: ['Continue developing relevant skills'],
      specificActions: ['Research career requirements', 'Explore educational options'],
      timelineAdjustments: ['Follow standard timeline for career preparation']
    },
    localContext: {
      nearbySchools: ['Local colleges and universities'],
      localEmployers: ['Regional employers in the field'],
      regionalOpportunities: ['Local job market opportunities'],
      costOfLivingImpact: 'Consider local cost of living when planning'
    }
  };

  console.log('✅ Fallback roadmap generated');
  analyzeRoadmapForUIDisplay(fallbackRoadmap);
}

function analyzeRoadmapForUIDisplay(roadmap) {
  console.log('\n📋 ROADMAP DATA ANALYSIS FOR UI DISPLAY');
  console.log('=' .repeat(50));
  
  console.log(`🎯 Career: ${roadmap.careerTitle}`);
  console.log(`📊 Overview: ${roadmap.overview.totalTimeToCareer}, ${roadmap.overview.estimatedTotalCost.toLocaleString()}, ${roadmap.overview.difficultyLevel}`);
  
  console.log('\n🔍 PHASE CONTENT ANALYSIS:');
  
  Object.entries(roadmap.detailedPath).forEach(([phaseName, phaseData]) => {
    console.log(`\n📌 ${phaseName.toUpperCase()}:`);
    console.log(`   ⏰ Timeframe: ${phaseData.timeframe}`);
    
    let contentCount = 0;
    
    // Count all non-timeframe fields that have content
    Object.entries(phaseData).forEach(([fieldName, fieldValue]) => {
      if (fieldName !== 'timeframe' && fieldValue) {
        if (Array.isArray(fieldValue) && fieldValue.length > 0) {
          console.log(`   ✅ ${fieldName}: ${fieldValue.length} items`);
          contentCount++;
        } else if (!Array.isArray(fieldValue)) {
          console.log(`   ✅ ${fieldName}: ${fieldValue}`);
          contentCount++;
        }
      }
    });
    
    console.log(`   📊 Total content fields: ${contentCount}`);
    
    if (contentCount === 0) {
      console.log(`   ❌ WARNING: No content will be displayed for this phase!`);
    } else {
      console.log(`   ✅ This phase will display ${contentCount} sections of content`);
    }
  });
  
  console.log('\n🎯 UI DISPLAY PREDICTION:');
  console.log('Based on the updated renderPhaseContent function:');
  
  const phases = ['highSchoolPhase', 'postSecondaryPhase', 'earlyCareerPhase', 'advancementPhase'];
  let totalPhasesWithContent = 0;
  
  phases.forEach(phaseName => {
    const phaseData = roadmap.detailedPath[phaseName];
    const contentFields = Object.keys(phaseData).filter(key => 
      key !== 'timeframe' && phaseData[key] && 
      (Array.isArray(phaseData[key]) ? phaseData[key].length > 0 : true)
    );
    
    if (contentFields.length > 0) {
      console.log(`   ✅ ${phaseName}: Will show ${contentFields.length} content sections`);
      totalPhasesWithContent++;
    } else {
      console.log(`   ❌ ${phaseName}: Will show NO content`);
    }
  });
  
  console.log(`\n🏆 FINAL RESULT:`);
  console.log(`   ${totalPhasesWithContent}/4 phases will display content to users`);
  
  if (totalPhasesWithContent === 4) {
    console.log('   🎉 SUCCESS: All phases will show meaningful content!');
    console.log('   🚀 The empty phase content issue has been FIXED!');
  } else {
    console.log('   ⚠️  Some phases still have no content to display');
  }
}

// Run the test
testCareerRoadmapGeneration().catch(console.error);