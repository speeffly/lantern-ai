// Test the career service directly to see if Aerospace Engineer is available
const { CareerService } = require('./backend/src/services/careerService');

console.log('🔍 Testing CareerService directly...');

try {
  const allCareers = CareerService.getAllCareers();
  console.log('📊 Total careers in database:', allCareers.length);
  
  // Look for Aerospace Engineer
  const aerospaceEngineer = allCareers.find(c => c.title === 'Aerospace Engineer');
  console.log('\n🚀 Aerospace Engineer found:', !!aerospaceEngineer);
  
  if (aerospaceEngineer) {
    console.log('   Details:', {
      id: aerospaceEngineer.id,
      title: aerospaceEngineer.title,
      sector: aerospaceEngineer.sector,
      salary: aerospaceEngineer.averageSalary,
      education: aerospaceEngineer.requiredEducation
    });
  }
  
  // Look for Photographer
  const photographer = allCareers.find(c => c.title === 'Photographer');
  console.log('\n📸 Photographer found:', !!photographer);
  
  if (photographer) {
    console.log('   Details:', {
      id: photographer.id,
      title: photographer.title,
      sector: photographer.sector,
      salary: photographer.averageSalary,
      education: photographer.requiredEducation
    });
  }
  
  // Test the mapping function
  console.log('\n🔄 Testing career mapping...');
  
  // Simulate the mapping logic
  const engineeringMapping = {
    'aerospace_engineer': 'Aerospace Engineer',
    'mechanical_engineer': 'Mechanical Engineer',
    'electrical_engineer': 'Electrical Engineer',
    'civil_engineer': 'Civil Engineer'
  };
  
  const mappedTitle = engineeringMapping['aerospace_engineer'];
  console.log('   Mapped title:', mappedTitle);
  
  const foundCareer = allCareers.find(c => c.title === mappedTitle);
  console.log('   Found in database:', !!foundCareer);
  
  if (foundCareer) {
    console.log('   ✅ SUCCESS: Mapping works correctly');
    console.log('   Career:', foundCareer.title, '(ID:', foundCareer.id + ')');
  } else {
    console.log('   ❌ FAILURE: Mapping failed');
  }
  
  // Show all engineering careers
  console.log('\n🔧 All engineering careers in database:');
  const engineeringCareers = allCareers.filter(c => 
    c.title.toLowerCase().includes('engineer') || 
    c.sector === 'infrastructure'
  );
  
  engineeringCareers.forEach(career => {
    console.log(`   - ${career.title} (${career.sector})`);
  });
  
} catch (error) {
  console.error('❌ Error testing career service:', error.message);
  console.error('Stack:', error.stack);
}