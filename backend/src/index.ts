import './loadEnv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import sessionRoutes from './routes/sessions';
import careersRoutes from './routes/careers';
import authRoutes from './routes/auth';
import authDBRoutes from './routes/authDB';
import actionPlansRoutes from './routes/actionPlans';
import counselorAssessmentRoutes from './routes/counselorAssessment';
import jobsRoutes from './routes/jobs';
import feedbackRoutes from './routes/feedback';
import comprehensiveGuidanceRoutes from './routes/comprehensiveGuidance';
import { DatabaseAdapter } from './services/databaseAdapter';

// Load environment variables
dotenv.config();

// Build CORS allowlist from env first, then sensible defaults
const allowedOrigins = [
  ...(process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',').map(url => url.trim()) : []),
  ...(process.env.NODE_ENV === 'production'
    ? [
        'https://main.d2ymtj6aumrj0m.amplifyapp.com',  // Old domain
        'https://d2ymtj6aumrj0m.amplifyapp.com',       // Old domain
        'https://main.d36ebthmdi6xdg.amplifyapp.com',  // New domain
        'https://d36ebthmdi6xdg.amplifyapp.com',       // New domain
        'https://*.amplifyapp.com'                     // Wildcard for any Amplify domain
      ]
    : ['http://localhost:3000', 'http://localhost:3001'])
].filter(Boolean);

// Debug: Check if OpenAI API key is loaded
console.log('🔑 Environment check - OpenAI API key loaded:', !!process.env.OPENAI_API_KEY);
console.log('🔑 Environment check - API key length:', process.env.OPENAI_API_KEY?.length || 0);
console.log('🔧 Environment check - USE_REAL_AI flag:', process.env.USE_REAL_AI || 'not set');
console.log('💰 Note: If using real AI, ensure OpenAI account has sufficient credits');

// Debug: CORS configuration
console.log('🌐 CORS configuration updated for new Amplify domain:');
console.log('   - Environment:', process.env.NODE_ENV);
console.log('   - Frontend URL:', process.env.FRONTEND_URL);
console.log('   - Port:', process.env.PORT || 3002);
console.log('   - Allowed origins:', allowedOrigins);
console.log('   - Deployment timestamp:', new Date().toISOString());

// Initialize database

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Check if origin matches Amplify pattern
    if (origin.match(/^https:\/\/.*\.amplifyapp\.com$/)) {
      return callback(null, true);
    }
    
    // Log rejected origins for debugging
    console.log('🚫 CORS rejected origin:', origin);
    console.log('🌐 Allowed origins:', allowedOrigins);
    
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Handle preflight requests
app.options('*', cors());

// Root route - API welcome page
app.get('/', (req, res) => {
  // Check if request accepts HTML (browser) or JSON (API client)
  if (req.headers.accept && req.headers.accept.includes('text/html')) {
    // Send HTML response for browsers
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Lantern AI API</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
          .header { color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; }
          .status { color: #059669; font-weight: bold; }
          .endpoint { background: #f3f4f6; padding: 10px; margin: 5px 0; border-radius: 5px; }
          .link { color: #2563eb; text-decoration: none; }
          .link:hover { text-decoration: underline; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🚀 Lantern AI API</h1>
          <p>AI-Powered Career Exploration Platform for Rural Students</p>
          <p class="status">Status: Running ✅</p>
        </div>
        
        <h2>🏆 Presidential Innovation Challenge 2025</h2>
        
        <h3>🌐 Frontend Application</h3>
        <p><a href="https://main.d2ymtj6aumrj0m.amplifyapp.com" class="link" target="_blank">
          Visit Lantern AI Platform →
        </a></p>
        
        <h3>📡 API Endpoints</h3>
        <div class="endpoint">GET /health - Health check</div>
        <div class="endpoint">GET /api - API information</div>
        <div class="endpoint">POST /api/auth/* - Authentication</div>
        <div class="endpoint">GET /api/counselor-assessment/* - Enhanced career assessment</div>
        <div class="endpoint">GET /api/careers/* - Career recommendations</div>
        <div class="endpoint">GET /api/jobs/* - Job listings</div>
        
        <h3>🤖 AI Features</h3>
        <ul>
          <li>Career matching with ML algorithms</li>
          <li>OpenAI-powered personalized recommendations</li>
          <li>Local job market analysis (40-mile radius)</li>
          <li>Academic pathway planning</li>
          <li>Multi-user system (students, counselors, parents)</li>
        </ul>
        
        <p><em>Built for rural students to explore healthcare and infrastructure careers</em></p>
      </body>
      </html>
    `);
  } else {
    // Send JSON response for API clients
    res.json({
      name: 'Lantern AI API',
      description: 'AI-Powered Career Exploration Platform for Rural Students',
      version: '1.0.0',
      status: 'Running',
      timestamp: new Date().toISOString(),
      endpoints: {
        health: '/health',
        api: '/api',
        auth: '/api/auth',
        authDB: '/api/auth-db',
        sessions: '/api/sessions',
        counselorAssessment: '/api/counselor-assessment',
        careers: '/api/careers',
        jobs: '/api/jobs',
        actionPlans: '/api/action-plans'
      },
      documentation: {
        frontend: 'https://main.d2ymtj6aumrj0m.amplifyapp.com',
        github: 'https://github.com/your-username/lantern-ai'
      },
      competition: 'Presidential Innovation Challenge 2025'
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  const dbInfo = DatabaseAdapter.getDatabaseInfo();
  res.json({
    status: 'OK',
    message: 'Lantern AI API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    database: {
      status: DatabaseAdapter.isReady() ? 'Connected' : 'Disconnected',
      type: dbInfo.type,
      connectionInfo: dbInfo.connectionInfo
    },
    environment: process.env.NODE_ENV || 'development'
  });
});

// Database info endpoint
app.get('/api/database/info', (req, res) => {
  try {
    const dbInfo = DatabaseAdapter.getDatabaseInfo();
    res.json({
      success: true,
      data: dbInfo,
      message: 'Database information retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get database info'
    });
  }
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/auth-db', authDBRoutes); // New database-enabled auth routes
app.use('/api/sessions', sessionRoutes);
app.use('/api/counselor-assessment', counselorAssessmentRoutes); // Enhanced assessment
app.use('/api/careers', careersRoutes);
app.use('/api/jobs', jobsRoutes); // Job listings
app.use('/api/action-plans', actionPlansRoutes);
app.use('/api/feedback', feedbackRoutes); // Feedback system for AI improvement
app.use('/api/comprehensive-guidance', comprehensiveGuidanceRoutes); // Complete career guidance package

// Debug endpoints for troubleshooting
app.get('/api/debug/env', (req, res) => {
  res.json({
    success: true,
    data: {
      NODE_ENV: process.env.NODE_ENV || 'development',
      DATABASE_URL: process.env.DATABASE_URL ? 'present' : 'missing',
      OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 'present' : 'missing',
      OPENAI_KEY_LENGTH: process.env.OPENAI_API_KEY?.length || 0,
      GEMINI_API_KEY: process.env.GEMINI_API_KEY ? 'present' : 'missing',
      GEMINI_KEY_LENGTH: process.env.GEMINI_API_KEY?.length || 0,
      USE_REAL_AI: process.env.USE_REAL_AI || 'not set',
      AI_PROVIDER: process.env.AI_PROVIDER || 'openai',
      FRONTEND_URL: process.env.FRONTEND_URL || 'not set',
      PORT: process.env.PORT || 3002,
      RENDER: process.env.RENDER ? 'true' : 'false'
    },
    message: 'Environment variables checked'
  });
});

// CORS debug endpoint
app.get('/api/debug/cors', (req, res) => {
  const origin = req.headers.origin;
  const isAllowed = allowedOrigins.includes(origin || '') || 
                   (origin && origin.match(/^https:\/\/.*\.amplifyapp\.com$/));
  
  res.json({
    success: true,
    data: {
      requestOrigin: origin || 'no origin header',
      allowedOrigins: allowedOrigins,
      isOriginAllowed: isAllowed,
      amplifyPatternMatch: origin ? origin.match(/^https:\/\/.*\.amplifyapp\.com$/) !== null : false,
      corsHeaders: {
        'Access-Control-Allow-Origin': isAllowed ? origin : 'not allowed',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
      }
    },
    message: 'CORS configuration checked'
  });
});

// Database viewing endpoints (for debugging and monitoring)
app.get('/api/database/stats', async (req, res) => {
  try {
    const stats = await DatabaseAdapter.getStats();
    res.json({
      success: true,
      data: stats,
      message: 'Database statistics retrieved successfully'
    });
  } catch (error) {
    console.error('Database stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve database statistics'
    });
  }
});

app.get('/api/database/tables', async (req, res) => {
  try {
    const tables = await DatabaseAdapter.all(`
      SELECT name, sql FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
      ORDER BY name
    `);
    
    res.json({
      success: true,
      data: tables,
      message: 'Database tables retrieved successfully'
    });
  } catch (error) {
    console.error('Database tables error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve database tables'
    });
  }
});

app.get('/api/database/query', async (req, res) => {
  try {
    const { sql } = req.query;
    
    if (!sql || typeof sql !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'SQL query parameter is required'
      });
    }

    // Security: Only allow SELECT statements
    const trimmedSql = sql.trim().toLowerCase();
    if (!trimmedSql.startsWith('select')) {
      return res.status(400).json({
        success: false,
        error: 'Only SELECT queries are allowed'
      });
    }

    const results = await DatabaseAdapter.all(sql as string);
    
    res.json({
      success: true,
      data: results,
      message: 'Query executed successfully'
    });
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({
      success: false,
      error: 'Query execution failed: ' + (error as Error).message
    });
  }
});

app.get('/api/database/users', async (req, res) => {
  try {
    const users = await DatabaseAdapter.all(`
      SELECT 
        u.id,
        u.email,
        u.first_name,
        u.last_name,
        u.role,
        u.created_at,
        u.is_active,
        CASE 
          WHEN u.role = 'student' THEN sp.grade
          WHEN u.role = 'counselor' THEN cp.years_experience
          ELSE NULL
        END as additional_info
      FROM users u
      LEFT JOIN student_profiles sp ON u.id = sp.user_id AND u.role = 'student'
      LEFT JOIN counselor_profiles cp ON u.id = cp.user_id AND u.role = 'counselor'
      ORDER BY u.created_at DESC
    `);
    
    res.json({
      success: true,
      data: users,
      message: 'Users retrieved successfully'
    });
  } catch (error) {
    console.error('Database users error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve users'
    });
  }
});

app.get('/api/database/sessions', async (req, res) => {
  try {
    const sessions = await DatabaseAdapter.all(`
      SELECT 
        ass.id,
        ass.session_token,
        ass.zip_code,
        ass.status,
        ass.started_at,
        ass.completed_at,
        u.email as user_email,
        u.role as user_role,
        COUNT(aa.id) as answer_count
      FROM assessment_sessions ass
      LEFT JOIN users u ON ass.user_id = u.id
      LEFT JOIN assessment_answers aa ON ass.id = aa.session_id
      GROUP BY ass.id
      ORDER BY ass.started_at DESC
      LIMIT 20
    `);
    
    res.json({
      success: true,
      data: sessions,
      message: 'Assessment sessions retrieved successfully'
    });
  } catch (error) {
    console.error('Database sessions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve sessions'
    });
  }
});

// Database download endpoint (for backup/analysis)
app.get('/api/database/download', async (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    
    let dbPath: string;
    if (process.env.RENDER) {
      dbPath = '/tmp/lantern_ai.db';
    } else if (process.env.NODE_ENV === 'production') {
      dbPath = './lantern_ai.db';
    } else {
      dbPath = path.join(process.cwd(), 'data', 'lantern_ai.db');
    }
    
    console.log('🔍 Attempting to download database from:', dbPath);
    
    if (fs.existsSync(dbPath)) {
      const stats = fs.statSync(dbPath);
      console.log('✅ Database file found, size:', stats.size, 'bytes');
      
      res.setHeader('Content-Disposition', 'attachment; filename="lantern_ai_backup.db"');
      res.setHeader('Content-Type', 'application/octet-stream');
      res.download(dbPath, 'lantern_ai_backup.db', (err) => {
        if (err) {
          console.error('❌ Download error:', err);
        } else {
          console.log('✅ Database download completed');
        }
      });
    } else {
      console.log('❌ Database file not found at:', dbPath);
      res.status(404).json({ 
        success: false,
        error: 'Database file not found',
        searchedPath: dbPath
      });
    }
  } catch (error) {
    console.error('❌ Database download error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to download database: ' + (error as Error).message
    });
  }
});

// Database backup endpoint (create backup in /tmp)
app.get('/api/database/backup', async (req, res) => {
  try {
    const backupPath = process.env.RENDER ? '/tmp/backup.db' : './backup.db';
    
    await DatabaseAdapter.run(`ATTACH DATABASE '${backupPath}' AS backup`);
    await DatabaseAdapter.run(`CREATE TABLE backup.users AS SELECT * FROM users`);
    await DatabaseAdapter.run(`CREATE TABLE backup.student_profiles AS SELECT * FROM student_profiles`);
    await DatabaseAdapter.run(`CREATE TABLE backup.assessment_sessions AS SELECT * FROM assessment_sessions`);
    await DatabaseAdapter.run(`CREATE TABLE backup.assessment_answers AS SELECT * FROM assessment_answers`);
    await DatabaseAdapter.run(`DETACH DATABASE backup`);
    
    res.json({
      success: true,
      message: 'Database backup created successfully',
      backupPath: backupPath,
      downloadUrl: '/api/database/download-backup'
    });
  } catch (error) {
    console.error('❌ Database backup error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create backup: ' + (error as Error).message
    });
  }
});

app.get('/api', (req, res) => {
  res.json({
    message: 'Lantern AI API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      authDB: '/api/auth-db',
      sessions: '/api/sessions',
      counselorAssessment: '/api/counselor-assessment',
      careers: '/api/careers',
      jobs: '/api/jobs',
      actionPlans: '/api/action-plans'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err.message);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Initialize database and start server
async function startServer() {
  try {
    // Initialize database
    await DatabaseAdapter.initialize();
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Lantern AI API running on port ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/health`);
      console.log(`📚 API docs: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
