// Jest setup file for Lantern AI tests

// Mock console methods to reduce noise during tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Set test timeout
jest.setTimeout(30000);

// Mock environment variables for tests
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.USE_REAL_AI = 'false';

// Mock fetch for Node.js environment
if (!global.fetch) {
  global.fetch = require('node-fetch');
}