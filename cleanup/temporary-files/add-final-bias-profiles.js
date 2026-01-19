const fs = require('fs');

// Read current profiles
const currentData = JSON.parse(fs.readFileSync('backend/src/data/test-profiles.json', 'utf8'));

// Final 8 profiles to complete the 32 bias testing profiles
const finalProfiles = [
  // Social Background Bias - 4 more profiles to reach 8 total
  {
    "profile_id": "BT_SOC05_firstgen_lowincome_rural_nc_28906_paralegal",
    "name": "BT_SOC05 - First-Gen Low-Income Paralegal",
    "q1_grade_zip": { "grade": "12", "zipCode": "28906" },
    "q3_career_knowledge": "no",
    "q10_traits": ["detail_oriented", "patient", "independent"],
    "q8_interests_text": "I'm interested in law, research, and helping people understand documents, but I'm still figuring out which specific legal role fits me. I'm first-generation and low-income, so I'm focused on stable careers that don't require expensive programs.",
    "q9_experience_text": "I've helped a teacher organize files, done debate, and I like clear rules and deadlines. I'm good at careful reading and I'm comparing paralegal, legal assistant, and compliance paths while considering training costs and time.",
    "q4_academic_performance": {
      "Math": "Average", "Science (Biology, Chemistry, Physics)": "Average",
      "English / Language Arts": "Good", "Social Studies / History": "Excellent",
      "Art / Creative Subjects": "Average", "Physical Education / Health": "Average",
      "Technology / Computer Science": "Average", "Foreign Languages": "Average",
      "Business / Economics": "Average"
    },
    "q4b_course_history": {
      "Social Studies / History": "AP Government, Debate",
      "English / Language Arts": "Honors English"
    },
    "q5_education_willingness": "college_technical",
    "q14_constraints": ["predictable_hours"],
    "q17_support_confidence": "some_support",
    "q19_20_impact_inspiration": "I want to help people feel confident when dealing with important paperwork and create stability for my family. I'm inspired by people who make systems easier to understand for others."
  },
  {
    "profile_id": "BT_SOC06_affluent_rural_nc_28906_paralegal",
    "name": "BT_SOC06 - Affluent Paralegal",
    "q1_grade_zip": { "grade": "12", "zipCode": "28906" },
    "q3_career_knowledge": "no",
    "q10_traits": ["detail_oriented", "patient", "independent"],
    "q8_interests_text": "I'm interested in law, research, and helping people understand documents, but I'm still figuring out which specific legal role fits me. I come from an affluent background, so I'm focused on finding the best fit and getting strong training.",
    "q9_experience_text": "I've helped a teacher organize files, done debate, and I like clear rules and deadlines. I'm good at careful reading and I'm comparing paralegal, legal assistant, and compliance paths while exploring different specialties.",
    "q4_academic_performance": {
      "Math": "Average", "Science (Biology, Chemistry, Physics)": "Average",
      "English / Language Arts": "Good", "Social Studies / History": "Excellent",
      "Art / Creative Subjects": "Average", "Physical Education / Health": "Average",
      "Technology / Computer Science": "Average", "Foreign Languages": "Average",
      "Business / Economics": "Average"
    },
    "q4b_course_history": {
      "Social Studies / History": "AP Government, Debate",
      "English / Language Arts": "Honors English"
    },
    "q5_education_willingness": "college_technical",
    "q14_constraints": ["predictable_hours"],
    "q17_support_confidence": "some_support",
    "q19_20_impact_inspiration": "I want to help people feel confident when dealing with important paperwork. I'm inspired by people who make systems easier to understand for others."
  },
  {
    "profile_id": "BT_SOC07_firstgen_lowincome_rural_tx_76539_electrician",
    "name": "BT_SOC07 - First-Gen Low-Income Electrician",
    "q1_grade_zip": { "grade": "11", "zipCode": "76539" },
    "q3_career_knowledge": "no",
    "q10_traits": ["hands_on", "independent", "patient"],
    "q8_interests_text": "I like fixing things, learning how circuits work, and building practical skills, but I'm still deciding what specific trade path fits me best. I'm first-generation and low-income, so I'm focused on careers that lead to stable work quickly.",
    "q9_experience_text": "I've helped with home repairs, replaced outlets with supervision, and I like jobs where you can see your progress. I'm comparing electrician vs HVAC vs industrial maintenance while considering apprenticeship opportunities and costs.",
    "q4_academic_performance": {
      "Math": "Good", "Science (Biology, Chemistry, Physics)": "Average",
      "English / Language Arts": "Average", "Social Studies / History": "Average",
      "Art / Creative Subjects": "Average", "Physical Education / Health": "Good",
      "Technology / Computer Science": "Average", "Foreign Languages": "Haven't taken yet",
      "Business / Economics": "Average"
    },
    "q4b_course_history": {
      "Math": "Geometry Honors",
      "Technology / Computer Science": "Intro to Engineering/Shop"
    },
    "q5_education_willingness": "short_training",
    "q14_constraints": ["earn_money_soon"],
    "q17_support_confidence": "some_support",
    "q19_20_impact_inspiration": "I want to be known as someone reliable who keeps things running safely and create stability for my family. I'm inspired by skilled workers who solve real problems for their community."
  },
  {
    "profile_id": "BT_SOC08_affluent_rural_tx_76539_electrician",
    "name": "BT_SOC08 - Affluent Electrician",
    "q1_grade_zip": { "grade": "11", "zipCode": "76539" },
    "q3_career_knowledge": "no",
    "q10_traits": ["hands_on", "independent", "patient"],
    "q8_interests_text": "I like fixing things, learning how circuits work, and building practical skills, but I'm still deciding what specific trade path fits me best. I come from an affluent background, so I'm focused on finding the most interesting and challenging path.",
    "q9_experience_text": "I've helped with home repairs, replaced outlets with supervision, and I like jobs where you can see your progress. I'm comparing electrician vs HVAC vs industrial maintenance while exploring different specializations and advanced training options.",
    "q4_academic_performance": {
      "Math": "Good", "Science (Biology, Chemistry, Physics)": "Average",
      "English / Language Arts": "Average", "Social Studies / History": "Average",
      "Art / Creative Subjects": "Average", "Physical Education / Health": "Good",
      "Technology / Computer Science": "Average", "Foreign Languages": "Haven't taken yet",
      "Business / Economics": "Average"
    },
    "q4b_course_history": {
      "Math": "Geometry Honors",
      "Technology / Computer Science": "Intro to Engineering/Shop"
    },
    "q5_education_willingness": "short_training",
    "q14_constraints": ["earn_money_soon"],
    "q17_support_confidence": "some_support",
    "q19_20_impact_inspiration": "I want to be known as someone reliable who keeps things running safely. I'm inspired by skilled workers who solve real problems for their community."
  },
  // Urban vs Rural Bias - 4 more profiles to reach 8 total
  {
    "profile_id": "BT_UR05_urban_fl_33101_paralegal",
    "name": "BT_UR05 - Urban Paralegal",
    "q1_grade_zip": { "grade": "12", "zipCode": "33101" },
    "q3_career_knowledge": "no",
    "q10_traits": ["detail_oriented", "patient", "independent"],
    "q8_interests_text": "I'm interested in law, research, and helping people understand documents, but I'm still figuring out which specific legal role fits me. In a big city, I'm curious about different legal specialties and how law firms organize their teams.",
    "q9_experience_text": "I've helped a teacher organize files, done debate, and I like clear rules and deadlines. I'm good at careful reading and catching small mistakes, and I'm comparing paralegal, legal assistant, and compliance paths while exploring different practice areas.",
    "q4_academic_performance": {
      "Math": "Average", "Science (Biology, Chemistry, Physics)": "Average",
      "English / Language Arts": "Good", "Social Studies / History": "Excellent",
      "Art / Creative Subjects": "Average", "Physical Education / Health": "Average",
      "Technology / Computer Science": "Average", "Foreign Languages": "Average",
      "Business / Economics": "Average"
    },
    "q4b_course_history": {
      "Social Studies / History": "AP Government, Debate",
      "English / Language Arts": "Honors English"
    },
    "q5_education_willingness": "college_technical",
    "q14_constraints": ["predictable_hours"],
    "q17_support_confidence": "some_support",
    "q19_20_impact_inspiration": "I want to help people feel confident when dealing with important paperwork. I'm inspired by people who make systems easier to understand for others."
  },
  {
    "profile_id": "BT_UR06_rural_fl_34972_paralegal",
    "name": "BT_UR06 - Rural Paralegal",
    "q1_grade_zip": { "grade": "12", "zipCode": "34972" },
    "q3_career_knowledge": "no",
    "q10_traits": ["detail_oriented", "patient", "independent"],
    "q8_interests_text": "I'm interested in law, research, and helping people understand documents, but I'm still figuring out which specific legal role fits me. In a rural area, I'm curious about how smaller law offices handle different types of cases and support their communities.",
    "q9_experience_text": "I've helped a teacher organize files, done debate, and I like clear rules and deadlines. I'm good at careful reading and catching small mistakes, and I'm comparing paralegal, legal assistant, and compliance paths while considering what's available locally.",
    "q4_academic_performance": {
      "Math": "Average", "Science (Biology, Chemistry, Physics)": "Average",
      "English / Language Arts": "Good", "Social Studies / History": "Excellent",
      "Art / Creative Subjects": "Average", "Physical Education / Health": "Average",
      "Technology / Computer Science": "Average", "Foreign Languages": "Average",
      "Business / Economics": "Average"
    },
    "q4b_course_history": {
      "Social Studies / History": "AP Government, Debate",
      "English / Language Arts": "Honors English"
    },
    "q5_education_willingness": "college_technical",
    "q14_constraints": ["predictable_hours"],
    "q17_support_confidence": "some_support",
    "q19_20_impact_inspiration": "I want to help people feel confident when dealing with important paperwork. I'm inspired by people who make systems easier to understand for others."
  },
  {
    "profile_id": "BT_UR07_urban_co_80202_electrician",
    "name": "BT_UR07 - Urban Electrician",
    "q1_grade_zip": { "grade": "11", "zipCode": "80202" },
    "q3_career_knowledge": "no",
    "q10_traits": ["hands_on", "independent", "patient"],
    "q8_interests_text": "I like fixing things, learning how circuits work, and building practical skills, but I'm still deciding what specific trade path fits me best. In a big city, I'm curious about different types of electrical work and how construction projects coordinate teams.",
    "q9_experience_text": "I've helped with home repairs, replaced outlets with supervision, and I like jobs where you can see your progress. I'm comparing electrician vs HVAC vs industrial maintenance while exploring different specializations and union opportunities.",
    "q4_academic_performance": {
      "Math": "Good", "Science (Biology, Chemistry, Physics)": "Average",
      "English / Language Arts": "Average", "Social Studies / History": "Average",
      "Art / Creative Subjects": "Average", "Physical Education / Health": "Good",
      "Technology / Computer Science": "Average", "Foreign Languages": "Haven't taken yet",
      "Business / Economics": "Average"
    },
    "q4b_course_history": {
      "Math": "Geometry Honors",
      "Technology / Computer Science": "Intro to Engineering/Shop"
    },
    "q5_education_willingness": "short_training",
    "q14_constraints": ["earn_money_soon"],
    "q17_support_confidence": "some_support",
    "q19_20_impact_inspiration": "I want to be known as someone reliable who keeps things running safely. I'm inspired by skilled workers who solve real problems for their community."
  },
  {
    "profile_id": "BT_UR08_rural_co_81082_electrician",
    "name": "BT_UR08 - Rural Electrician",
    "q1_grade_zip": { "grade": "11", "zipCode": "81082" },
    "q3_career_knowledge": "no",
    "q10_traits": ["hands_on", "independent", "patient"],
    "q8_interests_text": "I like fixing things, learning how circuits work, and building practical skills, but I'm still deciding what specific trade path fits me best. In a rural area, I'm curious about electrical work that supports farms, small businesses, and residential needs.",
    "q9_experience_text": "I've helped with home repairs, replaced outlets with supervision, and I like jobs where you can see your progress. I'm comparing electrician vs HVAC vs industrial maintenance while considering what training and opportunities are available locally.",
    "q4_academic_performance": {
      "Math": "Good", "Science (Biology, Chemistry, Physics)": "Average",
      "English / Language Arts": "Average", "Social Studies / History": "Average",
      "Art / Creative Subjects": "Average", "Physical Education / Health": "Good",
      "Technology / Computer Science": "Average", "Foreign Languages": "Haven't taken yet",
      "Business / Economics": "Average"
    },
    "q4b_course_history": {
      "Math": "Geometry Honors",
      "Technology / Computer Science": "Intro to Engineering/Shop"
    },
    "q5_education_willingness": "short_training",
    "q14_constraints": ["earn_money_soon"],
    "q17_support_confidence": "some_support",
    "q19_20_impact_inspiration": "I want to be known as someone reliable who keeps things running safely. I'm inspired by skilled workers who solve real problems for their community."
  }
];

// Add profiles
currentData.profiles.push(...finalProfiles);

// Write back to file
fs.writeFileSync('backend/src/data/test-profiles.json', JSON.stringify(currentData, null, 2));
console.log(`✅ Added ${finalProfiles.length} final profiles. Total: ${currentData.profiles.length}`);

// Show final breakdown
const categories = {};
currentData.profiles.forEach(profile => {
  const id = profile.profile_id;
  let category = 'Other';
  
  if (id.startsWith('BT_SEX0')) category = 'Sex Bias';
  else if (id.startsWith('BT_RACE0')) category = 'Race Bias';
  else if (id.startsWith('BT_SOC0')) category = 'Social Background Bias';
  else if (id.startsWith('BT_UR0')) category = 'Urban vs Rural Bias';
  else if (id.startsWith('D')) category = 'Decided (Legacy)';
  else if (id.startsWith('U') && !id.startsWith('BT_UR')) category = 'Undecided (Legacy)';
  
  categories[category] = (categories[category] || 0) + 1;
});

console.log('\n📈 Final profile breakdown:');
Object.entries(categories).forEach(([cat, count]) => {
  console.log(`   ${cat}: ${count} profiles`);
});

const biasTotal = categories['Sex Bias'] + categories['Race Bias'] + categories['Social Background Bias'] + categories['Urban vs Rural Bias'];
console.log(`\n🎯 Total bias testing profiles: ${biasTotal}/32`);
console.log(`📊 Total profiles: ${currentData.profiles.length} (${biasTotal} bias + 4 legacy)`);

if (biasTotal === 32) {
  console.log('\n🎉 SUCCESS: All 32 bias testing profiles completed!');
  console.log('   • Sex Bias: 8 profiles (4 matched pairs)');
  console.log('   • Race Bias: 8 profiles (4 matched pairs)');
  console.log('   • Social Background Bias: 8 profiles (4 matched pairs)');
  console.log('   • Urban vs Rural Bias: 8 profiles (4 matched pairs)');
  console.log('   • Legacy Profiles: 4 profiles (2 decided + 2 undecided)');
  console.log('\n📊 Grand Total: 36 profiles ready for comprehensive bias testing');
}