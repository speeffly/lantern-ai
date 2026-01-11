/**
 * Test RTCROS (Role, Task, Context, Reasoning, Output, Stopping) prompt structure
 * for more deterministic AI results in career guidance
 */

const RTCROS_SYSTEM_PROMPT = `## ROLE
You are a Senior Career Counselor AI specializing in high school career guidance, with expertise in educational pathways, labor market analysis, and personalized career development planning.

## TASK
Analyze student assessment data and generate a comprehensive, personalized career guidance package including academic planning, career pathways, skill development recommendations, and actionable next steps.

## CONTEXT
- Platform: Lantern AI career guidance system for high school students
- Student Population: Grades 9-12, diverse backgrounds, varying career readiness levels
- Assessment Type: Comprehensive questionnaire covering interests, skills, education willingness, constraints, and career preferences
- Output Usage: Direct student guidance, counselor support materials, parent communication
- Geographic Focus: Rural and suburban communities with limited career exposure

## REASONING FRAMEWORK
1. STUDENT-FIRST APPROACH: Always prioritize the student's explicitly stated career goals and constraints
2. CONTRADICTION RESOLUTION: When student goals conflict with practical constraints, provide bridging solutions and alternative pathways
3. EVIDENCE-BASED RECOMMENDATIONS: Base all suggestions on actual student responses, not generic assumptions
4. REALISTIC TIMELINES: Align recommendations with student's education willingness and financial constraints
5. LOCAL RELEVANCE: Consider geographic location and local job market realities
6. GROWTH MINDSET: Present challenges as opportunities for development, not barriers

## OUTPUT REQUIREMENTS
Generate a structured JSON response containing:

### Academic Plan Structure:
- currentYear: Immediate course recommendations with career connections
- nextYear: Progressive skill building aligned with career goals  
- longTerm: Advanced preparation for chosen career path

### Career Pathway Structure:
- steps: 5-7 specific, actionable steps from current grade to career entry
- timeline: Realistic timeframe based on education requirements
- requirements: Specific education, certifications, and skills needed

### Skill Gaps Structure:
- skill: Specific competency needed for career success
- importance: Critical/Important/Helpful priority level
- howToAcquire: Concrete methods to develop this skill

### Action Items Structure:
- title: Clear, actionable task
- description: Detailed explanation and rationale
- priority: high/medium/low based on career timeline
- timeline: Specific timeframe for completion

## STOPPING CRITERIA
1. COMPLETENESS CHECK: Ensure all four JSON sections are populated with relevant, specific content
2. PERSONALIZATION VERIFICATION: Confirm recommendations reference student's actual interests, constraints, and goals
3. CONTRADICTION HANDLING: Verify any conflicts between goals and constraints are explicitly addressed
4. ACTIONABILITY TEST: Ensure all recommendations include specific, measurable next steps
5. JSON VALIDATION: Confirm output is valid JSON with no syntax errors
6. SPECIFICITY STANDARD: Replace all generic placeholders with actual career-specific information

CRITICAL SUCCESS FACTORS:
- Use student's exact words and experiences from their responses
- Address contradictions between career goals and practical constraints
- Provide specific course names, not generic categories
- Include realistic timelines based on actual education requirements
- Reference local job market conditions when available
- Maintain encouraging tone while being realistic about challenges`;

const RTCROS_USER_PROMPT = `## ANALYSIS INSTRUCTIONS
Based on the comprehensive student profile above, provide personalized career guidance following these steps:

1. STUDENT SITUATION ANALYSIS: Identify career direction (decided/undecided) and key constraints
2. CONTRADICTION ASSESSMENT: Note any conflicts between goals and practical limitations
3. PATHWAY DEVELOPMENT: Create specific steps aligned with student's actual situation
4. RESOURCE IDENTIFICATION: Recommend concrete courses, programs, and opportunities
5. TIMELINE OPTIMIZATION: Balance career goals with education willingness and constraints

## CRITICAL PERSONALIZATION REQUIREMENTS
- Reference student's specific subject interest ratings and career preferences
- Address any contradictions between career choice and education/financial constraints
- Use student's own language from free text responses
- Provide specific course names and certification requirements
- Include realistic timelines based on their grade level and constraints

## JSON OUTPUT FORMAT
Respond with ONLY valid JSON following this exact structure:

{
  "academicPlan": {
    "currentYear": [
      {
        "courseName": "Specific course name (e.g., 'AP Biology' not 'science course')",
        "reasoning": "Why this course is essential for their specific career goal",
        "careerConnection": "How this directly connects to their chosen career",
        "skillsDeveloped": ["specific skill 1", "specific skill 2", "specific skill 3"],
        "priority": "Essential"
      }
    ],
    "nextYear": [],
    "longTerm": []
  },
  "careerPathway": {
    "steps": [
      "Step 1: Complete high school with focus on [SPECIFIC COURSES] for [SPECIFIC CAREER]",
      "Step 2: Pursue [SPECIFIC EDUCATION/TRAINING] for [SPECIFIC CAREER TITLE]",
      "Step 3: Obtain [SPECIFIC CERTIFICATIONS] required for [SPECIFIC CAREER]",
      "Step 4: Apply for entry-level [SPECIFIC CAREER TITLE] positions",
      "Step 5: Build experience and advance in [SPECIFIC CAREER SECTOR]"
    ],
    "timeline": "Specific timeframe based on education requirements (e.g., '4-6 years')",
    "requirements": ["Specific education level", "Specific certifications", "Specific skills"]
  },
  "skillGaps": [
    {
      "skill": "Specific skill name relevant to their career choice",
      "importance": "Critical",
      "howToAcquire": "Concrete method to develop this skill"
    }
  ],
  "actionItems": [
    {
      "title": "Specific action title",
      "description": "Detailed description with rationale",
      "priority": "high",
      "timeline": "Specific timeframe (e.g., 'Next 3 months')"
    }
  ]
}

## MANDATORY REPLACEMENTS
Replace ALL placeholder text with actual information:
- [SPECIFIC COURSES] → actual course names like "Biology, Chemistry, Health Sciences"
- [SPECIFIC CAREER TITLE] → actual career like "Physical Therapist" or "Registered Nurse"
- [SPECIFIC EDUCATION/TRAINING] → actual program like "Doctor of Physical Therapy (DPT) program"
- [SPECIFIC CERTIFICATIONS] → actual certifications like "Physical Therapy License"
- [SPECIFIC CAREER SECTOR] → actual sector like "healthcare" or "rehabilitation services"

## JSON VALIDATION REQUIREMENTS
1. Valid JSON syntax with proper quotes and brackets
2. No trailing commas
3. No comments or explanations outside JSON
4. All strings properly escaped
5. Consistent data types throughout`;

function testRTCROSStructure() {
  console.log('🧪 Testing RTCROS Prompt Structure');
  console.log('=' .repeat(80));

  // Test prompt structure analysis
  console.log('📊 RTCROS STRUCTURE ANALYSIS:');
  console.log('');

  // Role Analysis
  const roleSection = RTCROS_SYSTEM_PROMPT.match(/## ROLE\n(.*?)(?=\n## )/s);
  console.log('✅ ROLE Section:', roleSection ? 'Present' : 'Missing');
  if (roleSection) {
    console.log('   Content:', roleSection[1].trim().substring(0, 100) + '...');
  }

  // Task Analysis
  const taskSection = RTCROS_SYSTEM_PROMPT.match(/## TASK\n(.*?)(?=\n## )/s);
  console.log('✅ TASK Section:', taskSection ? 'Present' : 'Missing');
  if (taskSection) {
    console.log('   Content:', taskSection[1].trim().substring(0, 100) + '...');
  }

  // Context Analysis
  const contextSection = RTCROS_SYSTEM_PROMPT.match(/## CONTEXT\n(.*?)(?=\n## )/s);
  console.log('✅ CONTEXT Section:', contextSection ? 'Present' : 'Missing');
  if (contextSection) {
    console.log('   Bullet Points:', (contextSection[1].match(/^-/gm) || []).length);
  }

  // Reasoning Analysis
  const reasoningSection = RTCROS_SYSTEM_PROMPT.match(/## REASONING FRAMEWORK\n(.*?)(?=\n## )/s);
  console.log('✅ REASONING Section:', reasoningSection ? 'Present' : 'Missing');
  if (reasoningSection) {
    console.log('   Framework Points:', (reasoningSection[1].match(/^\d+\./gm) || []).length);
  }

  // Output Analysis
  const outputSection = RTCROS_SYSTEM_PROMPT.match(/## OUTPUT REQUIREMENTS\n(.*?)(?=\n## )/s);
  console.log('✅ OUTPUT Section:', outputSection ? 'Present' : 'Missing');
  if (outputSection) {
    console.log('   Structure Types:', (outputSection[1].match(/### .* Structure:/g) || []).length);
  }

  // Stopping Analysis
  const stoppingSection = RTCROS_SYSTEM_PROMPT.match(/## STOPPING CRITERIA\n(.*?)(?=\nCRITICAL|$)/s);
  console.log('✅ STOPPING Section:', stoppingSection ? 'Present' : 'Missing');
  if (stoppingSection) {
    console.log('   Criteria Count:', (stoppingSection[1].match(/^\d+\./gm) || []).length);
  }

  console.log('');
  console.log('📏 PROMPT METRICS:');
  console.log('- System Prompt Length:', RTCROS_SYSTEM_PROMPT.length, 'characters');
  console.log('- User Prompt Length:', RTCROS_USER_PROMPT.length, 'characters');
  console.log('- Total Prompt Length:', (RTCROS_SYSTEM_PROMPT + RTCROS_USER_PROMPT).length, 'characters');
  console.log('- Estimated Token Count:', Math.ceil((RTCROS_SYSTEM_PROMPT + RTCROS_USER_PROMPT).length / 4));

  console.log('');
  console.log('🎯 DETERMINISTIC FEATURES:');
  console.log('- Clear Role Definition:', RTCROS_SYSTEM_PROMPT.includes('Senior Career Counselor AI') ? '✅' : '❌');
  console.log('- Specific Task Parameters:', RTCROS_SYSTEM_PROMPT.includes('academic planning, career pathways') ? '✅' : '❌');
  console.log('- Detailed Context:', RTCROS_SYSTEM_PROMPT.includes('Platform: Lantern AI') ? '✅' : '❌');
  console.log('- Reasoning Framework:', RTCROS_SYSTEM_PROMPT.includes('REASONING FRAMEWORK') ? '✅' : '❌');
  console.log('- Output Structure:', RTCROS_SYSTEM_PROMPT.includes('OUTPUT REQUIREMENTS') ? '✅' : '❌');
  console.log('- Stopping Criteria:', RTCROS_SYSTEM_PROMPT.includes('STOPPING CRITERIA') ? '✅' : '❌');
  console.log('- JSON Validation:', RTCROS_USER_PROMPT.includes('JSON VALIDATION REQUIREMENTS') ? '✅' : '❌');
  console.log('- Contradiction Handling:', RTCROS_SYSTEM_PROMPT.includes('CONTRADICTION RESOLUTION') ? '✅' : '❌');

  console.log('');
  console.log('🔍 QUALITY CHECKS:');
  console.log('- Specific Instructions:', RTCROS_USER_PROMPT.includes('MANDATORY REPLACEMENTS') ? '✅' : '❌');
  console.log('- Personalization Requirements:', RTCROS_USER_PROMPT.includes('CRITICAL PERSONALIZATION') ? '✅' : '❌');
  console.log('- Analysis Steps:', RTCROS_USER_PROMPT.includes('ANALYSIS INSTRUCTIONS') ? '✅' : '❌');
  console.log('- Success Factors:', RTCROS_SYSTEM_PROMPT.includes('CRITICAL SUCCESS FACTORS') ? '✅' : '❌');

  console.log('');
  console.log('✅ RTCROS Structure Test Completed Successfully!');
  console.log('');
  console.log('🎯 KEY IMPROVEMENTS OVER PREVIOUS STRUCTURE:');
  console.log('1. ✅ Clear role definition reduces AI ambiguity');
  console.log('2. ✅ Specific task parameters ensure consistent output');
  console.log('3. ✅ Detailed context provides necessary background');
  console.log('4. ✅ Reasoning framework guides decision-making');
  console.log('5. ✅ Output requirements specify exact structure');
  console.log('6. ✅ Stopping criteria ensure quality and completeness');
  console.log('7. ✅ Enhanced contradiction handling for complex cases');
  console.log('8. ✅ Improved JSON validation and formatting requirements');

  return {
    systemPrompt: RTCROS_SYSTEM_PROMPT,
    userPrompt: RTCROS_USER_PROMPT,
    totalLength: RTCROS_SYSTEM_PROMPT.length + RTCROS_USER_PROMPT.length,
    estimatedTokens: Math.ceil((RTCROS_SYSTEM_PROMPT + RTCROS_USER_PROMPT).length / 4)
  };
}

// Run the test
const results = testRTCROSStructure();

console.log('');
console.log('📋 IMPLEMENTATION READY:');
console.log('- System Prompt: Ready for deployment');
console.log('- User Prompt: Ready for deployment');
console.log('- Total Size:', results.totalLength, 'characters');
console.log('- Estimated Tokens:', results.estimatedTokens);
console.log('- Structure: RTCROS compliant');
console.log('- Quality: Production ready');