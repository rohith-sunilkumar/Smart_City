# OpenAI API Key Setup Guide

## Getting Your OpenAI API Key

### Step 1: Create OpenAI Account
1. Go to [https://platform.openai.com/signup](https://platform.openai.com/signup)
2. Sign up with your email or Google/Microsoft account
3. Verify your email address

### Step 2: Get API Key
1. Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Click **"Create new secret key"**
3. Give it a name (e.g., "Smart City Portal")
4. Click **"Create secret key"**
5. **IMPORTANT**: Copy the key immediately - you won't be able to see it again!
   - Format: `sk-proj-...` or `sk-...`

### Step 3: Add to Your Project

#### Option A: Create .env file (Recommended)
```bash
cd /home/rohith/Desktop/app/Hackathon/server
cp .env.example .env
```

Then edit the `.env` file and replace the placeholder:
```bash
OPENAI_API_KEY=sk-proj-your-actual-key-here
```

#### Option B: Direct Edit
If `.env` already exists, just update this line:
```bash
# Before
OPENAI_API_KEY=your_openai_api_key_here

# After
OPENAI_API_KEY=sk-proj-abc123xyz789...
```

### Step 4: Restart Server
```bash
cd /home/rohith/Desktop/app/Hackathon/server
npm run dev
```

You should see:
```
✅ OpenAI initialized
✅ AI Chat Assistant initialized
```

## Free Tier Information

### Free Credits
- New accounts get **$5 free credits**
- Valid for **3 months**
- Enough for ~2,500 chat messages

### Usage Costs (After Free Credits)
- GPT-4 Turbo: ~$0.01 per chat message
- GPT-3.5 Turbo: ~$0.002 per chat message (cheaper alternative)

### Monitoring Usage
1. Go to [https://platform.openai.com/usage](https://platform.openai.com/usage)
2. View your current usage and remaining credits
3. Set up usage limits to avoid surprises

## Alternative: Use Without OpenAI (Free)

The AI Chat Widget works without OpenAI using fallback responses!

Just leave the `.env` as:
```bash
OPENAI_API_KEY=your_openai_api_key_here
```

The system will automatically use rule-based responses for common questions.

## Testing the Integration

### Test 1: Check Initialization
```bash
cd /home/rohith/Desktop/app/Hackathon/server
npm run dev
```

Look for:
```
✅ OpenAI initialized
✅ AI Chat Assistant initialized
```

### Test 2: Test Chat Widget
1. Open homepage: http://localhost:5173
2. Click the AI chat button (bottom-right)
3. Ask: "How do I report an issue?"
4. Should get intelligent response

### Test 3: Check Logs
Server logs will show:
```
AI Chat API: Processing message
OpenAI response received
```

## Troubleshooting

### Error: "OpenAI API key not configured"
- Check `.env` file exists in `/server` folder
- Verify key starts with `sk-` or `sk-proj-`
- Restart the server after adding key

### Error: "Invalid API key"
- Key might be expired or revoked
- Generate a new key from OpenAI dashboard
- Make sure you copied the entire key

### Error: "Rate limit exceeded"
- You've used all free credits
- Add payment method or wait for reset
- Or use fallback mode (no API key)

### Fallback Mode Activates
If you see:
```
⚠️  OpenAI API key not configured - AI Chat Assistant will use fallback responses
```

This means:
- API key is missing or invalid
- System will use rule-based responses
- Still functional, just less intelligent

## Security Best Practices

### ✅ DO:
- Keep API key in `.env` file
- Add `.env` to `.gitignore` (already done)
- Use environment variables in production
- Rotate keys periodically
- Set usage limits on OpenAI dashboard

### ❌ DON'T:
- Commit API key to Git
- Share API key publicly
- Hardcode key in source code
- Use same key across multiple projects
- Expose key in client-side code

## Production Deployment

### Render.com / Vercel / Heroku
Add environment variable:
```
OPENAI_API_KEY=sk-proj-your-key-here
```

### Docker
Add to docker-compose.yml:
```yaml
environment:
  - OPENAI_API_KEY=${OPENAI_API_KEY}
```

## Cost Optimization

### Tips to Reduce Costs:
1. **Use GPT-3.5 Turbo** instead of GPT-4 (10x cheaper)
   - Edit `server/services/aiChatAssistant.js`
   - Change model to `gpt-3.5-turbo`

2. **Limit Context** (already implemented)
   - Only sends last 5 messages
   - Reduces token usage

3. **Set Max Tokens** (already set to 300)
   - Prevents long responses
   - Saves money

4. **Use Fallback for Common Questions**
   - Add more fallback responses
   - Reserve OpenAI for complex queries

5. **Implement Caching**
   - Cache common question responses
   - Reduce duplicate API calls

## Alternative Models

### GPT-3.5 Turbo (Cheaper)
```javascript
// In server/services/aiChatAssistant.js
model: 'gpt-3.5-turbo'  // Instead of 'gpt-4-turbo-preview'
```

### Local Models (Free)
Consider using:
- Ollama (run locally)
- LM Studio
- GPT4All

## Support

### OpenAI Support
- Documentation: https://platform.openai.com/docs
- Community: https://community.openai.com
- Status: https://status.openai.com

### Project Issues
- Check server logs
- Verify `.env` configuration
- Test with fallback mode first
- Review `AI_CHAT_WIDGET.md` documentation

## Quick Start Commands

```bash
# 1. Copy environment file
cd /home/rohith/Desktop/app/Hackathon/server
cp .env.example .env

# 2. Edit .env and add your OpenAI key
nano .env
# or
code .env

# 3. Restart server
npm run dev

# 4. Test on homepage
# Open: http://localhost:5173
```

## Summary

✅ **Free Option**: Use without API key (fallback mode)
✅ **Paid Option**: Get $5 free credits from OpenAI
✅ **Secure**: API key in `.env`, never committed to Git
✅ **Flexible**: Works with or without OpenAI
✅ **Cost-Effective**: Optimized for minimal token usage

Choose the option that works best for your needs!
