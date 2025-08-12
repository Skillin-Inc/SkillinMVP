#!/bin/bash

# EC2 Setup Script for Skillin Backend
# Run this script on your EC2 instance after the first deployment

set -e

echo "Setting up Skillin backend on EC2..."

# Update system
echo "Updating system packages..."
sudo yum update -y

# Install Node.js 20.x
echo "Installing Node.js 20.x..."
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs

# Install PM2 globally
echo "Installing PM2..."
sudo npm install -g pm2

# Install PM2 startup script
echo "Setting up PM2 startup script..."
sudo pm2 startup systemd

# Create the application directory if it doesn't exist
APP_DIR="/var/www/skillin"
echo "Creating application directory: $APP_DIR"
sudo mkdir -p "$APP_DIR"
sudo chown -R $USER:$USER "$APP_DIR"

echo ""
echo "Setup complete! Next steps:"
echo "1. Make sure your GitHub secrets are configured:"
echo "   - EC2_HOST: Your EC2 public IP or domain"
echo "   - EC2_USER: Your EC2 username (usually 'ec2-user')"
echo "   - EC2_KEY: Your private SSH key"
echo "   - EC2_PATH: /var/www/skillin"
echo ""
echo "2. Push to the 'publish' branch to trigger deployment"
echo "3. After deployment, edit the .env file in $APP_DIR with your production values"
echo "4. Restart the service: pm2 restart skillin"
echo ""
echo "To check service status: pm2 status"
echo "To view logs: pm2 logs skillin"
