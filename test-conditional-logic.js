const fetch = require('node-fetch');

async function testConditionalLogic() {
  try {
    console.log('🧪 Testing conditional logic...');
    
    // Get questions
    const response = await fetch('http://localhost:3002/api/counselor-assessment/questions');
    const data = await response.json();
    
    if (!data.success) {
      console.error('❌ Failed to fetch questions:', data.error);
      return;
    }
    
    const questions = data.data.questions;
    console.log('📊 Total questions:', questions.length);
    
    // Find the career knowledge question
    const careerQ = questions.find(q => q.id === 'q3_career_knowledge');
    console.log('✅ Career knowledge question found:', !!careerQ);
    console.log('📋 Options:', careerQ.options);
    
    // Find conditional questions for "yes" answer
    const yesConditionals = questions.filter(q => 
      q.isConditional && 
      q.conditionalParent === 'q3_career_knowledge' && 
      q.conditionalTrigger === 'yes'
    );
    console.log('🔀 "Yes" conditionals found:', yesConditionals.length);
    yesConditionals.forEach(q => console.log(`  - ${q.id}: ${q.text}`));
    
    // Find conditional questions for "no" answer
    const noConditionals = questions.filter(q => 
      q.isConditional && 
      q.conditionalParent === 'q3_career_knowledge' && 
      q.conditionalTrigger === 'no'
    );
    console.log('🔀 "No" conditionals found:', noConditionals.length);
    noConditionals.forEach(q => console.log(`  - ${q.id}: ${q.text}`));
    
    // Test the conditional logic simulation
    console.log('\n🎯 Testing conditional logic simulation:');
    
    // Simulate "Yes" answer
    const selectedAnswers = { 'q3_career_knowledge': 'Yes' };
    
    const shouldShowYes = yesConditionals.some(q => {
      const parentAnswer = selectedAnswers[q.conditionalParent];
      const normalizedParentAnswer = parentAnswer.toLowerCase();
      const normalizedTrigger = q.conditionalTrigger.toLowerCase();
      return normalizedParentAnswer === normalizedTrigger;
    });
    
    console.log('✅ "Yes" answer should show conditionals:', shouldShowYes);
    
    // Simulate "No" answer
    const selectedAnswers2 = { 'q3_career_knowledge': 'No' };
    
    const shouldShowNo = noConditionals.some(q => {
      const parentAnswer = selectedAnswers2[q.conditionalParent];
      const normalizedParentAnswer = parentAnswer.toLowerCase();
      const normalizedTrigger = q.conditionalTrigger.toLowerCase();
      return normalizedParentAnswer === normalizedTrigger;
    });
    
    console.log('✅ "No" answer should show conditionals:', shouldShowNo);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Only run if node-fetch is available
try {
  testConditionalLogic();
} catch (error) {
  console.log('⚠️ node-fetch not available, skipping test');
}