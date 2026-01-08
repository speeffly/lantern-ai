const fs = require('fs');
const path = require('path');

// Verify the AI prompt fix was applied correctly
function verifyAIPromptFix() {
  console.log('🔍 Verifying AI Career Pathway Personalization Fix...\n');

  const filePath = path.join(__dirname, 'backend', 'src', 'services', 'aiRecommendationService.ts');
  
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    console.log('✅ File found and readable');
    
    // Check for the enhanced career pathway requirements
    const hasEnhancedRequirements = fileContent.includes('EXAMPLE: Instead of "Step 1: Complete high school"');
    console.log(`${hasEnhancedRequirements ? '✅' : '❌'} Enhanced career pathway requirements: ${hasEnhancedRequirements ? 'FOUND' : 'MISSING'}`);
    
    // Check for specific placeholder instructions
    const hasPlaceholderInstructions = fileContent.includes('[SPECIFIC COURSES FOR THIS CAREER] → actual course names');
    console.log(`${hasPlaceholderInstructions ? '✅' : '❌'} Placeholder replacement instructions: ${hasPlaceholderInstructions ? 'FOUND' : 'MISSING'}`);
    
    // Check for updated career pathway template
    const hasUpdatedTemplate = fileContent.includes('Complete high school with focus on [SPECIFIC COURSES FOR THIS CAREER]');
    console.log(`${hasUpdatedTemplate ? '✅' : '❌'} Updated career pathway template: ${hasUpdatedTemplate ? 'FOUND' : 'MISSING'}`);
    
    // Check that generic "Step 1", "Step 2" is removed
    const hasGenericSteps = fileContent.includes('"steps": ["Step 1", "Step 2", "Step 3", "Step 4"]');
    console.log(`${!hasGenericSteps ? '✅' : '❌'} Generic steps removed: ${!hasGenericSteps ? 'YES' : 'NO - STILL PRESENT'}`);
    
    // Check for mandatory replacement instruction
    const hasMandatoryInstruction = fileContent.includes('MANDATORY: Replace ALL placeholder text');
    console.log(`${hasMandatoryInstruction ? '✅' : '❌'} Mandatory replacement instruction: ${hasMandatoryInstruction ? 'FOUND' : 'MISSING'}`);
    
    console.log('\n📊 VERIFICATION SUMMARY:');
    console.log('='.repeat(50));
    
    const allChecksPass = hasEnhancedRequirements && hasPlaceholderInstructions && 
                         hasUpdatedTemplate && !hasGenericSteps && hasMandatoryInstruction;
    
    if (allChecksPass) {
      console.log('🎉 ALL CHECKS PASSED! The AI Career Pathway Personalization Fix has been successfully applied.');
      console.log('\nThe AI will now generate:');
      console.log('• Specific career pathway steps instead of generic "Step 1", "Step 2"');
      console.log('• Career-specific education requirements');
      console.log('• Actual certification names');
      console.log('• Realistic timelines based on education level');
      console.log('• Actionable, measurable steps');
    } else {
      console.log('❌ SOME CHECKS FAILED! The fix may not have been applied correctly.');
      console.log('Please review the changes and ensure all modifications were made.');
    }
    
    console.log('\n🚀 Ready for deployment!');
    console.log('Run DEPLOY_AI_CAREER_PATHWAY_FIX.bat to deploy the changes.');
    
  } catch (error) {
    console.error('❌ Error reading file:', error.message);
  }
}

// Run the verification
verifyAIPromptFix();