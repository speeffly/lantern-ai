# RTCROS Framework Implementation in Clean AI Service

## Overview
Updated the Clean AI Recommendation Service to use the RTCROS framework (Role, Task, Context, Reasoning, Output, Stopping) for more deterministic and consistent AI responses.

## RTCROS Framework Components

### 1. ROLE
**Definition**: Senior Career Counselor AI specializing in high school career guidance
- Expertise in career pathway planning
- Education requirements analysis
- Personalized recommendation generation

### 2. TASK
**Primary Objective**: Analyze student assessment responses and generate personalized career recommendations
- **Direct Selection Mode**: When student selects specific career (90%+ match), prioritize that career as #1
- **Exploration Mode**: Provide 5-6 diverse career recommendations based on interests and skills

### 3. CONTEXT
**Comprehensive Student Profile**:
- Grade level and geographic location
- Education commitment and interests
- Assessment response analysis
- Available career matches with compatibility scores
- Direct selection context (when applicable)

### 4. REASONING
**6-Point Analysis Framework**:
1. **Compatibility Assessment**: Align careers with interests, skills, academic performance
2. **Education Pathway Analysis**: Match student's education willingness with career requirements
3. **Constraint Evaluation**: Factor in limitations (financial, time, geographic, physical)
4. **Growth Potential**: Assess long-term prospects and advancement opportunities
5. **Skill Gap Identification**: Determine additional skills/education needed
6. **Personalization Factor**: Ensure recommendations reflect unique student profile

### 5. OUTPUT
**Structured JSON Response**:
```json
{
  "careerRecommendations": [
    {
      "title": "Specific Career Title",
      "matchPercentage": 95,
      "explanation": "Detailed explanation referencing assessment responses",
      "salaryRange": "Realistic salary range",
      "educationRequired": "Specific education path",
      "keySkills": ["skill1", "skill2", "skill3"]
    }
  ],
  "careerPathway": {
    "steps": ["Specific, actionable steps"],
    "timeline": "Realistic timeline based on education requirements",
    "requirements": ["Specific requirements"]
  },
  "academicPlan": {
    "recommendedCourses": ["Relevant courses"],
    "extracurriculars": ["Career-related activities"],
    "timeline": "High school and beyond"
  }
}
```

### 6. STOPPING
**6 Quality Validation Criteria**:
1. **Accuracy**: All career information is factually correct
2. **Personalization**: Recommendations reference specific assessment responses
3. **Specificity**: Concrete, actionable steps (no generic advice)
4. **Completeness**: All JSON fields populated meaningfully
5. **Consistency**: Career pathway aligns with recommendations
6. **Selection Respect**: Direct selections are prioritized appropriately

## Implementation Details

### Context Generation
The `createFocusedContext()` method now generates a comprehensive RTCROS-structured prompt that includes:
- Clear role definition for the AI
- Specific task parameters based on selection type
- Complete student context with assessment data
- Structured reasoning framework
- Exact output requirements
- Quality validation criteria

### System Prompts
Both OpenAI and Gemini system prompts follow RTCROS structure:
- **Role**: Senior Career Counselor AI
- **Task**: Process assessment data using RTCROS framework
- **Context**: Structured student responses and career matches
- **Reasoning**: 6-point systematic analysis
- **Output**: JSON-only responses
- **Stopping**: Quality validation before responding

### Direct Selection Protection
Enhanced protection for direct career selections:
```typescript
const hasDirectSelection = careerMatches[0]?.matchScore >= 90;

// Context includes explicit instructions when direct selection detected
CRITICAL: This student has made a DIRECT CAREER SELECTION of "${topCareer?.title}". 
You MUST prioritize this career as the #1 recommendation and focus on providing 
a clear pathway to achieve this specific goal.
```

### Timeline Calculation
Added intelligent timeline calculation based on education requirements:
- Certificate: 6 months - 2 years
- Associate: 2-3 years
- Bachelor's: 4-5 years
- Master's: 6-7 years
- Doctorate: 8-12 years

## Benefits of RTCROS Implementation

1. **Deterministic Results**: Structured framework reduces AI variability
2. **Consistent Quality**: 6-point validation ensures reliable outputs
3. **Better Context**: Comprehensive student data analysis
4. **Clear Instructions**: Explicit role and task definitions
5. **Systematic Reasoning**: Logical 6-point analysis framework
6. **Quality Control**: Built-in stopping criteria for validation

## Expected Outcomes

### For Aerospace Engineer Selection:
1. **Role**: AI understands it's a career counselor
2. **Task**: Recognizes direct selection and prioritizes Aerospace Engineer
3. **Context**: Has complete student assessment data
4. **Reasoning**: Applies 6-point analysis focusing on engineering pathway
5. **Output**: Returns Aerospace Engineer as #1 with specific engineering pathway
6. **Stopping**: Validates that direct selection is respected

### Logging Output:
```
📝 ASSESSMENT ANSWERS:
1. q3_career_knowledge: "yes"
2. q3a2_engineering_careers: "aerospace_engineer"

🚀 AI PROMPT:
RTCROS CAREER COUNSELING ANALYSIS
ROLE: Senior Career Counselor AI...
TASK: CRITICAL: Direct career selection of "Aerospace Engineer"...
CONTEXT: Student Profile with assessment data...
REASONING: 6-point analysis framework...
OUTPUT: JSON structure with Aerospace Engineer as #1...
STOPPING: 6 quality criteria validation...
```

This RTCROS implementation should provide more consistent, deterministic results and properly respect direct career selections like aerospace engineer.