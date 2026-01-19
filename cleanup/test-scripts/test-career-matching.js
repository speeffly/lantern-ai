#!/usr/bin/env node

/**
 * Test career matching algorithm with expanded sectors
 */

// Simple test without external dependencies
function testCareerMatching() {
  console.log('🧪 Testing Career Matching Algorithm with Expanded Sectors');
  console.log('='.repeat(70));

  // Test data for different interest profiles
  const testProfiles = [
    {
      name: 'Healthcare Student',
      interests: ['Healthcare', 'Helping Others'],
      skills: ['Communication', 'Empathy'],
      workEnvironment: 'indoor',
      educationGoal: 'associate',
      expectedTopSectors: ['healthcare']
    },
    {
      name: 'Technology Student',
      interests: ['Technology', 'Problem Solving'],
      skills: ['Programming', 'Analytical Thinking'],
      workEnvironment: 'indoor',
      educationGoal: 'bachelor',
      expectedTopSectors: ['technology']
    },
    {
      name: 'Creative Student',
      interests: ['Creative', 'Art'],
      skills: ['Design', 'Creativity'],
      workEnvironment: 'mixed',
      educationGoal: 'associate',
      expectedTopSectors: ['creative']
    },
    {
      name: 'Business Student',
      interests: ['Business', 'Leadership'],
      skills: ['Communication', 'Organization'],
      workEnvironment: 'indoor',
      educationGoal: 'bachelor',
      expectedTopSectors: ['business', 'finance']
    },
    {
      name: 'Hands-on Student',
      interests: ['Hands-on Work', 'Building'],
      skills: ['Problem Solving', 'Technical Skills'],
      workEnvironment: 'outdoor',
      educationGoal: 'certificate',
      expectedTopSectors: ['infrastructure', 'manufacturing']
    }
  ];

  // Mock career data representing our expanded database
  const mockCareers = [
    { id: 'rn-001', title: 'Registered Nurse', sector: 'healthcare', averageSalary: 75000, requiredEducation: 'associate' },
    { id: 'webdev-001', title: 'Web Developer', sector: 'technology', averageSalary: 65000, requiredEducation: 'associate' },
    { id: 'graph-001', title: 'Graphic Designer', sector: 'creative', averageSalary: 45000, requiredEducation: 'associate' },
    { id: 'admin-001', title: 'Administrative Assistant', sector: 'business', averageSalary: 38000, requiredEducation: 'certificate' },
    { id: 'elec-001', title: 'Electrician', sector: 'infrastructure', averageSalary: 60000, requiredEducation: 'certificate' },
    { id: 'elem-teach-001', title: 'Elementary Teacher', sector: 'education', averageSalary: 55000, requiredEducation: 'bachelor' },
    { id: 'police-001', title: 'Police Officer', sector: 'public-service', averageSalary: 55000, requiredEducation: 'certificate' },
    { id: 'farm-001', title: 'Farm Worker', sector: 'agriculture', averageSalary: 28000, requiredEducation: 'high-school' },
    { id: 'truck-001', title: 'Truck Driver', sector: 'transportation', averageSalary: 48000, requiredEducation: 'certificate' },
    { id: 'chef-001', title: 'Cook/Chef', sector: 'hospitality', averageSalary: 35000, requiredEducation: 'certificate' },
    { id: 'mach-001', title: 'Machine Operator', sector: 'manufacturing', averageSalary: 38000, requiredEducation: 'high-school' },
    { id: 'retail-001', title: 'Retail Sales Associate', sector: 'retail', averageSalary: 26000, requiredEducation: 'high-school' },
    { id: 'account-001', title: 'Bookkeeper', sector: 'finance', averageSalary: 42000, requiredEducation: 'certificate' }
  ];

  console.log(`📊 Testing with ${mockCareers.length} careers across ${new Set(mockCareers.map(c => c.sector)).size} sectors`);
  console.log('Sectors:', [...new Set(mockCareers.map(c => c.sector))].join(', '));

  // Test each profile
  testProfiles.forEach((profile, index) => {
    console.log(`\n${index + 1}. Testing: ${profile.name}`);
    console.log('   Interests:', profile.interests.join(', '));
    console.log('   Expected top sectors:', profile.expectedTopSectors.join(', '));

    // Simple matching algorithm (mimicking the enhanced version)
    const matches = mockCareers.map(career => {
      let score = 0;
      let maxScore = 100;

      // Interest alignment (40 points)
      const interestScore = calculateInterestScore(profile.interests, career.sector);
      score += interestScore * 0.4;

      // Education alignment (30 points)
      const educationScore = calculateEducationScore(profile.educationGoal, career.requiredEducation);
      score += educationScore * 0.3;

      // Work environment alignment (20 points)
      const environmentScore = calculateEnvironmentScore(profile.workEnvironment, career.sector);
      score += environmentScore * 0.2;

      // Skills alignment (10 points) - simplified
      score += 0.1 * 100; // Assume some skill match

      return {
        career,
        matchScore: Math.round(score)
      };
    }).sort((a, b) => b.matchScore - a.matchScore);

    // Show top 3 matches
    console.log('   Top 3 matches:');
    matches.slice(0, 3).forEach((match, i) => {
      console.log(`   ${i + 1}. ${match.career.title} (${match.career.sector}) - ${match.matchScore}%`);
    });

    // Check if expected sectors are in top matches
    const topSectors = matches.slice(0, 3).map(m => m.career.sector);
    const hasExpectedSector = profile.expectedTopSectors.some(sector => topSectors.includes(sector));
    
    if (hasExpectedSector) {
      console.log('   ✅ PASS: Expected sector found in top matches');
    } else {
      console.log('   ❌ FAIL: Expected sector not in top matches');
      console.log('   Expected:', profile.expectedTopSectors.join(', '));
      console.log('   Got:', topSectors.join(', '));
    }
  });

  console.log('\n' + '='.repeat(70));
  console.log('🧪 Career Matching Test Complete');
}

// Helper functions for scoring
function calculateInterestScore(interests, sector) {
  const sectorMappings = {
    'Healthcare': ['healthcare'],
    'Technology': ['technology'],
    'Creative': ['creative'],
    'Art': ['creative'],
    'Business': ['business', 'finance'],
    'Leadership': ['business', 'finance', 'education', 'public-service'],
    'Hands-on Work': ['infrastructure', 'manufacturing', 'agriculture', 'transportation'],
    'Building': ['infrastructure', 'manufacturing'],
    'Helping Others': ['healthcare', 'education', 'public-service'],
    'Problem Solving': ['technology', 'business', 'science'],
    'Community Impact': ['public-service', 'education', 'healthcare']
  };

  let score = 0;
  interests.forEach(interest => {
    const matchingSectors = sectorMappings[interest] || [];
    if (matchingSectors.includes(sector)) {
      score += 100 / interests.length; // Distribute 100 points across interests
    }
  });

  return Math.min(100, score);
}

function calculateEducationScore(studentGoal, careerRequired) {
  const levels = { 'high-school': 1, 'certificate': 2, 'associate': 3, 'bachelor': 4 };
  const studentLevel = levels[studentGoal] || 2;
  const careerLevel = levels[careerRequired] || 2;

  if (studentLevel >= careerLevel) return 100;
  if (studentLevel === careerLevel - 1) return 70;
  return 40;
}

function calculateEnvironmentScore(preference, sector) {
  const indoorSectors = ['technology', 'business', 'finance', 'education', 'healthcare'];
  const outdoorSectors = ['agriculture', 'infrastructure', 'transportation'];
  const mixedSectors = ['public-service', 'hospitality', 'retail', 'manufacturing', 'creative'];

  if (preference === 'indoor' && indoorSectors.includes(sector)) return 100;
  if (preference === 'outdoor' && outdoorSectors.includes(sector)) return 100;
  if (preference === 'mixed' && mixedSectors.includes(sector)) return 100;
  if (preference === 'mixed') return 70; // Mixed gets partial points for any
  return 50; // Partial points for mismatch
}

// Run the test
testCareerMatching();