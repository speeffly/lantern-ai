import serverless from 'serverless-http';
import app from './index';

// Configure for Lambda
const handler = serverless(app, {
  binary: ['image/*', 'application/pdf'],
  request: (request: any, event: any, context: any) => {
    // Add Lambda context to request
    request.context = context;
    request.event = event;
  }
});

export { handler };