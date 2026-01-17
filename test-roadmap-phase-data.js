// Test Roadmap Phase Data
// This tests what data is actually being generated for each phase and identifies missing fields

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

// Expected phase fields based on CareerPhase interface
const expectedPhaseFields = {
  highSchoolPhase: [
    'timeframe',
    'requiredCourses',
    'recommendedCourses', 
    'extracurriculars',
    'skillsToFocus',
    'milestones'
  ],
  postSecondaryPhase: [
    'timeframe',
    'educationType',
    'specificPrograms',
    'estimatedCost',
    'keyRequirements',
    'internshipOpportunities'
  ],
  earlyCareerPhase: [
    'timeframe',
    'entryLevelPositions',
    'certifications',
    'skillDevelopment',
    'networkingTips'
  ],
  advancementPhase: [
    'timeframe',
    'careerProgression',
    'advancedCertifications',
    'leadershipOpportunities',
    'salaryProgression'
  ]
};

// Fields currently handled by renderPhaseContent
const renderedFields = [
  'requiredCourses',
  'recommendedCourses',
  'skillsToFocus',
  'milestones',
  'specificPrograms',
  'estimatedCost'
];

// Test the fallback roadmap data
function testFallbackRoadmapData() {
  console.log('🧪 TESTING FALLBACK ROADMAP DATA STRUCTURE');
  console.log('=' .repeat(60));
  
  // This is the fallback data from CareerRoadmapView.tsx
  const fallbackRoadmap = {
    careerTitle: mockCareer.title,
    overview: {
      totalTimeToCareer: '4-6 years',
      estimatedTotalCost: 50000,
      educationLevel: mockCareer.requiredEducation,
      difficultyLevel: 'Intermediate',
      jobAvailability: 'Medium'
    },
    detailedPath: {
      highSchoolPhase: {
        timeframe: 'Grade 9-12',
        requiredCourses: ['English', 'Mathematics', 'Science'],
        recommendedCourses: ['Electives related to career field'],
        skillsToFocus: ['Communication', 'Problem-solving', 'Critical thinking'],
        milestones: ['Maintain good grades', 'Explore career through activities']
      },
      postSecondaryPhase: {
        timeframe: '2-4 years after high school',
        educationType: mockCareer.requiredEducation,
        specificPrograms: [`Programs related to ${mockCareer.title}`],
        estimatedCost: 40000,
        keyRequirements: ['High school diploma', 'Good academic standing'],
        internshipOpportunities: ['Industry-related internships']
      },
      earlyCareerPhase: {
        timeframe: 'Years 1-3 in career',
        entryLevelPositions: [`Entry-level ${mockCareer.title} positions`],
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
    }
  };
  
  console.log('📊 PHASE DATA ANALYSIS:');
  console.log('');
  
  Object.entries(fallbackRoadmap.detailedPath).forEach(([phaseName, phaseData]) => {
    console.log(`🔍 ${phaseName.toUpperCase()}:`);
    console.log(`   Timeframe: ${phaseData.timeframe}`);
    
    // Check which expected fields are present
    const expectedFields = expectedPhaseFields[phaseName] || [];
    const presentFields = [];
    const missingFields = [];
    
    expectedFields.forEach(field => {
      if (phaseData.hasOwnProperty(field) && phaseData[field]) {
        presentFields.push(field);
      } else {
        missingFields.push(field);
      }
    });
    
    console.log(`   Present fields (${presentFields.length}): ${presentFields.join(', ')}`);
    if (missingFields.length > 0) {
      console.log(`   Missing fields (${missingFields.length}): ${missingFields.join(', ')}`);
    }
    
    // Check which fields are rendered by the UI
    const renderedInUI = presentFields.filter(field => renderedFields.includes(field));
    const notRenderedInUI = presentFields.filter(field => !renderedFields.includes(field));
    
    console.log(`   ✅ Rendered in UI (${renderedInUI.length}): ${renderedInUI.join(', ')}`);
    if (notRenderedInUI.length > 0) {
      console.log(`   ❌ NOT rendered in UI (${notRenderedInUI.length}): ${notRenderedInUI.join(', ')}`);
    }
    
    console.log('');
  });
  
  return fallbackRoadmap;
}

// Test what fields are missing from renderPhaseContent
function testMissingUIFields() {
  console.log('🎨 UI RENDERING ANALYSIS');
  console.log('=' .repeat(60));
  
  console.log('📋 Fields currently handled by renderPhaseContent:');
  renderedFields.forEach(field => {
    console.log(`   ✅ ${field}`);
  });
  
  console.log('\n🚫 Fields NOT handled by renderPhaseContent:');
  
  // Collect all unique fields from all phases
  const allPhaseFields = new Set();
  Object.values(expectedPhaseFields).forEach(fields => {
    fields.forEach(field => allPhaseFields.add(field));
  });
  
  const missingFromUI = Array.from(allPhaseFields).filter(field => !renderedFields.includes(field));
  missingFromUI.forEach(field => {
    console.log(`   ❌ ${field}`);
  });
  
  console.log(`\n📊 Summary:`);
  console.log(`   Total unique fields: ${allPhaseFields.size}`);
  console.log(`   Rendered in UI: ${renderedFields.length}`);
  console.log(`   Missing from UI: ${missingFromUI.length}`);
  console.log(`   UI Coverage: ${Math.round((renderedFields.length / allPhaseFields.size) * 100)}%`);
  
  return missingFromUI;
}

// Test specific phase content
function testPhaseContent(roadmap) {
  console.log('🔍 DETAILED PHASE CONTENT ANALYSIS');
  console.log('=' .repeat(60));
  
  Object.entries(roadmap.detailedPath).forEach(([phaseName, phaseData]) => {
    console.log(`\n📋 ${phaseName.toUpperCase()} CONTENT:`);
    
    Object.entries(phaseData).forEach(([fieldName, fieldValue]) => {
      const isRendered = renderedFields.includes(fieldName);
      const status = isRendered ? '✅' : '❌';
      
      if (Array.isArray(fieldValue)) {
        console.log(`   ${status} ${fieldName} (${fieldValue.length} items):`);
        fieldValue.forEach((item, index) => {
          console.log(`      ${index + 1}. ${item}`);
        });
      } else {
        console.log(`   ${status} ${fieldName}: ${fieldValue}`);
      }
    });
  });
}

// Simulate what user sees in UI
function simulateUIDisplay(roadmap) {
  console.log('\n👁️  SIMULATED UI DISPLAY');
  console.log('=' .repeat(60));
  
  Object.entries(roadmap.detailedPath).forEach(([phaseName, phaseData]) => {
    console.log(`\n🎯 ${phaseName.replace(/([A-Z])/g, ' $1').trim().toUpperCase()} PHASE`);
    console.log(`   Timeframe: ${phaseData.timeframe}`);
    
    let hasVisibleContent = false;
    
    // Simulate the renderPhaseContent logic
    if (phaseData.requiredCourses && phaseData.requiredCourses.length > 0) {
      console.log(`   📚 Required Courses: ${phaseData.requiredCourses.join(', ')}`);
      hasVisibleContent = true;
    }
    
    if (phaseData.recommendedCourses && phaseData.recommendedCourses.length > 0) {
      console.log(`   📖 Recommended Courses: ${phaseData.recommendedCourses.join(', ')}`);
      hasVisibleContent = true;
    }
    
    if (phaseData.skillsToFocus && phaseData.skillsToFocus.length > 0) {
      console.log(`   🎯 Skills to Focus: ${phaseData.skillsToFocus.join(', ')}`);
      hasVisibleContent = true;
    }
    
    if (phaseData.milestones && phaseData.milestones.length > 0) {
      console.log(`   🏆 Milestones: ${phaseData.milestones.join(', ')}`);
      hasVisibleContent = true;
    }
    
    if (phaseData.specificPrograms && phaseData.specificPrograms.length > 0) {
      console.log(`   🎓 Programs: ${phaseData.specificPrograms.join(', ')}`);
      hasVisibleContent = true;
    }
    
    if (phaseData.estimatedCost) {
      console.log(`   💰 Cost: $${phaseData.estimatedCost.toLocaleString()}`);
      hasVisibleContent = true;
    }
    
    if (!hasVisibleContent) {
      console.log(`   ⚠️  NO VISIBLE CONTENT - All fields are missing or not rendered!`);
    }
  });
}

// Run all tests
console.log('🧪 ROADMAP PHASE DATA TESTING SUITE');
console.log('=' .repeat(80));

const roadmap = testFallbackRoadmapData();
const missingFields = testMissingUIFields();
testPhaseContent(roadmap);
simulateUIDisplay(roadmap);

console.log('\n🎯 DIAGNOSIS');
console.log('=' .repeat(40));
console.log('✅ High School phase shows content because it has:');
console.log('   - requiredCourses ✅');
console.log('   - recommendedCourses ✅');
console.log('   - skillsToFocus ✅');
console.log('   - milestones ✅');

console.log('\n❌ Other phases show nothing because they have:');
console.log('   - postSecondary: educationType, keyRequirements, internshipOpportunities (not rendered)');
console.log('   - earlyCareer: entryLevelPositions, certifications, skillDevelopment, networkingTips (not rendered)');
console.log('   - advancement: careerProgression, advancedCertifications, leadershipOpportunities, salaryProgression (not rendered)');

console.log('\n🔧 SOLUTION NEEDED:');
console.log('   Update renderPhaseContent to handle ALL phase-specific fields');
console.log(`   Missing UI fields: ${missingFields.join(', ')}`);