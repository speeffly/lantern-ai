const { DatabaseServicePG } = require('./dist/services/databaseServicePG');
const { FeedbackService } = require('./dist/services/feedbackService');

async function testFeedbackSystem() {
  console.log('🧪 Testing Feedback System Integration');
  console.log('='.repeat(50));

  try {
    // Initialize database
    console.log('1. Initializing PostgreSQL database...');
    await DatabaseServicePG.initialize();
    console.log('✅ Database initialized successfully');

    // Test feedback submission
    console.log('\n2. Testing feedback submission...');
    const testFeedback = {
      careerCode: 'RN001',
      careerTitle: 'Registered Nurse',
      feedbackType: 'rating',
      rating: 4,
      isHelpful: true,
      comment: 'This recommendation was very helpful and aligned with my interests.',
      improvementSuggestions: 'Could include more information about local nursing programs.'
    };

    const feedbackId = await FeedbackService.submitFeedback(testFeedback);
    console.log('✅ Feedback submitted with ID:', feedbackId);

    // Test feedback retrieval
    console.log('\n3. Testing feedback retrieval...');
    const retrievedFeedback = await FeedbackService.getFeedback('RN001');
    console.log('✅ Retrieved feedback entries:', retrievedFeedback.length);

    // Test feedback statistics
    console.log('\n4. Testing feedback statistics...');
    const stats = await FeedbackService.getFeedbackStats();
    console.log('✅ Generated stats for', stats.length, 'careers');

    // Test AI learning insights
    console.log('\n5. Testing AI learning insights...');
    const insights = await FeedbackService.getAILearningInsights();
    console.log('✅ Generated', insights.length, 'AI learning insights');

    // Test recommendation improvements
    console.log('\n6. Testing recommendation improvements...');
    const improvements = await FeedbackService.getRecommendationImprovements('RN001');
    console.log('✅ Found', improvements.length, 'improvement suggestions');

    // Test database statistics
    console.log('\n7. Testing database statistics...');
    const dbStats = await DatabaseServicePG.getStats();
    console.log('✅ Database contains', dbStats.totalTables, 'tables');
    console.log('   - recommendation_feedback:', dbStats.tables?.recommendation_feedback || 0, 'entries');
    console.log('   - ai_learning_data:', dbStats.tables?.ai_learning_data || 0, 'entries');

    console.log('\n' + '='.repeat(50));
    console.log('🎉 All feedback system tests passed successfully!');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ Feedback system test failed:', error);
    process.exit(1);
  } finally {
    await DatabaseServicePG.close();
  }
}

// Run the test
testFeedbackSystem().catch(console.error);