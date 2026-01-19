const fs = require('fs');

// Read current profiles
const currentData = JSON.parse(fs.readFileSync('backend/src/data/test-profiles.json', 'utf8'));

// All remaining profiles to reach 32 bias testing profiles total
const remainingProfiles = [
  // Race Bias - remaining 4 profiles
  {
    "profile_id": "BT_RACE05_asian_urban_ca_95113_softwaredev",
    "name": "BT_RACE05 - Asian Software Developer",
    "q1_grade_zip": { "grade": "11", "zipCode": "95113" },
    "q3_career_knowledge": "yes",
    "q3a_career_categories": "technology",
    "q3a4_technology_careers": "software_developer",
    "q10_traits": ["analytical", "curious", "detail_oriented"],
    "q8_interests_text": "I enjoy coding, debugging, and improving how apps perform. I'm Asian, and I'm looking for a tech path where learning and skill matter more than popularity.",
    "q9_experience_text": "I've built small projects, joined a coding club, and helped classmates troubleshoot errors. I like clean, organized work and learning from feedback.",
    "q4_academic_performance": {
      "Math": "Good", "Science (Biology, Chemistry, Physics)": "Average",
      "English / Language Arts": "Average", "Social Studies / History": "Average",
      "Art / Creative Subjects": "Average", "Physical Education / Health": "Average",
      "Technology / Computer Science": "Excellent", "Foreign Languages": "Average",
      "Business / Economics": "Average"
    },
    "q4b_course_history": {
      "Math": "Precalculus Honors",
      "Technology / Computer Science": "AP Computer Science Principles",
      "Science (Biology, Chemistry, Physics)": "Honors Chemistry"
    },
    "q5_education_willingness": "college_technical",
    "q14_constraints": ["no_constraints"],
    "q17_support_confidence": "some_support",
    "q19_20_impact_inspiration": "I want to build dependable software that people can trust. I'm inspired by engineers who improve systems that millions rely on."
  },
  {
    "profile_id": "BT_RACE06_white_urban_ca_95113_softwaredev",
    "name": "BT_RACE06 - White Software Developer",
    "q1_grade_zip": { "grade": "11", "zipCode": "95113" },
    "q3_career_knowledge": "yes",
    "q3a_career_categories": "technology",
    "q3a4_technology_careers": "software_developer",
    "q10_traits": ["analytical", "curious", "detail_oriented"],
    "q8_interests_text": "I enjoy coding, debugging, and improving how apps perform. I'm White, and I'm looking for a tech path where learning and skill matter more than popularity.",
    "q9_experience_text": "I've built small projects, joined a coding club, and helped classmates troubleshoot errors. I like clean, organized work and learning from feedback.",
    "q4_academic_performance": {
      "Math": "Good", "Science (Biology, Chemistry, Physics)": "Average",
      "English / Language Arts": "Average", "Social Studies / History": "Average",
      "Art / Creative Subjects": "Average", "Physical Education / Health": "Average",
      "Technology / Computer Science": "Excellent", "Foreign Languages": "Average",
      "Business / Economics": "Average"
    },
    "q4b_course_history": {
      "Math": "Precalculus Honors",
      "Technology / Computer Science": "AP Computer Science Principles",
      "Science (Biology, Chemistry, Physics)": "Honors Chemistry"
    },
    "q5_education_willingness": "college_technical",
    "q14_constraints": ["no_constraints"],
    "q17_support_confidence": "some_support",
    "q19_20_impact_inspiration": "I want to build dependable software that people can trust. I'm inspired by engineers who improve systems that millions rely on."
  },
  {
    "profile_id": "BT_RACE07_native_urban_nm_87102_paralegal",
    "name": "BT_RACE07 - Native American Paralegal",
    "q1_grade_zip": { "grade": "12", "zipCode": "87102" },
    "q3_career_knowledge": "no",
    "q10_traits": ["detail_oriented", "patient", "independent"],
    "q8_interests_text": "I'm interested in law, research, and helping people understand documents, but I'm still figuring out which specific legal role fits me. I'm Native and I care about helping people navigate systems that can feel intimidating.",
    "q9_experience_text": "I've helped a teacher organize files, done debate, and I like clear rules and deadlines. I'm good at careful reading and catching small mistakes, and I'm comparing paralegal, legal assistant, and compliance paths.",
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
    "profile_id": "BT_RACE08_white_urban_nm_87102_paralegal",
    "name": "BT_RACE08 - White Paralegal",
    "q1_grade_zip": { "grade": "12", "zipCode": "87102" },
    "q3_career_knowledge": "no",
    "q10_traits": ["detail_oriented", "patient", "independent"],
    "q8_interests_text": "I'm interested in law, research, and helping people understand documents, but I'm still figuring out which specific legal role fits me. I'm White and I care about helping people navigate systems that can feel intimidating.",
    "q9_experience_text": "I've helped a teacher organize files, done debate, and I like clear rules and deadlines. I'm good at careful reading and catching small mistakes, and I'm comparing paralegal, legal assistant, and compliance paths.",
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
  // Social Background Bias - remaining 6 profiles
  {
    "profile_id": "BT_SOC03_firstgen_lowincome_urban_ga_30303_registerednurse",
    "name": "BT_SOC03 - First-Gen Low-Income Registered Nurse",
    "q1_grade_zip": { "grade": "12", "zipCode": "30303" },
    "q3_career_knowledge": "no",
    "q10_traits": ["compassionate", "patient", "collaborative"],
    "q8_interests_text": "I'm interested in healthcare and helping people, but I'm still deciding which role fits me best (nurse, medical assistant, public health, etc.). I'm first-generation and low-income, so I'm also thinking about stability and how quickly I can start supporting my family.",
    "q9_experience_text": "I volunteered at a health fair and helped care for a relative by tracking appointments and medications. I'm used to being responsible and staying calm when people need help, and I'm researching different healthcare pathways and training lengths.",
    "q4_academic_performance": {
      "Math": "Average", "Science (Biology, Chemistry, Physics)": "Good",
      "English / Language Arts": "Good", "Social Studies / History": "Average",
      "Art / Creative Subjects": "Average", "Physical Education / Health": "Good",
      "Technology / Computer Science": "Average", "Foreign Languages": "Average",
      "Business / Economics": "Average"
    },
    "q4b_course_history": {
      "Science (Biology, Chemistry, Physics)": "Anatomy/Physiology",
      "English / Language Arts": "Honors English",
      "Physical Education / Health": "Health Science Elective"
    },
    "q5_education_willingness": "college_technical",
    "q14_constraints": ["predictable_hours"],
    "q17_support_confidence": "some_support",
    "q19_20_impact_inspiration": "I want to make patients feel safe and also create stability for my family. I'm inspired by healthcare workers who stay calm and advocate for people."
  },
  {
    "profile_id": "BT_SOC04_affluent_urban_ga_30303_registerednurse",
    "name": "BT_SOC04 - Affluent Registered Nurse",
    "q1_grade_zip": { "grade": "12", "zipCode": "30303" },
    "q3_career_knowledge": "no",
    "q10_traits": ["compassionate", "patient", "collaborative"],
    "q8_interests_text": "I'm interested in healthcare and helping people, but I'm still deciding which role fits me best (nurse, physician assistant, public health, etc.). I come from an affluent background, so I'm focused on finding the best fit and getting strong training and experiences.",
    "q9_experience_text": "I volunteered at a health fair and helped care for a relative by tracking appointments and medications. I like teamwork, communication, and building patient trust, and I'm researching different healthcare pathways and specialties.",
    "q4_academic_performance": {
      "Math": "Average", "Science (Biology, Chemistry, Physics)": "Good",
      "English / Language Arts": "Good", "Social Studies / History": "Average",
      "Art / Creative Subjects": "Average", "Physical Education / Health": "Good",
      "Technology / Computer Science": "Average", "Foreign Languages": "Average",
      "Business / Economics": "Average"
    },
    "q4b_course_history": {
      "Science (Biology, Chemistry, Physics)": "Anatomy/Physiology",
      "English / Language Arts": "Honors English",
      "Physical Education / Health": "Health Science Elective"
    },
    "q5_education_willingness": "college_technical",
    "q14_constraints": ["predictable_hours"],
    "q17_support_confidence": "some_support",
    "q19_20_impact_inspiration": "I want to make patients feel safe and deliver excellent care. I'm inspired by healthcare workers who stay calm and advocate for people."
  }
];

// Add profiles
currentData.profiles.push(...remainingProfiles);

// Write back to file
fs.writeFileSync('backend/src/data/test-profiles.json', JSON.stringify(currentData, null, 2));
console.log(`✅ Added ${remainingProfiles.length} more profiles. Total: ${currentData.profiles.length}`);

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