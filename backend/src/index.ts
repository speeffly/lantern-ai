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

// Load environment variables
dotenv.config();

// Debug: Check if OpenAI API key is loaded
console.log('🔑 Environment check - OpenAI API key loaded:', !!process.env.OPENAI_API_KEY);
console.log('🔑 Environment check - API key length:', process.env.OPENAI_API_KEY?.length || 0);

// Initialize database
import { DatabaseService } from './services/databaseService';

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Lantern AI API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
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
