# 🏗️ Lantern AI - Complete System Design & Architecture

## 🎯 **Project Overview**

**Lantern AI** is an AI-powered career exploration platform designed specifically for rural high school students (grades 9-12) to discover career pathways in healthcare and infrastructure sectors.

### **🏆 Competition Context**
- **Target**: Presidential Innovation Challenge
- **Focus**: Rural career guidance with AI integration
- **Users**: Students, Counselors, Parents
- **Sectors**: Healthcare & Infrastructure

---

## 🏛️ **System Architecture**

### **High-Level Architecture**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   External      │
│   (Next.js)     │◄──►│   (Express)     │◄──►│   Services      │
│                 │    │                 │    │                 │
│ • React Pages   │    │ • REST API      │    │ • OpenAI API    │
│ • TypeScript    │    │ • TypeScript    │    │ • O*NET API     │
│ • Tailwind CSS  │    │ • SQLite DB     │    │ • BLS API       │
│ • State Mgmt    │    │ • AI Services   │    │ • Job APIs      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Technology Stack**

#### **Frontend**
- **Framework**: Next.js 14 (React 18)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State**: React Hooks + localStorage
- **Forms**: React Hook Form
- **HTTP**: Fetch API

#### **Backend**
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: SQLite (production) / PostgreSQL (future)
- **Authentication**: JWT tokens
- **AI**: OpenAI GPT-3.5/4 integration

#### **Infrastructure**
- **Frontend Hosting**: AWS Amplify
- **Backend Hosting**: Render.com
- **Database**: SQLite file-based
- **CDN**: AWS CloudFront (via Amplify)
- **SSL**: Automatic (Amplify + Render)

---

## 🎭 **User Roles & Personas**

### **1. Student (Primary User)**
- **Age**: 14-18 (grades 9-12)
- **Location**: Rural areas
- **Goals**: Discover careers, create action plans
- **Features**: Assessment, career matching, AI recommendations

### **2. Counselor (Secondary User)**
- **Role**: School guidance counselor
- **Goals**: Support students, track progress
- **Features**: Student dashboards, analytics, guidance tools

### **3. Parent (Tertiary User)**
- **Role**: Student's parent/guardian
- **Goals**: Understand child's career options
- **Features**: Parent summaries, progress tracking

---

## 🔄 **Primary User Flows**

### **Flow 1: Anonymous Career Exploration**
```
1. Student visits homepage
   ↓
2. Enters ZIP code (optional)
   ↓
3. Starts career assessment (12 questions)
   ↓
4. Views career matches with AI explanations
   ↓
5. Explores career details
   ↓
6. Generates action plan
   ↓
7. Optional: Creates account to save progress
```

### **Flow 2: Registered User Journey**
```
1. Student creates account or logs in
   ↓
2. Completes/updates profile
   ↓
3. Takes/retakes assessment
   ↓
4. Views personalized dashboard
   ↓
5. Tracks action plan progress
   ↓
6. Accesses AI-powered recommendations
   ↓
7. Shares results with parents/counselors
```

### **Flow 3: Counselor Workflow**
```
1. Counselor logs in to dashboard
   ↓
2. Views student list and progress
   ↓
3. Reviews individual student profiles
   ↓
4. Adds counselor notes and guidance
   ↓
5. Generates reports and analytics
   ↓
6. Communicates with parents
```

---

## 📊 **Data Architecture**

### **Core Data Models**

#### **User Management**
- `User` - Base user information
- `Student` - Student-specific data
- `Counselor` - Counselor profiles
- `Parent` - Parent information
- `Relationship` - User connections

#### **Assessment System**
- `AssessmentQuestion` - Quiz questions
- `AssessmentAnswer` - User responses
- `StudentProfile` - Derived interests/skills
- `SessionData` - Anonymous sessions

#### **Career System**
- `Career` - Career information
- `CareerMatch` - Matching results
- `CareerPathway` - Step-by-step paths
- `TrainingProgram` - Local programs

#### **AI & Recommendations**
- `AIRecommendations` - AI-generated content
- `LocalJobOpportunity` - Job market data
- `CourseRecommendation` - Academic guidance
- `ActionPlan` - Personalized plans

### **Database Schema (SQLite)**
```sql
-- Users and Authentication
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  role TEXT CHECK(role IN ('student', 'counselor', 'parent')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Student Profiles
CREATE TABLE student_profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  grade INTEGER,
  zip_code TEXT,
  interests TEXT, -- JSON array
  skills TEXT,    -- JSON array
  completed_at DATETIME
);

-- Assessment Data
CREATE TABLE assessment_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  answers TEXT, -- JSON
  completed_at DATETIME
);

-- Career Matches
CREATE TABLE career_matches (
  id TEXT PRIMARY KEY,
  session_id TEXT REFERENCES assessment_sessions(id),
  career_id TEXT,
  match_score INTEGER,
  reasoning TEXT -- JSON array
);
```

---

## 🤖 **AI Integration Architecture**

### **AI Mode Control System**
```typescript
// Environment-based AI mode switching
const USE_REAL_AI = process.env.USE_REAL_AI === 'true';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Three operational modes:
// 1. Fallback Mode (USE_REAL_AI=false)
// 2. Real AI Mode (USE_REAL_AI=true + valid API key)
// 3. Error Mode (USE_REAL_AI=true + invalid/missing API key)
```

### **AI Service Architecture**
```
┌─────────────────────────────────────────────────────────────┐
│                    AI Recommendation Service                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │   Career    │    │  Academic   │    │    Local    │     │
│  │  Pathway    │    │   Plan      │    │    Jobs     │     │
│  │ Generation  │    │ Generation  │    │  Analysis   │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
│                                                             │
│  ┌─────────────┐    ┌─────────────┐                        │
│  │ Skill Gap   │    │   Action    │                        │
│  │  Analysis   │    │   Items     │                        │
│  └─────────────┘    └─────────────┘                        │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                    OpenAI Integration                       │
│  • GPT-3.5/4 for natural language generation              │
│  • Prompt engineering for career guidance                  │
│  • Fallback to rule-based recommendations                  │
│  • Cost optimization with caching                          │
└─────────────────────────────────────────────────────────────┘
```

### **AI Recommendation Types**
1. **Academic Plan**: Course recommendations by year
2. **Career Pathway**: Step-by-step career progression
3. **Local Jobs**: AI-analyzed job market opportunities
4. **Skill Gaps**: Identified skills to develop
5. **Action Items**: Prioritized next steps

---

## 🔐 **Security Architecture**

### **Authentication & Authorization**
```
┌─────────────────────────────────────────────────────────────┐
│                    Security Layers                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Frontend Security:                                         │
│  • HTTPS enforcement                                        │
│  • XSS protection (React built-in)                         │
│  • CSRF tokens                                             │
│  • Input validation                                         │
│                                                             │
│  Backend Security:                                          │
│  • JWT token authentication                                 │
│  • Password hashing (bcrypt)                               │
│  • Rate limiting                                           │
│  • SQL injection prevention                                │
│  • Environment variable protection                         │
│                                                             │
│  Data Security:                                             │
│  • Encrypted data in transit (HTTPS)                       │
│  • Minimal data collection                                 │
│  • Anonymous usage support                                 │
│  • COPPA/FERPA compliance                                  │
└─────────────────────────────────────────────────────────────┘
```

### **Privacy Design**
- **Anonymous First**: Full functionality without account
- **Minimal Data**: Only collect what's necessary
- **Local Storage**: Session data stored in browser
- **Opt-in Registration**: Account creation is optional
- **Data Portability**: Users can export their data

---

## 📱 **Frontend Architecture**

### **Page Structure**
```
frontend/app/
├── page.tsx                    # Homepage
├── assessment/page.tsx         # Career assessment
├── results/page.tsx           # Career matches
├── career-details/page.tsx    # Individual career info
├── action-plan-view/page.tsx  # Action plan display
├── counselor-assessment/      # Counselor-specific assessment
├── counselor-results/         # Counselor results view
├── dashboard/page.tsx         # User dashboard
├── login/page.tsx            # Authentication
├── register/page.tsx         # Account creation
├── profile/page.tsx          # User profile
├── jobs/page.tsx             # Job listings
├── counselor/                # Counselor dashboard
├── parent/                   # Parent dashboard
└── components/               # Reusable components
```

### **Component Architecture**
```
┌─────────────────────────────────────────────────────────────┐
│                    Component Hierarchy                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Layout Components:                                         │
│  • Header - Navigation and user status                     │
│  • Footer - Links and information                          │
│  • Layout - Page wrapper with common elements              │
│                                                             │
│  Feature Components:                                        │
│  • AssessmentForm - Multi-step career quiz                 │
│  • CareerCard - Career match display                       │
│  • ActionPlan - Step-by-step guidance                      │
│  • JobListings - Local job opportunities                   │
│  • AIRecommendations - AI-powered suggestions              │
│                                                             │
│  UI Components:                                             │
│  • Button - Consistent button styling                      │
│  • Input - Form input components                           │
│  • Modal - Popup dialogs                                   │
│  • ProgressBar - Visual progress indicators                │
└─────────────────────────────────────────────────────────────┘
```

### **State Management**
```typescript
// Local state with React hooks
const [results, setResults] = useState<CareerMatch[]>([]);
const [loading, setLoading] = useState(false);
const [user, setUser] = useState<User | null>(null);

// Persistent state with localStorage
localStorage.setItem('assessmentResults', JSON.stringify(results));
localStorage.setItem('userSession', JSON.stringify(session));

// Session management
const sessionId = generateSessionId();
const sessionData = {
  answers: assessmentAnswers,
  timestamp: new Date(),
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
};
```

---

## 🔧 **Backend Architecture**

### **API Structure**
```
backend/src/
├── index.ts                   # Server entry point
├── routes/
│   ├── auth.ts               # Authentication endpoints
│   ├── assessment.ts         # Assessment API
│   ├── careers.ts            # Career matching API
│   ├── counselorAssessment.ts # Counselor-specific API
│   ├── actionPlans.ts        # Action plan API
│   ├── jobs.ts               # Job listings API
│   └── authDB.ts             # Database auth API
├── services/
│   ├── assessmentService.ts   # Assessment logic
│   ├── careerService.ts      # Career matching
│   ├── aiRecommendationService.ts # AI integration
│   ├── counselorGuidanceService.ts # Counselor features
│   ├── jobListingService.ts  # Job market data
│   ├── authService.ts        # Authentication
│   ├── databaseService.ts    # Database operations
│   └── sessionService.ts     # Session management
├── types/
│   └── index.ts              # TypeScript definitions
└── data/
    ├── questions.json        # Assessment questions
    ├── counselor-questions.json # Counselor questions
    └── careers.json          # Career database
```

### **API Endpoints**
```
Authentication:
POST   /api/auth/register     # Create account
POST   /api/auth/login        # User login
POST   /api/auth/logout       # User logout
GET    /api/auth/profile      # Get user profile

Assessment:
GET    /api/assessment/questions    # Get quiz questions
POST   /api/assessment/submit       # Submit answers
GET    /api/assessment/results      # Get career matches

Careers:
GET    /api/careers                 # List all careers
GET    /api/careers/:id             # Get career details
POST   /api/careers/match           # Get career matches
GET    /api/careers/:id/pathway     # Get career pathway

AI Recommendations:
POST   /api/ai/recommendations      # Get AI suggestions
POST   /api/ai/academic-plan        # Get academic plan
POST   /api/ai/local-jobs          # Get local job analysis

Counselor:
POST   /api/counselor/assessment    # Counselor assessment
GET    /api/counselor/students      # Student list
GET    /api/counselor/analytics     # Usage analytics

Jobs:
GET    /api/jobs                    # Local job listings
GET    /api/jobs/search             # Job search
```

### **Service Layer Architecture**
```typescript
// Service pattern for business logic
export class CareerService {
  static getCareerMatches(profile: StudentProfile, zipCode: string): CareerMatch[] {
    // Career matching algorithm
  }
  
  static getCareerDetails(careerId: string): Career {
    // Career information retrieval
  }
}

export class AIRecommendationService {
  static async generateRecommendations(
    profile: StudentProfile,
    answers: AssessmentAnswer[],
    topCareers: CareerMatch[]
  ): Promise<AIRecommendations> {
    // AI-powered recommendation generation
  }
}
```

---

## 🎯 **Assessment System Design**

### **Question Categories**
1. **Interests** (4 questions)
   - Work environment preferences
   - Activity preferences
   - Subject interests
   - Career sector inclinations

2. **Skills** (3 questions)
   - Academic strengths
   - Practical skills
   - Problem-solving approaches

3. **Preferences** (3 questions)
   - Team vs individual work
   - Indoor vs outdoor work
   - Helping others importance

4. **Education** (2 questions)
   - Education commitment level
   - Learning style preferences

### **Matching Algorithm**
```typescript
// Career matching logic
function calculateCareerMatch(
  answers: AssessmentAnswer[],
  career: Career,
  zipCode: string
): CareerMatch {
  let score = 0;
  const reasons: string[] = [];
  
  // Interest alignment (40% weight)
  score += calculateInterestMatch(answers, career) * 0.4;
  
  // Skill alignment (30% weight)
  score += calculateSkillMatch(answers, career) * 0.3;
  
  // Education fit (20% weight)
  score += calculateEducationMatch(answers, career) * 0.2;
  
  // Local demand (10% weight)
  score += calculateLocalDemand(career, zipCode) * 0.1;
  
  return {
    career,
    matchScore: Math.round(score),
    reasoningFactors: reasons,
    localDemand: getLocalDemand(career, zipCode)
  };
}
```

---

## 🚀 **Deployment Architecture**

### **Production Environment**
```
┌─────────────────────────────────────────────────────────────┐
│                    Production Setup                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Frontend (AWS Amplify):                                    │
│  • Automatic builds from Git                               │
│  • CDN distribution                                        │
│  • SSL certificates                                        │
│  • Custom domain support                                   │
│                                                             │
│  Backend (Render.com):                                      │
│  • Node.js runtime                                         │
│  • SQLite database                                         │
│  • Environment variables                                   │
│  • Automatic deployments                                   │
│                                                             │
│  External Services:                                         │
│  • OpenAI API (AI recommendations)                         │
│  • O*NET API (career data)                                 │
│  • BLS API (salary data)                                   │
└─────────────────────────────────────────────────────────────┘
```

### **Environment Configuration**
```bash
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=https://api.lantern-ai.com
NEXT_PUBLIC_ENVIRONMENT=production

# Backend (.env)
NODE_ENV=production
PORT=3001
DATABASE_URL=./database.sqlite
JWT_SECRET=your-secret-key
OPENAI_API_KEY=your-openai-key
USE_REAL_AI=true
CORS_ORIGIN=https://lantern-ai.com
```

---

## 📈 **Performance & Scalability**

### **Performance Targets**
- **Page Load**: < 3 seconds
- **API Response**: < 2 seconds
- **Assessment**: < 10 minutes
- **AI Generation**: < 5 seconds

### **Optimization Strategies**
```
Frontend Optimization:
• Code splitting with Next.js
• Image optimization
• Lazy loading
• Caching strategies
• Bundle size optimization

Backend Optimization:
• Database indexing
• Query optimization
• Response caching
• Connection pooling
• Rate limiting

AI Optimization:
• Response caching
• Prompt optimization
• Fallback strategies
• Cost monitoring
```

### **Scalability Plan**
```
Current Capacity:
• 100 concurrent users
• 1,000 assessments/day
• SQLite database

Future Scaling:
• PostgreSQL migration
• Redis caching
• Load balancing
• CDN optimization
• Microservices architecture
```

---

## 🔍 **Monitoring & Analytics**

### **Key Metrics**
```
User Engagement:
• Assessment completion rate
• Account creation rate
• Return user rate
• Session duration

System Performance:
• Page load times
• API response times
• Error rates
• Uptime percentage

Business Metrics:
• Career matches generated
• Action plans created
• AI recommendations used
• User satisfaction scores
```

### **Error Handling**
```typescript
// Comprehensive error handling
try {
  const recommendations = await AIRecommendationService.generate(profile);
  return recommendations;
} catch (error) {
  console.error('AI service error:', error);
  
  // Fallback to rule-based recommendations
  return generateFallbackRecommendations(profile);
}
```

---

## 🎓 **Educational Impact Design**

### **Learning Outcomes**
1. **Career Awareness**: Students discover new career options
2. **Self-Knowledge**: Understanding of interests and skills
3. **Planning Skills**: Creating actionable career plans
4. **AI Literacy**: Understanding AI recommendations
5. **Decision Making**: Informed career choices

### **Success Metrics**
- 80% report better understanding of career options
- 70% feel more confident about career decisions
- 60% take action on at least one recommendation
- 50% share results with family or counselors

---

This comprehensive design provides the foundation for understanding how Lantern AI works as a complete system, from user interactions to AI integration to deployment architecture.