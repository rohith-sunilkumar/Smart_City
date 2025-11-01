# Deployment Configuration

## Backend (Render)
- **URL:** https://hackathon-lgk9.onrender.com
- **Platform:** Render
- **Status:** Deployed ✅

## Frontend Configuration

### Production Setup
The frontend is configured to connect to the production backend on Render.

**Environment Variable:**
```
VITE_API_URL=https://hackathon-lgk9.onrender.com
```

### Local Development
To run the frontend locally while using the production backend:

1. The `.env` file is already configured with the production URL
2. Simply run: `npm run dev`
3. The app will connect to the deployed backend

### Switch to Local Backend
If you want to use a local backend instead:

1. Update `client/.env`:
```
VITE_API_URL=http://localhost:5000
```

2. Make sure your local backend server is running on port 5000

## Important Notes

- The `.env` file is gitignored for security
- Use `.env.example` as a template
- The production backend URL is: `https://hackathon-lgk9.onrender.com`
- All API calls will automatically use this URL

## Testing the Connection

Open your browser console and check for:
- ✅ Successful API calls to `https://hackathon-lgk9.onrender.com`
- ✅ No CORS errors
- ✅ Successful authentication

## Features Working with Production Backend

- ✅ User Authentication (Login/Register)
- ✅ Mayor Dashboard
- ✅ Report Management
- ✅ Chat System
- ✅ Admin Management
- ✅ Real-time Updates
