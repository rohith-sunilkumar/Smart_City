# 🚀 Deployment Guide

Complete guide to deploy the Smart City Citizen Portal to production.

## 📋 Pre-Deployment Checklist

- [ ] All features tested locally
- [ ] Environment variables documented
- [ ] Database backup strategy in place
- [ ] API keys secured
- [ ] Error handling implemented
- [ ] Production build tested
- [ ] Security audit completed

## 🗄️ Database Deployment (MongoDB Atlas)

### Step 1: Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Create a new cluster (M0 Free tier is sufficient for MVP)

### Step 2: Configure Database
1. **Create Database User**
   - Database Access → Add New Database User
   - Choose password authentication
   - Save username and password

2. **Whitelist IP Addresses**
   - Network Access → Add IP Address
   - For development: Add `0.0.0.0/0` (allow from anywhere)
   - For production: Add specific server IPs

3. **Get Connection String**
   - Clusters → Connect → Connect your application
   - Copy the connection string
   - Replace `<password>` with your database password
   - Example: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/smart-city-portal`

### Step 3: Seed Production Data (Optional)
```bash
# Update MONGODB_URI in .env to Atlas connection string
npm run seed
```

## 🖥️ Backend Deployment (Render)

### Option 1: Deploy to Render

1. **Create Render Account**
   - Go to [Render](https://render.com)
   - Sign up with GitHub

2. **Create New Web Service**
   - New → Web Service
   - Connect your GitHub repository
   - Select the `server` directory

3. **Configure Service**
   ```
   Name: smart-city-portal-api
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   ```

4. **Add Environment Variables**
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_secure_random_string_here
   OPENAI_API_KEY=your_openai_api_key
   NODE_ENV=production
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name (optional)
   CLOUDINARY_API_KEY=your_cloudinary_key (optional)
   CLOUDINARY_API_SECRET=your_cloudinary_secret (optional)
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Note your API URL: `https://your-app.onrender.com`

### Option 2: Deploy to Railway

1. **Create Railway Account**
   - Go to [Railway](https://railway.app)
   - Sign up with GitHub

2. **New Project**
   - New Project → Deploy from GitHub repo
   - Select your repository

3. **Configure**
   - Add environment variables (same as Render)
   - Railway auto-detects Node.js
   - Set root directory to `server`

4. **Deploy**
   - Railway automatically deploys
   - Get your URL from the deployment

### Option 3: Deploy to Heroku

```bash
# Install Heroku CLI
# Login to Heroku
heroku login

# Create new app
heroku create smart-city-portal-api

# Set environment variables
heroku config:set MONGODB_URI=your_connection_string
heroku config:set JWT_SECRET=your_secret
heroku config:set OPENAI_API_KEY=your_key

# Deploy
git subtree push --prefix server heroku main
```

## 🌐 Frontend Deployment (Vercel)

### Step 1: Prepare Frontend

1. **Update API URL**
   - Create `.env.production` in client folder:
   ```env
   VITE_API_URL=https://your-backend-url.onrender.com/api
   ```

2. **Test Production Build**
   ```bash
   cd client
   npm run build
   npm run preview
   ```

### Step 2: Deploy to Vercel

1. **Create Vercel Account**
   - Go to [Vercel](https://vercel.com)
   - Sign up with GitHub

2. **Import Project**
   - New Project → Import Git Repository
   - Select your repository

3. **Configure Build Settings**
   ```
   Framework Preset: Vite
   Root Directory: client
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

4. **Add Environment Variables**
   ```
   VITE_API_URL=https://your-backend-url.onrender.com/api
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at `https://your-app.vercel.app`

### Alternative: Deploy to Netlify

1. **Create Netlify Account**
   - Go to [Netlify](https://netlify.com)
   - Sign up with GitHub

2. **New Site from Git**
   - Add new site → Import from Git
   - Select repository

3. **Build Settings**
   ```
   Base directory: client
   Build command: npm run build
   Publish directory: client/dist
   ```

4. **Environment Variables**
   - Site settings → Environment variables
   - Add `VITE_API_URL`

5. **Deploy**
   - Netlify auto-deploys on push

## 🔒 Security Hardening

### Backend Security

1. **Environment Variables**
   - Never commit `.env` files
   - Use strong, random JWT secrets
   - Rotate API keys regularly

2. **Rate Limiting**
   ```bash
   npm install express-rate-limit
   ```
   
   Add to `server.js`:
   ```javascript
   import rateLimit from 'express-rate-limit';
   
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100 // limit each IP to 100 requests per windowMs
   });
   
   app.use('/api/', limiter);
   ```

3. **Helmet for Security Headers**
   ```bash
   npm install helmet
   ```
   
   ```javascript
   import helmet from 'helmet';
   app.use(helmet());
   ```

4. **CORS Configuration**
   ```javascript
   app.use(cors({
     origin: 'https://your-frontend-domain.vercel.app',
     credentials: true
   }));
   ```

### Frontend Security

1. **Environment Variables**
   - Prefix with `VITE_` for Vite
   - Never expose sensitive keys

2. **Content Security Policy**
   - Configure in Vercel/Netlify settings

## 📊 Monitoring & Logging

### Backend Monitoring

1. **Add Logging Service**
   - [Logtail](https://logtail.com)
   - [Papertrail](https://papertrailapp.com)
   - [Sentry](https://sentry.io)

2. **Health Check Endpoint**
   Already implemented at `/health`

3. **Uptime Monitoring**
   - [UptimeRobot](https://uptimerobot.com)
   - [Pingdom](https://pingdom.com)

### Frontend Monitoring

1. **Analytics**
   - Google Analytics
   - Plausible Analytics

2. **Error Tracking**
   - Sentry for React
   - LogRocket

## 🔄 CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Render
        run: |
          curl https://api.render.com/deploy/srv-xxxxx?key=${{ secrets.RENDER_DEPLOY_KEY }}

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

## 🧪 Post-Deployment Testing

1. **Smoke Tests**
   - [ ] Homepage loads
   - [ ] Login works
   - [ ] Registration works
   - [ ] Report submission works
   - [ ] Admin dashboard accessible
   - [ ] AI classification working

2. **Performance Tests**
   - [ ] Page load times < 3s
   - [ ] API response times < 500ms
   - [ ] Images load properly

3. **Security Tests**
   - [ ] HTTPS enabled
   - [ ] Protected routes work
   - [ ] Unauthorized access blocked

## 📱 Custom Domain Setup

### Vercel Custom Domain

1. Go to Project Settings → Domains
2. Add your domain
3. Configure DNS records as instructed
4. Wait for SSL certificate

### Render Custom Domain

1. Go to Settings → Custom Domains
2. Add your domain
3. Update DNS records
4. SSL auto-configured

## 🔧 Troubleshooting

### Common Issues

**Build Fails**
- Check Node.js version compatibility
- Verify all dependencies installed
- Check build logs for errors

**Database Connection Fails**
- Verify MongoDB Atlas IP whitelist
- Check connection string format
- Ensure database user has correct permissions

**CORS Errors**
- Update CORS origin in backend
- Check API URL in frontend env

**Images Not Loading**
- Verify uploads directory exists
- Check file permissions
- Ensure static file serving configured

## 📈 Scaling Considerations

### When to Scale

- Response times > 1s
- Database queries slow
- High memory usage
- Increased traffic

### Scaling Options

1. **Database**
   - Upgrade MongoDB Atlas tier
   - Add read replicas
   - Enable caching (Redis)

2. **Backend**
   - Upgrade Render/Railway plan
   - Add load balancer
   - Horizontal scaling

3. **Frontend**
   - CDN for static assets
   - Image optimization
   - Code splitting

## ✅ Production Checklist

- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] Database connected and seeded
- [ ] Environment variables configured
- [ ] HTTPS enabled
- [ ] Custom domain configured (optional)
- [ ] Monitoring setup
- [ ] Error tracking enabled
- [ ] Backups configured
- [ ] Documentation updated
- [ ] Team notified

---

**Your app is now live! 🎉**

Access it at:
- Frontend: `https://your-app.vercel.app`
- Backend API: `https://your-api.onrender.com`
