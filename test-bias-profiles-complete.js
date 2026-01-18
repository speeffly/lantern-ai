const fs = require('fs');

// Read the test profiles
const testProfilesData = JSON.parse(fs.readFileSync('backend/src/data/test-profiles.json', 'utf8'));
const profiles = testProfilesData.profiles;

console.log('🧪 COMPREHENSIVE BIAS TESTING SUITE VERIFICATION');
console.log('='.repeat(60));

// Count profiles by category
const categories = {
  'Sex Bias': [],
  'Race Bias': [],
  'Social Background Bias': [],
  'Urban vs Rural Bias': [],
  'Legacy Decided': [],
  'Legacy Undecided': []
};

profiles.forEach(profile => {
  const id = profile.profile_id;
  const name = profile.name;
  
  if (id.startsWith('BT_SEX0')) {
    categories['Sex Bias'].push({ id, name });
  } else if (id.startsWith('BT_RACE0')) {
    categories['Race Bias'].push({ id, name });
  } else if (id.startsWith('BT_SOC0')) {
    categories['Social Background Bias'].push({ id, name });
  } else if (id.startsWith('BT_UR0')) {
    categories['Urban vs Rural Bias'].push({ id, name });
  } else if (id.startsWith('D')) {
    categories['Legacy Decided'].push({ id, name });
  } else if (id.startsWith('U') && !id.startsWith('BT_UR')) {
    categories['Legacy Undecided'].push({ id, name });
  }
});

// Display results
Object.entries(categories).forEach(([category, profileList]) => {
  console.log(`\n📊 ${category}: ${profileList.length} profiles`);
  profileList.forEach(profile => {
    console.log(`   • ${profile.id} - ${profile.name}`);
  });
});

// Verify matched pairs
console.log('\n🔍 MATCHED PAIRS VERIFICATION');
console.log('='.repeat(40));

const verifyPairs = (category, profiles, pairCriteria) => {
  console.log(`\n${category}:`);
  const pairs = [];
  
  for (let i = 0; i < profiles.length; i += 2) {
    if (i + 1 < profiles.length) {
      const profile1 = profiles[i];
      const profile2 = profiles[i + 1];
      pairs.push([profile1, profile2]);
      
      console.log(`   Pair ${Math.floor(i/2) + 1}: ${profile1.name} ↔ ${profile2.name}`);
      
      // Verify they have the same qualifications but different demographic cues
      const p1Data = testProfilesData.profiles.find(p => p.profile_id === profile1.id);
      const p2Data = testProfilesData.profiles.find(p => p.profile_id === profile2.id);
      
      if (p1Data && p2Data) {
        // Check if academic performance matches
        const p1Academic = JSON.stringify(p1Data.q4_academic_performance);
        const p2Academic = JSON.stringify(p2Data.q4_academic_performance);
        const academicMatch = p1Academic === p2Academic;
        
        // Check if education willingness matches
        const educationMatch = p1Data.q5_education_willingness === p2Data.q5_education_willingness;
        
        // Check if constraints match
        const p1Constraints = JSON.stringify(p1Data.q14_constraints.sort());
        const p2Constraints = JSON.stringify(p2Data.q14_constraints.sort());
        const constraintsMatch = p1Constraints === p2Constraints;
        
        const status = academicMatch && educationMatch && constraintsMatch ? '✅' : '⚠️';
        console.log(`     ${status} Academic: ${academicMatch ? 'Match' : 'Differ'}, Education: ${educationMatch ? 'Match' : 'Differ'}, Constraints: ${constraintsMatch ? 'Match' : 'Differ'}`);
      }
    }
  }
  
  return pairs;
};

// Verify each bias category
verifyPairs('Sex Bias', categories['Sex Bias'], 'gender');
verifyPairs('Race Bias', categories['Race Bias'], 'race/ethnicity');
verifyPairs('Social Background Bias', categories['Social Background Bias'], 'socioeconomic background');
verifyPairs('Urban vs Rural Bias', categories['Urban vs Rural Bias'], 'geographic location');

// Final summary
const totalBias = categories['Sex Bias'].length + categories['Race Bias'].length + 
                  categories['Social Background Bias'].length + categories['Urban vs Rural Bias'].length;
const totalLegacy = categories['Legacy Decided'].length + categories['Legacy Undecided'].length;
const grandTotal = totalBias + totalLegacy;

console.log('\n🎯 FINAL SUMMARY');
console.log('='.repeat(30));
console.log(`📊 Total Profiles: ${grandTotal}`);
console.log(`🧪 Bias Testing Profiles: ${totalBias}/32`);
console.log(`📚 Legacy Profiles: ${totalLegacy}/4`);

if (totalBias === 32 && totalLegacy === 4) {
  console.log('\n🎉 SUCCESS: Complete bias testing suite ready!');
  console.log('   ✅ 32 bias testing profiles (16 matched pairs)');
  console.log('   ✅ 4 legacy baseline profiles');
  console.log('   ✅ 36 total profiles for comprehensive AI fairness evaluation');
  console.log('\n🔬 Ready for bias testing across:');
  console.log('   • Gender bias in career recommendations');
  console.log('   • Racial bias in career recommendations');
  console.log('   • Socioeconomic bias in career recommendations');
  console.log('   • Geographic bias in career recommendations');
} else {
  console.log('\n❌ INCOMPLETE: Missing profiles detected');
  console.log(`   Expected: 32 bias + 4 legacy = 36 total`);
  console.log(`   Actual: ${totalBias} bias + ${totalLegacy} legacy = ${grandTotal} total`);
}