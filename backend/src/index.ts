import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import sessionRoutes from './routes/sessions';
import assessmentRoutes from './routes/assessment';
import careersRoutes from './routes/careers';
import authRoutes from './routes/auth';
import authDBRoutes from './routes/authDB';
import actionPlansRoutes from './routes/actionPlans';
import counselorAssessmentRoutes from './routes/counselorAssessment';
import jobsRoutes from './routes/jobs';
import { DatabaseService } from './services/databaseService';

// Load environment variables
dotenv.config();

// Debug: Check if OpenAI API key is loaded
console.log('🔑 Environment check - OpenAI API key loaded:', !!process.env.OPENAI_API_KEY);
console.log('🔑 Environment check - API key length:', process.env.OPENAI_API_KEY?.length || 0);

// Debug: CORS configuration
console.log('🌐 CORS configuration:');
console.log('   - Environment:', process.env.NODE_ENV);
console.log('   - Frontend URL:', process.env.FRONTEND_URL);
console.log('   - Port:', process.env.PORT || 3002);

// Initialize database

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || process.env.NODE_ENV === 'production' 
    ? [
        'https://main.d2ymtj6aumrj0m.amplifyapp.com', 
        'https://d2ymtj6aumrj0m.amplifyapp.com',
        'https://*.amplifyapp.com' // Allow all Amplify domains
      ]
    : ['http://localhost:3000', 'http://localhost:3001'],
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
        <div class="endpoint">GET /api/assessment/* - Career assessments</div>
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
        assessment: '/api/assessment',
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
  res.json({
    status: 'OK',
    message: 'Lantern AI API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    database: DatabaseService.isReady() ? 'Connected' : 'Disconnected',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/auth-db', authDBRoutes); // New database-enabled auth routes
app.use('/api/sessions', sessionRoutes);
app.use('/api/assessment', assessmentRoutes);
app.use('/api/counselor-assessment', counselorAssessmentRoutes); // New counselor assessment
app.use('/api/careers', careersRoutes);
app.use('/api/jobs', jobsRoutes); // Job listings
app.use('/api/action-plans', actionPlansRoutes);

app.get('/api', (req, res) => {
  res.json({
    message: 'Lantern AI API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      authDB: '/api/auth-db',
      sessions: '/api/sessions',
      assessment: '/api/assessment',
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
    await DatabaseService.initialize();
    
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
