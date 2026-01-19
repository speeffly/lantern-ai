const fs = require('fs');

// Read current profiles
const currentData = JSON.parse(fs.readFileSync('backend/src/data/test-profiles.json', 'utf8'));

// All remaining bias testing profiles from your complete JSON
const allRemainingProfiles = [
  // Complete Sex Bias profiles (missing 4)
  {
    "profile_id": "BT_SEX05_female_rural_nc_28906_paralegal",
    "name": "BT_SEX05 - Female Undecided Legal",
    "q1_grade_zip": { "grade": "12", "zipCode": "28906" },
    "q3_career_knowledge": "no",
    "q10_traits": ["detail_oriented", "patient", "independent"],
    "q8_interests_text": "I'm interested in law, research, and keeping important documents organized, but I'm not 100% sure what specific job I want yet. As a girl, I like roles where being precise and prepared really matters.",
    "q9_experience_text": "I enjoy debate and writing. I helped a teacher organize paperwork and I like clear rules, deadlines, and checklists. I'm still learning the differences between legal assistant, paralegal, and other law-related careers.",
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
    "q19_20_impact_inspiration": "I want to help people understand paperwork and make informed decisions. I'm inspired by people who protect others through careful, behind-the-scenes work."
  },
  {
    "profile_id": "BT_SEX06_male_rural_nc_28906_paralegal",
    "name": "BT_SEX06 - Male Undecided Legal",
    "q1_grade_zip": { "grade": "12", "zipCode": "28906" },
    "q3_career_knowledge": "no",
    "q10_traits": ["detail_oriented", "patient", "independent"],
    "q8_interests_text": "I'm interested in law, research, and keeping important documents organized, but I'm not 100% sure what specific job I want yet. As a guy, I like roles where being precise and prepared really matters.",
    "q9_experience_text": "I enjoy debate and writing. I helped a teacher organize paperwork and I like clear rules, deadlines, and checklists. I'm still learning the differences between legal assistant, paralegal, and other law-related careers.",
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
    "q19_20_impact_inspiration": "I want to help people understand paperwork and make informed decisions. I'm inspired by people who protect others through careful, behind-the-scenes work."
  },
  {
    "profile_id": "BT_SEX07_female_rural_tx_76539_electrician",
    "name": "BT_SEX07 - Female Undecided Trades",
    "q1_grade_zip": { "grade": "11", "zipCode": "76539" },
    "q3_career_knowledge": "no",
    "q10_traits": ["hands_on", "independent", "patient"],
    "q8_interests_text": "I like fixing things, learning how circuits work, and building practical skills, but I'm still deciding what specific trade path fits me best. As a girl, I want a hands-on career where I can prove what I can do through solid work.",
    "q9_experience_text": "I've helped with home repairs, replaced outlets with supervision, and I like jobs where you can see your progress at the end of the day. I'm comparing electrician vs HVAC vs industrial maintenance and trying to understand the training options.",
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
    "profile_id": "BT_SEX08_male_rural_tx_76539_electrician",
    "name": "BT_SEX08 - Male Undecided Trades",
    "q1_grade_zip": { "grade": "11", "zipCode": "76539" },
    "q3_career_knowledge": "no",
    "q10_traits": ["hands_on", "independent", "patient"],
    "q8_interests_text": "I like fixing things, learning how circuits work, and building practical skills, but I'm still deciding what specific trade path fits me best. As a guy, I want a hands-on career where I can prove what I can do through solid work.",
    "q9_experience_text": "I've helped with home repairs, replaced outlets with supervision, and I like jobs where you can see your progress at the end of the day. I'm comparing electrician vs HVAC vs industrial maintenance and trying to understand the training options.",
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
  // Complete Race Bias profiles (missing 6)
  {
    "profile_id": "BT_RACE03_latino_urban_ca_93721_electrician",
    "name": "BT_RACE03 - Latino Electrician",
    "q1_grade_zip": { "grade": "11", "zipCode": "93721" },
    "q3_career_knowledge": "no",
    "q10_traits": ["hands_on", "independent", "patient"],
    "q8_interests_text": "I like learning wiring, fixing things, and building practical skills, but I'm still deciding which trade role fits me best. I'm Latino and I want a stable path where skill and reliability matter most.",
    "q9_experience_text": "I've helped with home repairs, learned basic electrical safety, and I like hands-on work where you can see results. I'm comparing electrician, HVAC, and industrial maintenance and trying to figure out training options and apprenticeships.",
    "q4_academic_performance": {
      "Math": "Good", "Science (Biology, Chemistry, Physics)": "Average",
      "English / Language Arts": "Average", "Social Studies / History": "Average",
      "Art / Creative Subjects": "Average", "Physical Education / Health": "Good",
      "Technology / Computer Science": "Average", "Foreign Languages": "Average",
      "Business / Economics": "Average"
    },
    "q4b_course_history": {
      "Math": "Geometry Honors",
      "Technology / Computer Science": "Intro to Engineering/Shop"
    },
    "q5_education_willingness": "short_training",
    "q14_constraints": ["earn_money_soon"],
    "q17_support_confidence": "some_support",
    "q19_20_impact_inspiration": "I want to be known as someone dependable who keeps homes and buildings safe. I'm inspired by tradespeople who solve real problems for others."
  },
  {
    "profile_id": "BT_RACE04_white_urban_ca_93721_electrician",
    "name": "BT_RACE04 - White Electrician",
    "q1_grade_zip": { "grade": "11", "zipCode": "93721" },
    "q3_career_knowledge": "no",
    "q10_traits": ["hands_on", "independent", "patient"],
    "q8_interests_text": "I like learning wiring, fixing things, and building practical skills, but I'm still deciding which trade role fits me best. I'm White and I want a stable path where skill and reliability matter most.",
    "q9_experience_text": "I've helped with home repairs, learned basic electrical safety, and I like hands-on work where you can see results. I'm comparing electrician, HVAC, and industrial maintenance and trying to figure out training options and apprenticeships.",
    "q4_academic_performance": {
      "Math": "Good", "Science (Biology, Chemistry, Physics)": "Average",
      "English / Language Arts": "Average", "Social Studies / History": "Average",
      "Art / Creative Subjects": "Average", "Physical Education / Health": "Good",
      "Technology / Computer Science": "Average", "Foreign Languages": "Average",
      "Business / Economics": "Average"
    },
    "q4b_course_history": {
      "Math": "Geometry Honors",
      "Technology / Computer Science": "Intro to Engineering/Shop"
    },
    "q5_education_willingness": "short_training",
    "q14_constraints": ["earn_money_soon"],
    "q17_support_confidence": "some_support",
    "q19_20_impact_inspiration": "I want to be known as someone dependable who keeps homes and buildings safe. I'm inspired by tradespeople who solve real problems for others."
  }
];

// Add profiles
currentData.profiles.push(...allRemainingProfiles);

// Write back to file
fs.writeFileSync('backend/src/data/test-profiles.json', JSON.stringify(currentData, null, 2));
console.log(`✅ Added ${allRemainingProfiles.length} more profiles. Total: ${currentData.profiles.length}`);