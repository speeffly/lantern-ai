// Test if there are any import issues with the new career roadmap code

console.log('🧪 Testing imports...');

try {
  console.log('1. Testing careerRoadmapService import...');
  const { CareerRoadmapService } = require('./backend/dist/services/careerRoadmapService.js');
  console.log('✅ CareerRoadmapService imported successfully');
} catch (error) {
  console.log('❌ CareerRoadmapService import failed:', error.message);
}

try {
  console.log('2. Testing careerRoadmap route import...');
  const careerRoadmapRoutes = require('./backend/dist/routes/careerRoadmap.js');
  console.log('✅ careerRoadmap routes imported successfully');
} catch (error) {
  console.log('❌ careerRoadmap routes import failed:', error.message);
}

try {
  console.log('3. Testing main index import...');
  const app = require('./backend/dist/index.js');
  console.log('✅ Main index imported successfully');
} catch (error) {
  console.log('❌ Main index import failed:', error.message);
}

console.log('🏁 Import test completed');