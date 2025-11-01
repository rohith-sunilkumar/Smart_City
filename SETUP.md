# 🚀 Quick Setup Guide

Follow these steps to get the Smart City Citizen Portal running on your local machine.

## Prerequisites

Before you begin, ensure you have:
- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **MongoDB** - Either local installation or MongoDB Atlas account
- **OpenAI API Key** - [Get one here](https://platform.openai.com/api-keys)

## Step-by-Step Setup

### 1. Clone/Download the Project

```bash
cd /home/rohith/Documents/Hakathon
```

### 2. Backend Setup

#### Install Dependencies
```bash
cd server
npm install
```

#### Configure Environment
```bash
# Copy the example env file
cp .env.example .env

# Edit .env with your favorite editor
nano .env
```

**Required Environment Variables:**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smart-city-portal
JWT_SECRET=your_super_secret_jwt_key_change_this
OPENAI_API_KEY=sk-your-openai-api-key-here
NODE_ENV=development
```

**Optional (for Cloudinary image hosting):**
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

#### Create Uploads Directory
```bash
mkdir uploads
```

#### Seed Demo Data (Optional but Recommended)
```bash
npm run seed
```

This creates:
- 2 demo users (citizen and admin)
- 8 sample reports with various statuses

#### Start Backend Server
```bash
npm run dev
```

✅ Backend should now be running on `http://localhost:5000`

### 3. Frontend Setup

Open a **new terminal** window:

```bash
cd client
npm install
```

#### Configure Environment (Optional)
```bash
cp .env.example .env
```

The default API URL is `http://localhost:5000/api` which should work out of the box.

#### Start Frontend Server
```bash
npm run dev
```

✅ Frontend should now be running on `http://localhost:3000`

### 4. Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

## 🎯 Demo Credentials

After running the seed script, use these credentials:

**Citizen Account:**
- Email: `citizen@demo.com`
- Password: `password`

**Admin Account:**
- Email: `admin@demo.com`
- Password: `password`

## 🧪 Testing the Application

### As a Citizen:
1. Login with citizen credentials
2. Click "Report Issue"
3. Fill out the form with a civic complaint
4. Watch the AI automatically categorize it!
5. View your reports in "My Reports"

### As an Admin:
1. Login with admin credentials
2. View the dashboard with analytics
3. Filter and manage reports
4. Update report statuses
5. View AI classification insights

## 🔧 Troubleshooting

### MongoDB Connection Issues
- **Local MongoDB**: Make sure MongoDB is running
  ```bash
  sudo systemctl start mongod  # Linux
  brew services start mongodb-community  # macOS
  ```
- **MongoDB Atlas**: Check your connection string and IP whitelist

### Port Already in Use
If port 5000 or 3000 is already in use:
```bash
# Backend: Change PORT in server/.env
PORT=5001

# Frontend: Change port in client/vite.config.js
server: {
  port: 3001
}
```

### OpenAI API Issues
- Verify your API key is correct
- Check you have credits in your OpenAI account
- The app will use fallback classification if AI fails

### Image Upload Issues
- Make sure `uploads/` directory exists in server folder
- Check file permissions: `chmod 755 uploads/`

## 📦 Production Deployment

### Backend (Render/Railway/Heroku)
1. Push code to GitHub
2. Create new web service
3. Set environment variables
4. Deploy from GitHub

### Frontend (Vercel/Netlify)
1. Push code to GitHub
2. Import project
3. Set build command: `npm run build`
4. Set publish directory: `dist`
5. Add environment variable: `VITE_API_URL=https://your-api.com/api`

### Database (MongoDB Atlas)
1. Create free cluster
2. Create database user
3. Whitelist IP (0.0.0.0/0 for development)
4. Get connection string
5. Update MONGODB_URI

## 🎨 Customization

### Change Theme Colors
Edit `client/tailwind.config.js`:
```javascript
colors: {
  primary: {
    600: '#your-color',
    // ... other shades
  }
}
```

### Add New Report Categories
1. Update `server/models/Report.js` - add to category enum
2. Update `server/services/aiClassifier.js` - add to AI prompt
3. Update frontend category lists

### Modify AI Behavior
Edit `server/services/aiClassifier.js` to adjust:
- AI model (currently gpt-4-turbo-preview)
- Temperature (creativity level)
- Prompt instructions

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🆘 Need Help?

Check the main README.md for:
- Complete API documentation
- Project structure
- Feature list
- Architecture details

---

**Happy Building! 🏙️**
