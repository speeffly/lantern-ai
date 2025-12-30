# 🔄 Lantern AI - Primary Flow Sequences

## 📋 **Flow 1: Anonymous Career Exploration**

### **Sequence Diagram**
```
Student → Homepage → Assessment → AI Processing → Results → Action Plan

┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│ Student │    │Frontend │    │Backend  │    │AI Service│   │Database │
└────┬────┘    └────┬────┘    └────┬────┘    └────┬────┘    └────┬────┘
     │              │              │              │              │
     │ 1. Visit homepage           │              │              │
     ├─────────────►│              │              │              │
     │              │              │              │              │
     │ 2. Enter ZIP code (optional)│              │              │
     ├─────────────►│              │              │              │
     │              │              │              │              │
     │ 3. Start assessment         │              │              │
     ├─────────────►│              │              │              │
     │              │ 4. Get questions            │              │
     │              ├─────────────►│              │              │
     │              │◄─────────────┤              │              │
     │              │              │              │              │
     │ 5. Answer questions (12)    │              │              │
     ├─────────────►│              │              │              │
     │              │              │              │              │
     │ 6. Submit assessment        │              │              │
     ├─────────────►│              │              │              │
     │              │ 7. Process answers          │              │
     │              ├─────────────►│              │              │
     │              │              │ 8. Generate AI recommendations │
     │              │              ├─────────────►│              │
     │              │              │◄─────────────┤              │
     │              │              │ 9. Store session            │
     │              │              ├─────────────────────────────►│
     │              │◄─────────────┤              │              │
     │              │              │              │              │
     │ 10. View career matches     │              │              │
     │◄─────────────┤              │              │              │
     │              │              │              │              │
     │ 11. Select career for details│             │              │
     ├─────────────►│              │              │              │
     │              │ 12. Get career details      │              │
     │              ├─────────────►│              │              │
     │              │◄─────────────┤              │              │
     │              │              │              │              │
     │ 13. Generate action plan    │              │              │
     ├─────────────►│              │              │              │
     │              │ 14. Create personalized plan│              │
     │              ├─────────────►│              │              │
     │              │              │ 15. AI-enhanced plan        │
     │              │              ├─────────────►│              │
     │              │              │◄─────────────┤              │
     │              │◄─────────────┤              │              │
     │              │              │              │              │
     │ 16. View action plan        │              │              │
     │◄─────────────┤              │              │              │
```

### **Detailed Steps**

#### **Phase 1: Initial Engagement (Steps 1-3)**
1. **Homepage Visit**: Student lands on Lantern AI homepage
   - Sees value proposition and call-to-action
   - Optional ZIP code entry for location-based recommendations
   - No account required to start

2. **Assessment Start**: Student clicks "Start Your Career Journey"
   - Creates anonymous session ID
   - Stores session in browser localStorage
   - Redirects to assessment page

#### **Phase 2: Assessment (Steps 4-6)**
3. **Question Delivery**: Frontend fetches assessment questions
   - 12 questions across 4 categories
   - Progressive disclosure (one question at a time)
   - Auto-save answers to prevent data loss

4. **Answer Collection**: Student responds to questions
   - Multiple choice format
   - Progress indicator shows completion
   - Ability to go back and change answers

#### **Phase 3: AI Processing (Steps 7-9)**
5. **Answer Processing**: Backend analyzes responses
   - Converts answers to student profile
   - Calculates interest and skill vectors
   - Determines education and work preferences

6. **AI Recommendation Generation**: AI service creates personalized content
   - Career pathway suggestions
   - Academic plan recommendations
   - Local job market analysis
   - Skill gap identification
   - Action item prioritization

7. **Session Storage**: Results stored for anonymous access
   - Session data cached in database
   - 30-day expiration for anonymous sessions
   - Linked to browser session ID

#### **Phase 4: Results & Planning (Steps 10-16)**
8. **Career Matching**: Display top career matches
   - Match scores with explanations
   - Local demand indicators
   - Salary information
   - Reasoning factors

9. **Career Exploration**: Detailed career information
   - Job descriptions and responsibilities
   - Education requirements
   - Local opportunities
   - Related training programs

10. **Action Plan Generation**: Personalized step-by-step guidance
    - Immediate, short-term, and long-term actions
    - Resource links and contacts
    - Progress tracking capabilities
    - Print-friendly format

---

## 📋 **Flow 2: Account Creation & Registered User Journey**

### **Sequence Diagram**
```
Student → Registration → Profile → Enhanced Features → Progress Tracking

┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│ Student │    │Frontend │    │Backend  │    │Auth Svc │    │Database │
└────┬────┘    └────┬────┘    └────┬────┘    └────┬────┘    └────┬────┘
     │              │              │              │              │
     │ 1. Click "Create Account"   │              │              │
     ├─────────────►│              │              │              │
     │              │              │              │              │
     │ 2. Fill registration form   │              │              │
     ├─────────────►│              │              │              │
     │              │              │              │              │
     │ 3. Submit registration      │              │              │
     ├─────────────►│              │              │              │
     │              │ 4. Validate & create user   │              │
     │              ├─────────────►│              │              │
     │              │              │ 5. Hash password            │
     │              │              ├─────────────►│              │
     │              │              │              │ 6. Store user│
     │              │              │              ├─────────────►│
     │              │              │              │◄─────────────┤
     │              │              │◄─────────────┤              │
     │              │              │ 7. Link anonymous session  │
     │              │              ├─────────────────────────────►│
     │              │              │ 8. Generate JWT token       │
     │              │              ├─────────────►│              │
     │              │              │◄─────────────┤              │
     │              │◄─────────────┤              │              │
     │              │              │              │              │
     │ 9. Redirect to dashboard    │              │              │
     │◄─────────────┤              │              │              │
     │              │              │              │              │
     │ 10. Complete profile        │              │              │
     ├─────────────►│              │              │              │
     │              │ 11. Update profile          │              │
     │              ├─────────────►│              │              │
     │              │              │              │ 12. Store profile│
     │              │              │              ├─────────────►│
     │              │◄─────────────┤              │              │
     │              │              │              │              │
     │ 13. Access enhanced features│              │              │
     ├─────────────►│              │              │              │
```

### **Enhanced Features for Registered Users**

#### **Dashboard Features**
- **Progress Tracking**: Visual progress indicators
- **Saved Results**: Persistent career matches and plans
- **Profile Management**: Editable interests and preferences
- **Recommendation History**: Track AI suggestions over time

#### **Advanced AI Features**
- **Personalized Updates**: AI learns from user interactions
- **Comparative Analysis**: "What if" scenario exploration
- **Progress Insights**: AI-powered progress recommendations
- **Trend Analysis**: Career market changes over time

---

## 📋 **Flow 3: Counselor Workflow**

### **Sequence Diagram**
```
Counselor → Login → Student Management → Analytics → Guidance

┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│Counselor│    │Frontend │    │Backend  │    │Auth Svc │    │Database │
└────┬────┘    └────┬────┘    └────┬────┘    └────┬────┘    └────┬────┘
     │              │              │              │              │
     │ 1. Login to counselor portal│              │              │
     ├─────────────►│              │              │              │
     │              │ 2. Authenticate counselor   │              │
     │              ├─────────────►│              │              │
     │              │              │ 3. Verify credentials       │
     │              │              ├─────────────►│              │
     │              │              │◄─────────────┤              │
     │              │◄─────────────┤              │              │
     │              │              │              │              │
     │ 4. View counselor dashboard │              │              │
     │◄─────────────┤              │              │              │
     │              │              │              │              │
     │ 5. Access student list      │              │              │
     ├─────────────►│              │              │              │
     │              │ 6. Get students & progress  │              │
     │              ├─────────────►│              │              │
     │              │              │              │ 7. Query data│
     │              │              │              ├─────────────►│
     │              │              │              │◄─────────────┤
     │              │◄─────────────┤              │              │
     │              │              │              │              │
     │ 8. Select student profile   │              │              │
     ├─────────────►│              │              │              │
     │              │ 9. Get detailed profile     │              │
     │              ├─────────────►│              │              │
     │              │              │              │ 10. Get assessments│
     │              │              │              ├─────────────►│
     │              │              │              │ 11. Get matches│
     │              │              │              ├─────────────►│
     │              │              │              │◄─────────────┤
     │              │◄─────────────┤              │              │
     │              │              │              │              │
     │ 12. Add counselor notes     │              │              │
     ├─────────────►│              │              │              │
     │              │ 13. Store notes             │              │
     │              ├─────────────►│              │              │
     │              │              │              │ 14. Save notes│
     │              │              │              ├─────────────►│
     │              │◄─────────────┤              │              │
     │              │              │              │              │
     │ 15. Generate analytics      │              │              │
     ├─────────────►│              │              │              │
     │              │ 16. Aggregate data          │              │
     │              ├─────────────►│              │              │
     │              │              │              │ 17. Query trends│
     │              │              │              ├─────────────►│
     │              │              │              │◄─────────────┤
     │              │◄─────────────┤              │              │
```

### **Counselor Features**

#### **Student Management**
- **Student List**: View all students with progress indicators
- **Individual Profiles**: Detailed view of student assessments and matches
- **Progress Tracking**: Monitor student engagement and completion
- **Communication Tools**: Templates for parent outreach

#### **Analytics Dashboard**
- **Aggregate Trends**: Popular careers, interests, and sectors
- **Completion Rates**: Assessment and action plan metrics
- **Success Indicators**: Student progress and outcomes
- **Comparative Analysis**: Class, grade, and school comparisons

---

## 📋 **Flow 4: AI Recommendation Generation**

### **Detailed AI Processing Flow**
```
Assessment Data → Profile Analysis → AI Processing → Recommendation Generation

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Assessment     │    │   Profile       │    │      AI         │
│   Answers       │───►│   Analysis      │───►│  Processing     │
│                 │    │                 │    │                 │
│ • 12 responses  │    │ • Interest vec  │    │ • OpenAI API    │
│ • ZIP code      │    │ • Skill profile │    │ • Prompt eng    │
│ • Grade level   │    │ • Preferences   │    │ • Context aware │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
                                                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Fallback      │    │  Recommendation │    │   AI Response   │
│  Generation     │◄───│   Synthesis     │◄───│   Processing    │
│                 │    │                 │    │                 │
│ • Rule-based    │    │ • Career paths  │    │ • Parse JSON    │
│ • Template sys  │    │ • Academic plan │    │ • Validate data │
│ • Local data    │    │ • Action items  │    │ • Error handle  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **AI Processing Steps**

#### **1. Profile Analysis**
```typescript
// Convert assessment answers to structured profile
const profile = {
  interests: extractInterests(answers),
  skills: identifySkills(answers),
  workEnvironment: determineEnvironment(answers),
  educationGoal: assessEducationCommitment(answers),
  location: zipCode,
  grade: gradeLevel
};
```

#### **2. AI Prompt Engineering**
```typescript
const prompt = `
Generate career recommendations for a ${profile.grade}th grade student in ${profile.location}.

Student Profile:
- Interests: ${profile.interests.join(', ')}
- Skills: ${profile.skills.join(', ')}
- Work Environment: ${profile.workEnvironment}
- Education Goal: ${profile.educationGoal}

Please provide:
1. Academic plan for current and next year
2. Career pathway with specific steps
3. Local job market analysis
4. Skill gaps to address
5. Prioritized action items

Format as JSON with specific structure...
`;
```

#### **3. Response Processing**
```typescript
// Process AI response with fallback
try {
  const aiResponse = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 2000
  });
  
  return parseAIResponse(aiResponse.choices[0].message.content);
} catch (error) {
  console.log('AI service unavailable, using fallback');
  return generateFallbackRecommendations(profile);
}
```

#### **4. Fallback System**
```typescript
// Rule-based fallback when AI is unavailable
function generateFallbackRecommendations(profile: StudentProfile) {
  return {
    academicPlan: generateAcademicPlan(profile),
    careerPathway: createCareerPathway(profile),
    localJobs: findLocalJobs(profile.location),
    skillGaps: identifySkillGaps(profile),
    actionItems: createActionItems(profile)
  };
}
```

---

## 📋 **Flow 5: Data Integration & External APIs**

### **External Service Integration**
```
Lantern AI ←→ OpenAI API ←→ O*NET API ←→ BLS API ←→ Job APIs

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Lantern AI    │    │   OpenAI API    │    │   O*NET API     │
│                 │    │                 │    │                 │
│ • User data     │───►│ • AI generation │    │ • Career data   │
│ • Preferences   │    │ • Natural lang  │    │ • Job codes     │
│ • Context       │    │ • Personalized  │    │ • Skills data   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                                             │
         ▼                                             ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Job APIs      │    │   BLS API       │    │  Local Data     │
│                 │    │                 │    │                 │
│ • Indeed API    │    │ • Salary data   │    │ • Cached data   │
│ • LinkedIn API  │    │ • Employment    │    │ • Local jobs    │
│ • Local boards  │    │ • Projections   │    │ • Programs      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Data Flow Management**
```typescript
// Coordinated data fetching with caching
async function getCareerData(careerId: string) {
  // Check cache first
  const cached = await cache.get(`career:${careerId}`);
  if (cached) return cached;
  
  // Fetch from multiple sources
  const [onetData, salaryData, localJobs] = await Promise.all([
    fetchONETData(careerId),
    fetchBLSSalaryData(careerId),
    fetchLocalJobs(careerId, zipCode)
  ]);
  
  // Combine and cache
  const careerData = combineCareerData(onetData, salaryData, localJobs);
  await cache.set(`career:${careerId}`, careerData, 3600); // 1 hour
  
  return careerData;
}
```

---

## 🎯 **Key Success Factors**

### **User Experience**
- **Seamless Flow**: Minimal friction from start to results
- **Progressive Disclosure**: Information revealed as needed
- **Mobile-First**: Optimized for smartphone usage
- **Fast Performance**: Quick loading and responsive interactions

### **AI Integration**
- **Intelligent Fallbacks**: System works even when AI is unavailable
- **Cost Optimization**: Efficient use of AI API calls
- **Quality Control**: Validation and error handling for AI responses
- **Continuous Learning**: System improves with usage data

### **Educational Impact**
- **Actionable Guidance**: Clear next steps for students
- **Local Relevance**: Information specific to student's location
- **Age-Appropriate**: Content suitable for high school students
- **Counselor Support**: Tools to enhance counselor effectiveness

This comprehensive flow documentation provides the blueprint for understanding how all components of Lantern AI work together to deliver an effective career guidance experience for rural students.