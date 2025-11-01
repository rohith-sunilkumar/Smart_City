#!/bin/bash

# Smart City Portal - OpenAI Setup Script
# This script helps you set up your OpenAI API key

echo "🤖 Smart City Portal - OpenAI API Key Setup"
echo "============================================"
echo ""

# Check if .env exists
if [ -f "server/.env" ]; then
    echo "✅ Found existing .env file"
else
    echo "📝 Creating .env file from template..."
    cp server/.env.example server/.env
    echo "✅ Created server/.env"
fi

echo ""
echo "📋 Instructions:"
echo "1. Get your OpenAI API key from: https://platform.openai.com/api-keys"
echo "2. Click 'Create new secret key'"
echo "3. Copy the key (starts with sk-)"
echo ""
echo "Enter your OpenAI API key (or press Enter to skip):"
read -r api_key

if [ -z "$api_key" ]; then
    echo ""
    echo "⚠️  No API key provided - AI Chat will use fallback responses"
    echo "   The widget will still work with rule-based answers!"
else
    # Update the .env file
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/OPENAI_API_KEY=.*/OPENAI_API_KEY=$api_key/" server/.env
    else
        # Linux
        sed -i "s/OPENAI_API_KEY=.*/OPENAI_API_KEY=$api_key/" server/.env
    fi
    
    echo ""
    echo "✅ API key saved to server/.env"
    echo "🔒 Your key is secure and will not be committed to Git"
fi

echo ""
echo "🚀 Next steps:"
echo "1. cd server && npm run dev"
echo "2. Open http://localhost:5173"
echo "3. Click the AI chat button (bottom-right)"
echo "4. Test the chat assistant!"
echo ""
echo "📚 For more info, see: OPENAI_SETUP.md"
echo ""
