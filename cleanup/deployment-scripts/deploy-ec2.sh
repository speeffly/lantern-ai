#!/bin/bash

# AWS EC2 Deployment Script for Lantern AI
# Run this script on a fresh Ubuntu 22.04 EC2 instance

set -e

echo "🚀 Starting Lantern AI deployment on EC2..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
echo "📦 Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Install Nginx
echo "📦 Installing Nginx..."
sudo apt install nginx -y

# Install Git
echo "📦 Installing Git..."
sudo apt install git -y

# Clone repository (replace with your actual repo URL)
echo "📥 Cloning repository..."
if [ ! -d "lantern-ai" ]; then
    git clone https://github.com/your-username/lantern-ai.git
fi
cd lantern-ai

# Setup backend
echo "🔧 Setting up backend..."
cd backend
npm install
npm run build
cd ..

# Setup frontend
echo "🔧 Setting up frontend..."
cd frontend
npm install
npm run build
cd ..

# Create environment files
echo "🔧 Creating environment files..."
if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    echo "⚠️  Please edit backend/.env with your actual values"
fi

if [ ! -f "frontend/.env.production" ]; then
    cp frontend/.env.local.example frontend/.env.production
    echo "⚠️  Please edit frontend/.env.production with your actual values"
fi

# Start applications with PM2
echo "🚀 Starting applications..."
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Configure Nginx
echo "🔧 Configuring Nginx..."
sudo tee /etc/nginx/sites-available/lantern-ai > /dev/null <<EOF
server {
    listen 80;
    server_name _;

    # Frontend
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/lantern-ai /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

# Enable services
sudo systemctl enable nginx

echo "✅ Deployment complete!"
echo ""
echo "🌐 Your application should be accessible at:"
echo "   http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
echo ""
echo "📝 Next steps:"
echo "1. Edit backend/.env with your OpenAI API key and other settings"
echo "2. Edit frontend/.env.production with your backend URL"
echo "3. Restart applications: pm2 restart all"
echo "4. Check logs: pm2 logs"
echo "5. Monitor status: pm2 status"
echo ""
echo "🔧 Useful commands:"
echo "   pm2 restart all    - Restart all applications"
echo "   pm2 logs          - View application logs"
echo "   pm2 status        - Check application status"
echo "   sudo nginx -t     - Test Nginx configuration"
echo "   sudo systemctl restart nginx - Restart Nginx"