module.exports = {
  apps: [
    {
      name: 'lantern-backend',
      script: 'dist/index.js',
      cwd: './backend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3002
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3002,
        OPENAI_API_KEY: process.env.OPENAI_API_KEY,
        JWT_SECRET: process.env.JWT_SECRET
      }
    },
    {
      name: 'lantern-frontend',
      script: 'npm',
      args: 'start',
      cwd: './frontend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    }
  ]
};