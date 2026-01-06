# Lantern AI - Technical Architecture & Deployment Guide

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture Components](#architecture-components)
4. [Database Design](#database-design)
5. [API Architecture](#api-architecture)
6. [AI Integration](#ai-integration)
7. [Production Deployment](#production-deployment)
8. [Security Implementation](#security-implementation)
9. [Performance & Scalability](#performance--scalability)
10. [Development Workflow](#development-workflow)
11. [Monitoring & Analytics](#monitoring--analytics)
12. [Troubleshooting Guide](#troubleshooting-guide)

---

## 🎯 System Overview

**Lantern AI** is a comprehensive career exploration platform designed specifically for rural high school students. The system provides AI-powered career recommendations, personalized academic planning, and actionable career pathways.

### Core Mission
- **Target Audience**: Rural high school students (grades 9-12)
- **Primary Goal**: Bridge the career guidance gap in rural communities
- **Key Features**: AI recommendations, local job market analysis, academic planning, counselor tools

### System Architecture Pattern
- **Pattern**: Microservices with API Gateway
- **Deployment**: Cloud-native with containerization
- **Data Flow**: Event-driven with real-time feedback loops
- **Scalability**: Horizontal scaling with load balancing

---

## 🛠 Technology Stack

### **Frontend Stack**
```
Framework:     Next.js 14.2.35 (React 18)
Language:      TypeScript 5.3+
Styling:       Tailwind CSS 3.x
State:         React Hooks + Local Storage
Routing:       Next.js App Router
Build:         Next.js Static Export
Deployment front end:    AWS Amplify


```

### **Backend Stack**
```
Runtime:       Node.js 20.x
Framework:     Express.js 4.18+
Language:      TypeScript 5.3+
Database:      PostgreSQL 15+ (Primary)
ORM:           Custom SQL with pg driver
Cache:         Redis (Future implementation)
File Storage:  Local filesystem + Cloud storage
Deployment:    Render.com
```

### **AI & Machine Learning**
```
Primary AI:    OpenAI GPT-3.5-turbo
Alternative:   Google Gemini 1.5-flash
Embeddings:    OpenAI text-embedding-ada-002
Vector DB:     Future: Pinecone/Weaviate
ML Pipeline:   Custom feedback learning system
```

### **Database & Storage**
```
Primary DB:    PostgreSQL 15+ (Render.com)
Connection:    pg driver with connection pooling
Migrations:    Custom SQL scripts
Backup:        Automated daily backups
File Storage:  Local + AWS S3 (planned)
```

### **DevOps & Infrastructure**
```
Version Control:  Git + GitHub
CI/CD:           GitHub Actions + Render auto-deploy
Monitoring:      Render.com built-in + Custom logging
Security:        Helmet.js, CORS, JWT authentication
SSL/TLS:         Automatic via Render.com & Amplify
```

### **External APIs & Services**
```
Career Data:     O*NET Web Services API
Job Listings:    Indeed API, LinkedIn API (planned)
Location:        ZIP code to location mapping
Email:           Nodemailer (SMTP)
Analytics:       Custom implementation
```

---

## 🏗 Architecture Components

### **High-Level Architecture**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Database      │
│   (Next.js)     │◄──►│   (Express.js)  │◄──►│  (PostgreSQL)   │
│   AWS Amplify   │    │   Render.com    │    │   Render.com    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       ▼                       │
         │              ┌─────────────────┐              │
         │              │   AI Services   │              │
         └──────────────►│   (OpenAI)      │◄─────────────┘
                        │   (Gemini)      │
                        └─────────────────┘
```

### **Frontend Architecture**
```
lantern-ai/frontend/
├── app/                          # Next.js App Router
│   ├── components/               # Reusable UI components
│   │   ├── Header.tsx           # Navigation header
│   │   ├── FeedbackWidget.tsx   # AI feedback collection
│   │   └── JobListings.tsx      # Job search integration
│   ├── (auth)/                  # Authentication pages
│   │   ├── login/               # User login
│   │   └── register/            # User registration
│   ├── dashboard/               # Student dashboard
│   ├── results/                 # Assessment results
│   ├── counselor-results/       # Enhanced counselor view
│   ├── feedback-analytics/      # Feedback dashboard
│   └── globals.css              # Global styles
├── public/                      # Static assets
└── next.config.js              # Next.js configuration
```

### **Backend Architecture**
```
lantern-ai/backend/
├── src/
│   ├── routes/                  # API route handlers
│   │   ├── auth.ts             # Authentication endpoints
│   │   ├── sessions.ts         # Assessment sessions
│   │   ├── careers.ts          # Career data endpoints
│   │   ├── feedback.ts         # Feedback system API
│   │   └── counselorAssessment.ts
│   ├── services/               # Business logic layer
│   │   ├── aiRecommendationService.ts  # AI integration
│   │   ├── feedbackService.ts          # Feedback processing
│   │   ├── databaseServicePG.ts        # Database operations
│   │   └── careerMatchingService.ts    # Career matching logic
│   ├── types/                  # TypeScript definitions
│   │   └── index.ts           # Shared type definitions
│   └── index.ts               # Express server entry point
├── dist/                      # Compiled JavaScript
└── package.json              # Dependencies & scripts
```

---

## 🗄 Database Design

### **Database Schema Overview**
```sql
-- Core User Management
users                    # User accounts (students, counselors, parents)
student_profiles         # Student-specific data
counselor_profiles       # Counselor-specific data
parent_profiles         # Parent-specific data

-- Assessment System
assessment_sessions     # Assessment tracking
assessment_answers      # Individual question responses

-- Career & Recommendations
career_recommendations  # Generated career matches
action_plans           # Personalized action plans

-- AI Feedback System
recommendation_feedback # User feedback on recommendations
ai_learning_data       # Processed feedback for AI improvement
```

### **Key Database Tables**

#### **Users Table**
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'counselor', 'parent')),
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);
```

#### **Assessment Sessions**
```sql
CREATE TABLE assessment_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    zip_code VARCHAR(10),
    status VARCHAR(20) DEFAULT 'in_progress',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    expires_at TIMESTAMP NOT NULL
);
```

#### **Feedback System**
```sql
CREATE TABLE recommendation_feedback (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    session_id INTEGER REFERENCES assessment_sessions(id),
    career_code VARCHAR(50) NOT NULL,
    career_title VARCHAR(200) NOT NULL,
    feedback_type VARCHAR(20) NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    is_helpful BOOLEAN,
    comment TEXT,
    improvement_suggestions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Database Connection & Performance**
```typescript
// Connection Pool Configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 5,                    // Connection pool size
  idleTimeoutMillis: 60000,  // 60 second idle timeout
  connectionTimeoutMillis: 10000, // 10 second connection timeout
  statement_timeout: 30000,  // 30 second query timeout
  query_timeout: 30000       // 30 second query timeout
});
```

---

## 🔌 API Architecture

### **RESTful API Design**
```
Base URL: https://lantern-ai.onrender.com/api

Authentication:
POST   /api/auth/login           # User login
POST   /api/auth/register        # User registration
POST   /api/auth/logout          # User logout

Assessment System:
POST   /api/sessions/start       # Start assessment session
GET    /api/sessions/:id         # Get session data
POST   /api/sessions/:id/answer  # Submit answer
POST   /api/sessions/:id/complete # Complete assessment

Career System:
GET    /api/careers              # Get career database
GET    /api/careers/:id          # Get specific career
POST   /api/careers/match        # Get career matches

Counselor Tools:
POST   /api/counselor-assessment/submit  # Enhanced assessment
GET    /api/counselor-assessment/:id     # Get results

Feedback System:
POST   /api/feedback/submit      # Submit feedback
GET    /api/feedback/stats       # Get analytics
GET    /api/feedback/insights    # AI learning insights

Action Plans:
GET    /api/action-plans/:careerCode     # Get action plan
POST   /api/action-plans/multiple        # Bulk action plans
```

### **API Response Format**
```typescript
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
}

// Success Response
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully",
  "timestamp": "2025-01-04T10:30:00Z"
}

// Error Response
{
  "success": false,
  "error": "Validation failed",
  "message": "Required fields missing",
  "timestamp": "2025-01-04T10:30:00Z"
}
```

### **Authentication & Authorization**
```typescript
// JWT Token Structure
interface JWTPayload {
  userId: number;
  email: string;
  role: 'student' | 'counselor' | 'parent';
  iat: number;
  exp: number;
}

// Authorization Middleware
const requireAuth = (roles?: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Verify JWT token
    // Check user role if specified
    // Attach user to request object
  };
};
```

---

## 🤖 AI Integration

### **AI Service Architecture**
```typescript
class AIRecommendationService {
  // Primary AI provider (OpenAI)
  static async callOpenAI(context: string): Promise<string>
  
  // Fallback AI provider (Google Gemini)
  static async callGemini(context: string): Promise<string>
  
  // Feedback integration
  static async getFeedbackImprovements(careerMatches: CareerMatch[]): Promise<string[]>
  
  // Context preparation
  static prepareAIContext(profile, answers, careerMatches, zipCode, grade, feedbackImprovements): string
}
```

### **AI Prompt Engineering**
```typescript
// Professional Career Counselor Persona
const systemPrompt = `You are Dr. Sarah Martinez, a professional career counselor with:
- 15+ years experience in rural career development
- PhD in Educational Psychology, specializing in career guidance
- Certified Professional Career Coach (CPCC)
- Expert in rural job markets and educational pathways`;

// Structured Response Format
const responseFormat = {
  academicPlan: {
    currentYear: [/* courses */],
    nextYear: [/* courses */],
    longTerm: [/* post-secondary options */]
  },
  careerPathway: {
    steps: [/* actionable steps */],
    timeline: "specific timeline",
    requirements: [/* education/certification requirements */]
  },
  skillGaps: [/* skills to develop */],
  actionItems: [/* immediate next steps */]
};
```

### **Feedback Learning Loop**
```
1. User receives AI recommendations
2. User provides feedback (rating, comments, suggestions)
3. Feedback processed into learning data
4. AI context enhanced with feedback insights
5. Future recommendations improved based on patterns
```

### **AI Configuration**
```typescript
// Environment Variables
USE_REAL_AI=true                    # Enable real AI vs fallback
AI_PROVIDER=openai                  # Primary: openai, gemini
OPENAI_API_KEY=sk-proj-...         # OpenAI API key
GEMINI_API_KEY=...                 # Google Gemini API key

// Model Configuration
const AI_CONFIG = {
  openai: {
    model: "gpt-3.5-turbo",
    maxTokens: 4000,
    temperature: 0.7
  },
  gemini: {
    model: "gemini-pro",
    temperature: 0.7
  }
};
```

---

## 🚀 Production Deployment

### **Deployment Architecture**
```
┌─────────────────────────────────────────────────────────────┐
│                     Production Environment                   │
├─────────────────────────────────────────────────────────────┤
│  Frontend (AWS Amplify)                                     │
│  ├── Domain: https://main.d2ymtj6aumrj0m.amplifyapp.com    │
│  ├── CDN: CloudFront                                        │
│  ├── SSL: Automatic certificate                             │
│  └── Build: Next.js static export                           │
├─────────────────────────────────────────────────────────────┤
│  Backend API (Render.com)                                   │
│  ├── Domain: https://lantern-ai.onrender.com               │
│  ├── Runtime: Node.js 20.x                                  │
│  ├── SSL: Automatic certificate                             │
│  └── Auto-deploy: GitHub integration                        │
├─────────────────────────────────────────────────────────────┤
│  Database (Render.com PostgreSQL)                           │
│  ├── Version: PostgreSQL 15+                                │
│  ├── Backup: Automated daily                                │
│  ├── SSL: Required connections                              │
│  └── Connection pooling: 5 max connections                  │
└─────────────────────────────────────────────────────────────┘
```

### **Frontend Deployment (AWS Amplify)**
```yaml
# amplify.yml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - cd frontend
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: frontend/out
    files:
      - '**/*'
  cache:
    paths:
      - frontend/node_modules/**/*
```

### **Backend Deployment (Render.com)**
```yaml
# render.yaml
services:
  - type: web
    name: lantern-ai-backend
    env: node
    buildCommand: cd backend && npm install && npm run build
    startCommand: cd backend && npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: USE_REAL_AI
        value: "true"
      - key: FRONTEND_URL
        value: https://main.d2ymtj6aumrj0m.amplifyapp.com
```

### **Environment Variables**
```bash
# Production Environment Variables

# Server Configuration
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://main.d2ymtj6aumrj0m.amplifyapp.com

# Database
DATABASE_URL=postgresql://user:pass@host:port/database

# Authentication
JWT_SECRET=production-secret-key-2025

# AI Services
USE_REAL_AI=true
OPENAI_API_KEY=sk-proj-...
GEMINI_API_KEY=...

# External APIs
INDEED_API_KEY=...
LINKEDIN_API_KEY=...
```

### **Build Process**
```bash
# Backend Build
cd backend
npm install
npm run build    # Compiles TypeScript to JavaScript
npm start        # Starts production server

# Frontend Build
cd frontend
npm install
npm run build    # Creates static export in /out directory
```

---

## 🔒 Security Implementation

### **Authentication & Authorization**
```typescript
// JWT Token Security
const JWT_CONFIG = {
  secret: process.env.JWT_SECRET,
  expiresIn: '24h',
  algorithm: 'HS256'
};

// Password Security
const bcrypt = require('bcrypt');
const saltRounds = 12;
const hashedPassword = await bcrypt.hash(password, saltRounds);
```

### **API Security Middleware**
```typescript
// Security Headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  }
}));

// CORS Configuration
app.use(cors({
  origin: [
    'https://main.d2ymtj6aumrj0m.amplifyapp.com',
    'https://d2ymtj6aumrj0m.amplifyapp.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### **Data Protection**
```typescript
// Input Validation
import { body, validationResult } from 'express-validator';

const validateRegistration = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  body('firstName').trim().isLength({ min: 1, max: 50 }),
  body('lastName').trim().isLength({ min: 1, max: 50 })
];

// SQL Injection Prevention
const query = 'SELECT * FROM users WHERE email = $1';
const result = await pool.query(query, [email]);
```

### **File Upload Security**
```typescript
// Multer Configuration
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});
```

---

## ⚡ Performance & Scalability

### **Database Optimization**
```sql
-- Indexes for Performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_assessment_sessions_user_id ON assessment_sessions(user_id);
CREATE INDEX idx_assessment_sessions_token ON assessment_sessions(session_token);
CREATE INDEX idx_recommendation_feedback_career_code ON recommendation_feedback(career_code);
CREATE INDEX idx_recommendation_feedback_created_at ON recommendation_feedback(created_at);
```

### **Connection Pooling**
```typescript
// PostgreSQL Connection Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 5,                    // Maximum connections
  idleTimeoutMillis: 60000,  // Close idle connections after 60s
  connectionTimeoutMillis: 10000, // Timeout after 10s
  statement_timeout: 30000,  // Query timeout 30s
  query_timeout: 30000       // Query timeout 30s
});
```

### **Caching Strategy**
```typescript
// In-Memory Caching (Current)
const careerCache = new Map();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

// Future: Redis Implementation
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_URL);

const cacheGet = async (key: string) => {
  return await client.get(key);
};

const cacheSet = async (key: string, value: any, ttl: number = 3600) => {
  return await client.setex(key, ttl, JSON.stringify(value));
};
```

### **API Rate Limiting**
```typescript
// Rate Limiting Middleware
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', apiLimiter);
```

### **Frontend Performance**
```typescript
// Next.js Optimization
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  }
};

// Code Splitting
const DynamicComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>Loading...</p>,
  ssr: false
});
```

---

## 🔄 Development Workflow

### **Git Workflow**
```bash
# Branch Strategy
main                    # Production branch
├── develop            # Development branch
├── feature/feedback   # Feature branches
├── hotfix/bug-123    # Hotfix branches
└── release/v1.1.0    # Release branches

# Commit Convention
feat: add feedback system
fix: resolve database connection issue
docs: update API documentation
style: format code with prettier
refactor: optimize career matching algorithm
test: add unit tests for feedback service
```

### **Development Environment Setup**
```bash
# Clone Repository
git clone https://github.com/your-org/lantern-ai.git
cd lantern-ai

# Backend Setup
cd backend
npm install
cp .env.example .env
# Configure environment variables
npm run dev

# Frontend Setup
cd ../frontend
npm install
cp .env.local.example .env.local
# Configure environment variables
npm run dev
```

### **Testing Strategy**
```typescript
// Unit Tests (Jest)
describe('FeedbackService', () => {
  test('should submit feedback successfully', async () => {
    const feedback = {
      careerCode: 'TEST001',
      careerTitle: 'Test Career',
      feedbackType: 'rating',
      rating: 5
    };
    
    const result = await FeedbackService.submitFeedback(feedback);
    expect(result).toBeGreaterThan(0);
  });
});

// Integration Tests
describe('API Endpoints', () => {
  test('POST /api/feedback/submit', async () => {
    const response = await request(app)
      .post('/api/feedback/submit')
      .send(testFeedback)
      .expect(200);
      
    expect(response.body.success).toBe(true);
  });
});
```

### **Code Quality Tools**
```json
// package.json scripts
{
  "scripts": {
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix",
    "format": "prettier --write src/**/*.ts",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

---

## 📊 Monitoring & Analytics

### **Application Monitoring**
```typescript
// Custom Logging Service
class Logger {
  static info(message: string, meta?: any) {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, meta);
  }
  
  static error(message: string, error?: Error, meta?: any) {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error, meta);
  }
  
  static performance(operation: string, duration: number) {
    console.log(`[PERF] ${operation} completed in ${duration}ms`);
  }
}

// Performance Monitoring
const performanceMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    Logger.performance(`${req.method} ${req.path}`, duration);
  });
  
  next();
};
```

### **Health Check Endpoints**
```typescript
// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version
  });
});

// Database Health Check
app.get('/health/database', async (req, res) => {
  try {
    await DatabaseAdapter.query('SELECT 1');
    res.json({ status: 'healthy', database: 'connected' });
  } catch (error) {
    res.status(503).json({ status: 'unhealthy', database: 'disconnected' });
  }
});
```

### **Analytics Dashboard**
```typescript
// Custom Analytics
interface AnalyticsEvent {
  event: string;
  userId?: string;
  sessionId?: string;
  properties: Record<string, any>;
  timestamp: Date;
}

class Analytics {
  static track(event: string, properties: Record<string, any>, userId?: string) {
    // Store analytics event
    // Send to analytics service
  }
  
  static getMetrics(startDate: Date, endDate: Date) {
    // Return aggregated metrics
  }
}
```

---

## 🔧 Troubleshooting Guide

### **Common Issues & Solutions**

#### **Database Connection Issues**
```bash
# Symptoms
❌ PostgreSQL database initialization failed: Error: read ECONNRESET

# Solutions
1. Check DATABASE_URL format:
   postgresql://username:password@host:port/database

2. Verify SSL configuration:
   ssl: { rejectUnauthorized: false }

3. Check connection pool settings:
   max: 5, idleTimeoutMillis: 60000

4. Test connection manually:
   node test-postgres-connection.js
```

#### **Build Failures**
```bash
# TypeScript Compilation Errors
❌ Property 'code' does not exist on type 'Career'

# Solutions
1. Check type definitions in src/types/index.ts
2. Ensure property names match interface
3. Use optional chaining: career.code?.property
4. Run type check: npm run type-check
```

#### **API 404 Errors**
```bash
# Symptoms
❌ https://lantern-ai.onrender.com/api/feedback/submit 404 (Not Found)

# Solutions
1. Check route registration in src/index.ts
2. Verify route file exports: export default router
3. Check deployment status on Render.com
4. Test locally: curl http://localhost:3001/api/feedback/stats
```

#### **Frontend Build Issues**
```bash
# Next.js Build Errors
❌ useSearchParams() should be wrapped in a suspense boundary

# Solutions
1. Wrap component in Suspense boundary
2. Add loading fallback component
3. Use dynamic imports for client-side only components
4. Check Next.js version compatibility
```

### **Performance Issues**
```bash
# Slow API Responses
# Check database query performance
EXPLAIN ANALYZE SELECT * FROM users WHERE email = $1;

# Add missing indexes
CREATE INDEX idx_users_email ON users(email);

# Monitor connection pool
console.log('Pool info:', pool.totalCount, pool.idleCount);
```

### **Deployment Issues**
```bash
# Render.com Deployment Failures
1. Check build logs in Render dashboard
2. Verify environment variables are set
3. Check package.json scripts
4. Ensure all dependencies are in package.json
5. Test build locally: npm run build
```

---

## 📚 Additional Resources

### **Documentation Links**
- [Next.js Documentation](https://nextjs.org/docs)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [Render.com Deployment Guide](https://render.com/docs)
- [AWS Amplify Documentation](https://docs.amplify.aws/)

### **Development Tools**
- **IDE**: VS Code with TypeScript, Prettier, ESLint extensions
- **Database**: pgAdmin, DBeaver for PostgreSQL management
- **API Testing**: Postman, Insomnia for API testing
- **Monitoring**: Render.com dashboard, custom logging
- **Version Control**: GitHub with automated deployments

### **Team Resources**
- **Code Style Guide**: Prettier + ESLint configuration
- **API Documentation**: Postman collection with examples
- **Database Schema**: ER diagrams and migration scripts
- **Deployment Checklist**: Step-by-step deployment guide
- **Troubleshooting**: Common issues and solutions

---

## 🎯 Conclusion

This technical architecture document provides a comprehensive overview of the Lantern AI system. The platform is built with modern, scalable technologies and follows best practices for security, performance, and maintainability.

### **Key Strengths**
- **Scalable Architecture**: Microservices with clear separation of concerns
- **Modern Tech Stack**: Latest versions of proven technologies
- **AI Integration**: Sophisticated AI-powered recommendations with feedback loops
- **Security First**: Comprehensive security measures at all layers
- **Production Ready**: Deployed on reliable cloud infrastructure

### **Future Enhancements**
- **Redis Caching**: Implement Redis for improved performance
- **Microservices**: Split into smaller, focused services
- **Real-time Features**: WebSocket integration for live updates
- **Advanced Analytics**: Machine learning for deeper insights
- **Mobile App**: React Native mobile application

For questions or support, contact the development team or refer to the troubleshooting section above.

---

**Document Version**: 1.0  
**Last Updated**: January 4, 2025  
**Maintained By**: Lantern AI Development Team