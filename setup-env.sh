#!/bin/bash

# ====================================
# Environment Setup Script
# ====================================

echo "🚀 Setting up Community Chit Fund App environment files..."
echo ""

# Create frontend .env file
echo "📁 Creating frontend .env file..."
cat > .env << 'EOF'
# Frontend Environment Variables
REACT_APP_TREASURY_SERVICE_URL=http://localhost:3001
EOF
echo "✅ Frontend .env created"

# Create treasury service .env file
echo "📁 Creating treasury-service .env file..."
cat > treasury-service/.env << 'EOF'
# Treasury Service Environment Variables

# 🔑 REQUIRED: Add your private keys here
TREASURY_PRIVATE_KEY=YOUR_TREASURY_PRIVATE_KEY_HERE
TREASURY_ETH_PRIVATE_KEY=YOUR_INTMAX_PRIVATE_KEY_HERE

# Smart Contract Configuration
CONTRACT_ADDRESS=0x53647E2CE58937864B448e038Ad88305AfC2Ce4f
BASE_SEPOLIA_RPC=https://sepolia.base.org

# INTMAX Configuration
INTMAX_ENVIRONMENT=testnet
L1_RPC_URL=https://sepolia.gateway.tenderly.co

# Optional Configuration
PORT=3001
EOF
echo "✅ Treasury service .env created"

echo ""
echo "🔧 Next Steps:"
echo "1. Edit treasury-service/.env and add your private keys"
echo "2. Fund your wallets with testnet ETH"
echo "3. Run: cd treasury-service && npm start"
echo "4. Run: pnpm dev (in new terminal)"
echo ""
echo "📋 Template files available:"
echo "- ENV_TEMPLATE.txt (frontend)"
echo "- treasury-service/ENV_TEMPLATE.txt (backend)"
echo ""
echo "🎉 Setup complete! Your environment files are ready." 