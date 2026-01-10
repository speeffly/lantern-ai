# Question Weighting System for LLM Career Matching

## Overview
A sophisticated weighting system that helps the LLM understand the relative importance of different student responses, ensuring career recommendations are based on the most predictive factors.

## Core Principle
**Not all questions are equal** - some responses are much more predictive of career satisfaction and success than others. The LLM needs clear guidance on which factors to prioritize.

## Weighting Hierarchy

### 🎯 PRIMARY INDICATORS (Weight: 40-50 points)
**These are the strongest predictors of career fit and should dominate the matching logic.**

#### 1. Career Category Selection (Weight: 50 points)
**Question**: "What type of work do you prefer to do?"
**Why Critical**: Direct expression of work preference
**LLM Instruction**: "This is the MOST IMPORTANT factor. If student selects 'healthcare', prioritize healthcare careers above all else."

```json
{
  "questionId": "career_category",
  "weight": 50,
  "priority": "PRIMARY",
  "llmInstruction": "This response is the strongest indicator of student interest. Weight this response 5x more than personality traits or subject preferences. If they select 'healthcare', they want to help people improve health - prioritize medical careers regardless of other responses."
}
```

#### 2. Specific Career Interest (Weight: 45 points) - Path A Only
**Question**: "What specific career or field interests you most?"
**Why Critical**: Explicit career direction from clear students
**LLM Instruction**: "For Path A students, this is their direct career statement. Validate and build around this specific interest."

```json
{
  "questionId": "specific_career_interest",
  "weight": 45,
  "priority": "PRIMARY",
  "appliesTo": ["pathA"],
  "llmInstruction": "This is the student's explicit career direction. If they mention 'nursing', prioritize nursing and related healthcare careers. Use this as the primary filter before considering other factors."
}
```

### 🎓 SECONDARY INDICATORS (Weight: 20-30 points)
**These provide important context and refinement to career matching.**

#### 3. Education Commitment (Weight: 30 points)
**Question**: "How much education are you willing to pursue?"
**Why Important**: Eliminates unrealistic career paths
**LLM Instruction**: "This is a hard constraint. Never suggest careers requiring more education than student is willing to pursue."

```json
{
  "questionId": "education_commitment",
  "weight": 30,
  "priority": "SECONDARY",
  "llmInstruction": "This is a HARD CONSTRAINT. If student selects 'certificate', do not suggest careers requiring bachelor's degrees, even if they match perfectly otherwise. Filter careers first by education level, then by interest."
}
```

#### 4. Subject Excellence (Weight: 25 points)
**Question**: "Which subjects do you enjoy and rate yourself in?"
**Why Important**: Indicates natural aptitude and interest
**LLM Instruction**: "Focus on subjects rated 'excellent' or 'good'. These indicate both interest and ability."

```json
{
  "questionId": "subject_strengths",
  "weight": 25,
  "priority": "SECONDARY",
  "llmInstruction": "Prioritize subjects rated 'excellent' (25 points) and 'good' (15 points). If student rates Science as 'excellent' and selects healthcare category, this is a very strong match. Ignore subjects rated 'struggling' or 'average' unless no other options exist."
}
```

### 🧠 TERTIARY INDICATORS (Weight: 10-15 points)
**These provide nuance and help differentiate between similar career options.**

#### 5. Personal Traits (Weight: 15 points) - Path B Only
**Question**: "What traits best describe you?"
**Why Useful**: Helps uncertain students discover fit
**LLM Instruction**: "Use these to differentiate between careers within the same category."

```json
{
  "questionId": "personal_traits",
  "weight": 15,
  "priority": "TERTIARY",
  "appliesTo": ["pathB"],
  "llmInstruction": "Use traits to refine career suggestions within the selected category. If student selected 'healthcare' and traits include 'analytical', suggest medical technologist over nurse aide. Don't let traits override category selection."
}
```

#### 6. Impact/Legacy (Weight: 12 points) - Path B Only
**Question**: "How do you want to make an impact?"
**Why Useful**: Reveals deeper motivations
**LLM Instruction**: "Use this to explain WHY the career fits their values."

```json
{
  "questionId": "impact_legacy",
  "weight": 12,
  "priority": "TERTIARY",
  "appliesTo": ["pathB"],
  "llmInstruction": "Use this to enhance explanations and validate career fit. If they want to 'save lives' and selected healthcare, emphasize emergency medicine or nursing. Don't use this to override category selection."
}
```

### ⚠️ CONSTRAINT FACTORS (Weight: Variable)
**These can override other factors when present.**

#### 7. Physical/Personal Constraints (Weight: Override)
**Question**: "Any factors we should consider?"
**Why Critical**: Can eliminate otherwise perfect matches
**LLM Instruction**: "These are hard constraints that can override other preferences."

```json
{
  "questionId": "constraints_considerations",
  "weight": "OVERRIDE",
  "priority": "CONSTRAINT",
  "llmInstruction": "If student mentions physical limitations, financial constraints, or location restrictions, these OVERRIDE other preferences. Example: If they love 'building/fixing' but mention 'back problems', suggest design roles in construction rather than hands-on work."
}
```

## Weighting Formula for LLM

### Path A (Clear Direction) Formula
```
Career Match Score = 
  (Career Category Match × 50) +
  (Specific Interest Match × 45) +
  (Education Feasibility × 30) +
  (Subject Alignment × 25) +
  (Constraint Penalties × -50 to 0)

Maximum Score: 150 points
```

### Path B (Uncertain) Formula
```
Career Match Score = 
  (Career Category Match × 50) +
  (Education Feasibility × 30) +
  (Subject Alignment × 25) +
  (Personality Traits Match × 15) +
  (Values/Impact Alignment × 12) +
  (Constraint Penalties × -50 to 0)

Maximum Score: 132 points
```

## LLM Prompt Structure with Weights

### Enhanced AI Prompt Template
```
You are a career counselor analyzing student responses with the following WEIGHTED IMPORTANCE:

CRITICAL FACTORS (Must dominate your recommendations):
1. CAREER CATEGORY (Weight: 50/50) - Student selected: "{career_category}"
   → This is their PRIMARY interest. 80% of your recommendations must align with this category.
   
2. SPECIFIC INTEREST (Weight: 45/50) - Student mentioned: "{specific_career_interest}" [Path A only]
   → This is their explicit career direction. Validate and build around this.

3. EDUCATION COMMITMENT (Weight: 30/50) - Student willing to pursue: "{education_commitment}"
   → HARD CONSTRAINT: Never suggest careers requiring more education than this.

IMPORTANT FACTORS (Use for refinement):
4. SUBJECT STRENGTHS (Weight: 25/50) - Student rated as excellent/good: "{excellent_subjects}"
   → Use these to validate career fit and identify specific roles within the category.

5. PERSONALITY TRAITS (Weight: 15/50) - Student described as: "{personal_traits}" [Path B only]
   → Use to differentiate between similar careers within the same category.

SUPPORTING FACTORS (Use for explanation and validation):
6. VALUES/IMPACT (Weight: 12/50) - Student wants to: "{impact_legacy}" [Path B only]
   → Use to explain WHY careers fit their deeper motivations.

CONSTRAINT OVERRIDES:
7. LIMITATIONS (Override weight) - Student mentioned: "{constraints_considerations}"
   → These can override other preferences if they create barriers.

MATCHING INSTRUCTIONS:
- Start with career category as primary filter (50% weight)
- Apply education constraint as secondary filter (30% weight)  
- Use subject strengths to identify specific roles (25% weight)
- Use personality/values for explanation and refinement (15-12% weight)
- Apply constraints as final filter (override weight)

EXPLANATION REQUIREMENTS:
Always explain matches using this hierarchy:
"This [CAREER] matches because you selected '[CATEGORY]' (primary factor), are willing to pursue [EDUCATION] (feasibility), and rated yourself excellent in [SUBJECTS] (aptitude), which directly aligns with [CAREER] requirements."
```

## Implementation in Code

### Weighted Scoring Algorithm
```typescript
interface QuestionWeight {
  questionId: string;
  weight: number;
  priority: 'PRIMARY' | 'SECONDARY' | 'TERTIARY' | 'CONSTRAINT';
  appliesTo?: string[];
  isHardConstraint?: boolean;
}

const QUESTION_WEIGHTS: QuestionWeight[] = [
  {
    questionId: 'career_category',
    weight: 50,
    priority: 'PRIMARY',
    appliesTo: ['pathA', 'pathB']
  },
  {
    questionId: 'specific_career_interest',
    weight: 45,
    priority: 'PRIMARY',
    appliesTo: ['pathA']
  },
  {
    questionId: 'education_commitment',
    weight: 30,
    priority: 'SECONDARY',
    appliesTo: ['pathA', 'pathB'],
    isHardConstraint: true
  },
  {
    questionId: 'subject_strengths',
    weight: 25,
    priority: 'SECONDARY',
    appliesTo: ['pathA', 'pathB']
  },
  {
    questionId: 'personal_traits',
    weight: 15,
    priority: 'TERTIARY',
    appliesTo: ['pathB']
  },
  {
    questionId: 'impact_legacy',
    weight: 12,
    priority: 'TERTIARY',
    appliesTo: ['pathB']
  }
];

function calculateWeightedScore(career: Career, responses: AssessmentResponse): number {
  let totalScore = 0;
  let maxPossibleScore = 0;
  
  QUESTION_WEIGHTS.forEach(weight => {
    if (!weight.appliesTo?.includes(responses.pathTaken)) return;
    
    maxPossibleScore += weight.weight;
    
    const responseValue = responses.responses[weight.questionId];
    const careerScore = calculateQuestionScore(career, weight.questionId, responseValue);
    
    totalScore += (careerScore * weight.weight);
  });
  
  // Normalize to 0-100 scale
  return Math.round((totalScore / maxPossibleScore) * 100);
}
```

### Enhanced AI Prompt Generation
```typescript
function generateWeightedPrompt(responses: AssessmentResponse): string {
  const weights = QUESTION_WEIGHTS.filter(w => 
    w.appliesTo?.includes(responses.pathTaken)
  ).sort((a, b) => b.weight - a.weight);
  
  let prompt = "WEIGHTED STUDENT ANALYSIS (in order of importance):\n\n";
  
  weights.forEach((weight, index) => {
    const value = responses.responses[weight.questionId];
    const importance = weight.priority;
    
    prompt += `${index + 1}. ${weight.questionId.toUpperCase()} (${importance} - Weight: ${weight.weight})\n`;
    prompt += `   Student Response: "${value}"\n`;
    prompt += `   LLM Instruction: ${getLLMInstruction(weight.questionId)}\n\n`;
  });
  
  return prompt;
}
```

## Benefits of Weighted System

### 1. Clear LLM Guidance
- **Explicit Priorities**: LLM knows career category is 5x more important than personality traits
- **Constraint Handling**: Education limits are treated as hard constraints
- **Explanation Logic**: Weighted factors create clear cause-and-effect explanations

### 2. Better Career Matches
- **Primary Filter**: Career category eliminates 80% of irrelevant careers immediately
- **Secondary Refinement**: Education and subjects narrow to realistic, achievable options
- **Tertiary Personalization**: Traits and values differentiate between similar careers

### 3. Improved Explainability
- **Hierarchical Explanations**: "Primary reason: you selected healthcare. Supporting factors: excellent in science, want to help others"
- **Clear Logic**: Students understand why careers were suggested
- **Counselor Insights**: Counselors see the weighted reasoning behind recommendations

### 4. Reduced Scattered Matches
- **Focused Results**: 80% of suggestions align with primary category selection
- **Realistic Options**: Education constraints eliminate unrealistic suggestions
- **Quality over Quantity**: Fewer, more relevant career suggestions

This weighting system ensures the LLM understands student priorities clearly and generates focused, explainable career recommendations that align with what students actually want to do.