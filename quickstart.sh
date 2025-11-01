#!/bin/bash

# Smart City Citizen Portal - Quick Start Script
# This script helps you set up the project quickly

echo "🏙️  Smart City Citizen Portal - Quick Start"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}✅ Node.js found: $(node --version)${NC}"

# Check if MongoDB is running (optional)
if command -v mongod &> /dev/null; then
    echo -e "${GREEN}✅ MongoDB found${NC}"
else
    echo -e "${YELLOW}⚠️  MongoDB not found locally. You can use MongoDB Atlas instead.${NC}"
fi

echo ""
echo "📦 Installing dependencies..."
echo ""

# Install backend dependencies
echo "Installing backend dependencies..."
cd server
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend dependencies installed${NC}"
else
    echo -e "${RED}❌ Failed to install backend dependencies${NC}"
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo ""
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo -e "${YELLOW}⚠️  Please edit server/.env and add your configuration:${NC}"
    echo "   - MONGODB_URI (MongoDB connection string)"
    echo "   - JWT_SECRET (random secret key)"
    echo "   - OPENAI_API_KEY (OpenAI API key)"
    echo ""
fi

# Create uploads directory
if [ ! -d uploads ]; then
    mkdir uploads
    echo -e "${GREEN}✅ Created uploads directory${NC}"
fi

cd ..

# Install frontend dependencies
echo ""
echo "Installing frontend dependencies..."
cd client
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
else
    echo -e "${RED}❌ Failed to install frontend dependencies${NC}"
    exit 1
fi

cd ..

echo ""
echo -e "${GREEN}✅ Installation complete!${NC}"
echo ""
echo "📋 Next Steps:"
echo "=============="
echo ""
echo "1. Configure environment variables:"
echo "   cd server"
echo "   nano .env  # Edit with your settings"
echo ""
echo "2. Seed demo data (optional):"
echo "   npm run seed"
echo ""
echo "3. Start the backend server:"
echo "   npm run dev"
echo ""
echo "4. In a new terminal, start the frontend:"
echo "   cd client"
echo "   npm run dev"
echo ""
echo "5. Open your browser:"
echo "   http://localhost:3000"
echo ""
echo "📚 For detailed instructions, see SETUP.md"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"
