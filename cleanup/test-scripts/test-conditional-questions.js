const fetch = require('node-fetch');

async function testConditionalQuestions() {
  try {
    console.log('🧪 Testing conditional questions system...');
    
    // Test the questions endpoint
    const response = await fetch('http://localhost:3002/api/counselor-assessment/questions');
    const data = await response.json();
    
    if (!data.success) {
      console.error('❌ Failed to fetch questions:', data.error);
      return;
    }
    
    console.log('✅ Successfully fetched questions');
    console.log('📊 Total questions:', data.data.questions.length);
    
    // Find the career knowledge question
    const careerKnowledgeQ = data.data.questions.find(q => q.id === 'q3_career_knowledge');
    if (careerKnowledgeQ) {
      console.log('✅ Found career knowledge question:', careerKnowledgeQ.text);
      console.log('📋 Options:', careerKnowledgeQ.options);
    } else {
      console.log('❌ Career knowledge question not found');
    }
    
    // Find conditional questions
    const conditionalQuestions = data.data.questions.filter(q => q.isConditional);
    console.log('🔀 Conditional questions found:', conditionalQuestions.length);
    
    // Group by parent
    const byParent = {};
    conditionalQuestions.forEach(q => {
      if (!byParent[q.conditionalParent]) {
        byParent[q.conditionalParent] = [];
      }
      byParent[q.conditionalParent].push({
        id: q.id,
        trigger: q.conditionalTrigger,
        text: q.text.substring(0, 50) + '...'
      });
    });
    
    console.log('📊 Conditional questions by parent:');
    Object.entries(byParent).forEach(([parent, questions]) => {
      console.log(`  ${parent}:`);
      questions.forEach(q => {
        console.log(`    - ${q.id} (trigger: ${q.trigger}): ${q.text}`);
      });
    });
    
    // Test specific career categories
    const careerCategoryQ = data.data.questions.find(q => q.id === 'q3a_career_categories');
    if (careerCategoryQ) {
      console.log('✅ Found career categories question');
      console.log('📋 Career categories:', careerCategoryQ.options?.slice(0, 5), '...');
    }
    
    // Test specific career questions
    const tradeQ = data.data.questions.find(q => q.id === 'q3a1_trade_careers');
    if (tradeQ) {
      console.log('✅ Found trade careers question');
      console.log('📋 Trade options:', tradeQ.options?.slice(0, 3), '...');
    }
    
    // Test "other" text questions
    const tradeOtherQ = data.data.questions.find(q => q.id === 'q3a1_trade_other');
    if (tradeOtherQ) {
      console.log('✅ Found trade "other" text question');
      console.log('📝 Type:', tradeOtherQ.type);
    }
    
    // Test "no" branch questions
    const traitsQ = data.data.questions.find(q => q.id === 'q10_traits');
    if (traitsQ) {
      console.log('✅ Found traits question (no branch)');
      console.log('📋 Traits options:', traitsQ.options?.slice(0, 3), '...');
    }
    
    console.log('🎉 Conditional questions test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testConditionalQuestions();