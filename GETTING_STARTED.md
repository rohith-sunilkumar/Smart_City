# 🚀 Getting Started with Smart City Citizen Portal

Welcome! This guide will help you get the application running in **under 10 minutes**.

## 📋 Prerequisites Checklist

Before starting, make sure you have:

- [ ] **Node.js** (v16+) installed - [Download here](https://nodejs.org/)
- [ ] **MongoDB** - Local installation OR [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account
- [ ] **OpenAI API Key** - [Get one here](https://platform.openai.com/api-keys)
- [ ] **Code Editor** - VS Code, Sublime, or your favorite editor
- [ ] **Terminal/Command Line** access

## ⚡ Quick Start (3 Steps)

### Step 1: Setup Backend (3 minutes)

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your settings (use nano, vim, or any editor)
nano .env
```

**Required .env configuration:**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smart-city-portal
JWT_SECRET=my_super_secret_jwt_key_12345
OPENAI_API_KEY=sk-your-openai-api-key-here
NODE_ENV=development
```

> 💡 **Tip**: For MongoDB Atlas, use: `mongodb+srv://username:password@cluster.mongodb.net/smart-city-portal`

```bash
# Create uploads directory
mkdir uploads

# Seed demo data (optional but recommended)
npm run seed

# Start the server
npm run dev
```

✅ **Backend is now running on http://localhost:5000**

### Step 2: Setup Frontend (2 minutes)

Open a **new terminal window**:

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Start the development server
npm run dev
```

✅ **Frontend is now running on http://localhost:3000**

### Step 3: Access the Application

Open your browser and go to:
```
http://localhost:3000
```

## 🎯 First Time Usage

### Option A: Use Demo Accounts (Recommended)

If you ran `npm run seed`, use these credentials:

**Citizen Account:**
- Email: `citizen@demo.com`
- Password: `password`

**Admin Account:**
- Email: `admin@demo.com`
- Password: `password`

### Option B: Create New Account

1. Click "Sign Up" on the homepage
2. Fill in your details
3. Choose role (citizen by default)
4. Login with your credentials

## 🧪 Test the Features

### As a Citizen:

1. **Report an Issue**
   - Click "Report Issue" button
   - Fill in title: "Pothole on Main Street"
   - Description: "Large pothole causing vehicle damage"
   - Upload a photo (optional)
   - Click "Submit Report"
   - Watch AI classify it automatically! 🤖

2. **Track Your Reports**
   - Go to "My Reports"
   - See all your submissions
   - Filter by status
   - Click to view details

### As an Admin:

1. **View Dashboard**
   - Login with admin account
   - See analytics overview
   - View charts and statistics

2. **Manage Reports**
   - Switch to "Reports" tab
   - Filter by category/status/priority
   - Update report status
   - Add admin notes

## 🔧 Troubleshooting

### Problem: "Cannot connect to MongoDB"

**Solution:**
- If using local MongoDB, start it:
  ```bash
  # Linux
  sudo systemctl start mongod
  
  # macOS
  brew services start mongodb-community
  
  # Windows
  net start MongoDB
  ```
- If using MongoDB Atlas, check your connection string and IP whitelist

### Problem: "Port 5000 already in use"

**Solution:**
Change the port in `server/.env`:
```env
PORT=5001
```

### Problem: "OpenAI API error"

**Solution:**
- Verify your API key is correct
- Check you have credits in your OpenAI account
- The app will use fallback classification if AI fails

### Problem: "Module not found"

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

### Problem: "Images not uploading"

**Solution:**
```bash
# Make sure uploads directory exists
cd server
mkdir uploads
chmod 755 uploads
```

## 📱 Access from Other Devices

To access from your phone/tablet on the same network:

1. Find your computer's IP address:
   ```bash
   # Linux/Mac
   ifconfig | grep "inet "
   
   # Windows
   ipconfig
   ```

2. Update `client/vite.config.js`:
   ```javascript
   server: {
     host: '0.0.0.0',
     port: 3000
   }
   ```

3. Access from other devices:
   ```
   http://YOUR_IP_ADDRESS:3000
   ```

## 🎨 Customization

### Change Theme Colors

Edit `client/tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      primary: {
        600: '#your-color-here'
      }
    }
  }
}
```

### Add Your City Name

Edit `client/src/components/Navbar.jsx`:
```javascript
<span className="text-xl font-bold">
  Your City Name Portal
</span>
```

### Modify AI Behavior

Edit `server/services/aiClassifier.js`:
- Change AI model
- Adjust temperature
- Modify categories
- Update prompts

## 📚 Next Steps

### Learn More
- Read [README.md](./README.md) for complete documentation
- Check [FEATURES.md](./FEATURES.md) for feature list
- Review [STRUCTURE.md](./STRUCTURE.md) for code organization

### Deploy to Production
- Follow [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment guide
- Deploy backend to Render/Railway
- Deploy frontend to Vercel/Netlify
- Use MongoDB Atlas for database

### Extend the Application
- Add new report categories
- Implement real-time notifications
- Add map integration
- Create mobile app

## 💡 Pro Tips

1. **Use the seed script** - It creates demo data for testing
2. **Keep both terminals open** - One for backend, one for frontend
3. **Check browser console** - For frontend errors
4. **Check terminal output** - For backend errors
5. **Use demo accounts** - Faster than creating new ones
6. **Test AI classification** - Try different complaint descriptions

## 🆘 Still Need Help?

### Check These Resources:
- [SETUP.md](./SETUP.md) - Detailed setup instructions
- [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) - Project overview
- GitHub Issues - Report bugs or ask questions

### Common Commands Reference:

```bash
# Backend
cd server
npm install          # Install dependencies
npm run dev          # Start development server
npm run seed         # Seed demo data
npm start            # Start production server

# Frontend
cd client
npm install          # Install dependencies
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

## ✅ Success Checklist

You're all set when you can:

- [ ] Access the homepage at http://localhost:3000
- [ ] Login with demo credentials
- [ ] Submit a new report
- [ ] See AI classification results
- [ ] View reports in dashboard
- [ ] Update report status (as admin)
- [ ] See analytics charts (as admin)

## 🎉 You're Ready!

Congratulations! You now have a fully functional Smart City Citizen Portal running locally.

**Happy coding! 🚀**

---

**Need more help?** Check the other documentation files or create an issue on GitHub.
