# 📁 Project Structure

Complete file structure of the Smart City Citizen Portal.

```
smart-city-portal/
│
├── 📄 README.md                    # Main project documentation
├── 📄 SETUP.md                     # Setup and installation guide
├── 📄 FEATURES.md                  # Complete feature list
├── 📄 DEPLOYMENT.md                # Deployment guide
├── 📄 PROJECT_SUMMARY.md           # Project overview and summary
├── 📄 STRUCTURE.md                 # This file
├── 📄 .gitignore                   # Git ignore rules
├── 🔧 quickstart.sh                # Quick setup script
│
├── 📂 server/                      # Backend application
│   │
│   ├── 📂 config/                  # Configuration files
│   │   ├── database.js             # MongoDB connection setup
│   │   └── cloudinary.js           # File upload configuration
│   │
│   ├── 📂 models/                  # Database models (Mongoose schemas)
│   │   ├── User.js                 # User model (citizen/admin)
│   │   └── Report.js               # Report model with geospatial support
│   │
│   ├── 📂 routes/                  # API route handlers
│   │   ├── auth.js                 # Authentication routes (register, login)
│   │   ├── reports.js              # Report CRUD operations
│   │   └── stats.js                # Analytics and statistics
│   │
│   ├── 📂 middleware/              # Express middleware
│   │   └── auth.js                 # JWT authentication & authorization
│   │
│   ├── 📂 services/                # Business logic services
│   │   └── aiClassifier.js         # OpenAI integration for classification
│   │
│   ├── 📂 scripts/                 # Utility scripts
│   │   └── seed.js                 # Database seeding script
│   │
│   ├── 📂 uploads/                 # Uploaded images (gitignored)
│   │
│   ├── 📄 server.js                # Main Express application
│   ├── 📄 package.json             # Backend dependencies
│   ├── 📄 .env.example             # Environment variables template
│   ├── 📄 .env                     # Environment variables (gitignored)
│   ├── 📄 .gitignore               # Backend gitignore
│   └── 📄 README.md                # Backend documentation
│
├── 📂 client/                      # Frontend application
│   │
│   ├── 📂 public/                  # Static assets
│   │
│   ├── 📂 src/                     # Source code
│   │   │
│   │   ├── 📂 components/          # Reusable React components
│   │   │   └── Navbar.jsx          # Navigation bar component
│   │   │
│   │   ├── 📂 context/             # React Context providers
│   │   │   └── AuthContext.jsx    # Authentication state management
│   │   │
│   │   ├── 📂 pages/               # Page components (routes)
│   │   │   ├── Landing.jsx         # Homepage with features
│   │   │   ├── Login.jsx           # User login page
│   │   │   ├── Register.jsx        # User registration page
│   │   │   ├── ReportIssue.jsx     # Report submission form
│   │   │   ├── MyReports.jsx       # Citizen's report dashboard
│   │   │   ├── ReportDetail.jsx    # Single report view
│   │   │   ├── AdminDashboard.jsx  # Admin analytics & management
│   │   │   └── NotFound.jsx        # 404 error page
│   │   │
│   │   ├── 📂 utils/               # Utility functions
│   │   │   └── api.js              # Axios API client & endpoints
│   │   │
│   │   ├── 📄 App.jsx              # Main app component with routing
│   │   ├── 📄 main.jsx             # React entry point
│   │   └── 📄 index.css            # Global styles with Tailwind
│   │
│   ├── 📄 index.html               # HTML template
│   ├── 📄 package.json             # Frontend dependencies
│   ├── 📄 vite.config.js           # Vite build configuration
│   ├── 📄 tailwind.config.js       # Tailwind CSS configuration
│   ├── 📄 postcss.config.js        # PostCSS configuration
│   ├── 📄 .env.example             # Environment variables template
│   ├── 📄 .gitignore               # Frontend gitignore
│   └── 📄 README.md                # Frontend documentation
│
└── 📂 .github/                     # GitHub specific files (optional)
    └── workflows/                  # CI/CD workflows
        └── deploy.yml              # Deployment automation
```

## 📊 File Statistics

### Backend
- **Total Files**: ~15
- **Lines of Code**: ~1,500
- **Models**: 2 (User, Report)
- **Routes**: 3 (auth, reports, stats)
- **Middleware**: 1 (authentication)
- **Services**: 1 (AI classifier)

### Frontend
- **Total Files**: ~15
- **Lines of Code**: ~2,000
- **Pages**: 8
- **Components**: 1 (Navbar)
- **Context Providers**: 1 (Auth)
- **Utilities**: 1 (API client)

## 🎯 Key Files Explained

### Backend

#### `server/server.js`
Main Express application entry point. Sets up middleware, routes, and starts the server.

#### `server/models/Report.js`
Mongoose schema for civic reports with:
- Basic info (title, description)
- Classification (category, priority, status)
- Location (geospatial coordinates)
- AI metadata (classification results)
- Timestamps and relationships

#### `server/services/aiClassifier.js`
OpenAI integration that:
- Analyzes report descriptions
- Returns category and priority
- Provides confidence scores
- Includes reasoning

#### `server/routes/reports.js`
Report API endpoints:
- POST /api/reports - Create with AI classification
- GET /api/reports - List with filters
- GET /api/reports/:id - Get single report
- PATCH /api/reports/:id - Update status (admin)
- DELETE /api/reports/:id - Delete (admin)

### Frontend

#### `client/src/App.jsx`
Main application component with:
- React Router setup
- Protected route logic
- Route definitions
- Auth provider wrapper

#### `client/src/pages/ReportIssue.jsx`
Report submission form with:
- Title and description inputs
- Image upload (up to 5)
- Location capture (GPS/manual)
- AI classification feedback
- Success confirmation

#### `client/src/pages/AdminDashboard.jsx`
Admin interface with:
- Analytics overview cards
- Interactive charts (Recharts)
- Report management table
- Filter controls
- Status update functionality

#### `client/src/context/AuthContext.jsx`
Authentication state management:
- Login/logout functions
- User state
- Token management
- Role checking

#### `client/src/utils/api.js`
Axios API client with:
- Base URL configuration
- Request interceptors (add token)
- Response interceptors (handle errors)
- Organized API endpoints

## 🔧 Configuration Files

### Backend Config

**`.env`** - Environment variables:
```env
PORT=5000
MONGODB_URI=mongodb://...
JWT_SECRET=secret_key
OPENAI_API_KEY=sk-...
```

**`package.json`** - Dependencies:
- express, mongoose, dotenv
- jsonwebtoken, bcryptjs
- multer, cloudinary
- openai, cors

### Frontend Config

**`vite.config.js`** - Build configuration:
- Dev server port (3000)
- Proxy to backend API
- React plugin

**`tailwind.config.js`** - Styling:
- Custom color palette
- Content paths
- Theme extensions

**`package.json`** - Dependencies:
- react, react-dom, react-router-dom
- axios, recharts
- lucide-react, tailwindcss

## 📦 Dependencies Overview

### Backend Dependencies (11)
```json
{
  "express": "Web framework",
  "mongoose": "MongoDB ODM",
  "dotenv": "Environment variables",
  "cors": "Cross-origin requests",
  "bcryptjs": "Password hashing",
  "jsonwebtoken": "JWT authentication",
  "multer": "File uploads",
  "cloudinary": "Image hosting",
  "openai": "AI classification",
  "express-validator": "Input validation"
}
```

### Frontend Dependencies (8)
```json
{
  "react": "UI library",
  "react-dom": "React DOM rendering",
  "react-router-dom": "Routing",
  "axios": "HTTP client",
  "lucide-react": "Icons",
  "recharts": "Charts",
  "tailwindcss": "CSS framework",
  "vite": "Build tool"
}
```

## 🗂️ Data Flow

```
User Action (Frontend)
    ↓
React Component
    ↓
API Call (axios)
    ↓
Express Route Handler
    ↓
Middleware (auth check)
    ↓
Service Layer (AI classification)
    ↓
Database (MongoDB)
    ↓
Response to Frontend
    ↓
UI Update
```

## 📝 Naming Conventions

### Files
- **Components**: PascalCase (e.g., `Navbar.jsx`)
- **Pages**: PascalCase (e.g., `ReportIssue.jsx`)
- **Utils**: camelCase (e.g., `api.js`)
- **Config**: lowercase (e.g., `database.js`)

### Code
- **Variables**: camelCase (e.g., `userName`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_URL`)
- **Functions**: camelCase (e.g., `fetchReports`)
- **Components**: PascalCase (e.g., `ReportCard`)

## 🎨 Code Organization

### Backend Pattern
```
Route → Middleware → Controller → Service → Model → Database
```

### Frontend Pattern
```
Page → Component → Context → API → Backend
```

## 📏 Code Quality

- **Consistent formatting**: Prettier-ready
- **Clear naming**: Self-documenting code
- **Modular structure**: Separated concerns
- **Reusable components**: DRY principle
- **Error handling**: Try-catch blocks
- **Comments**: Where necessary

## 🔍 Finding Files

### Need to modify...

**Authentication?**
- Backend: `server/routes/auth.js`, `server/middleware/auth.js`
- Frontend: `client/src/context/AuthContext.jsx`

**Report submission?**
- Backend: `server/routes/reports.js`
- Frontend: `client/src/pages/ReportIssue.jsx`

**AI classification?**
- Backend: `server/services/aiClassifier.js`

**Dashboard analytics?**
- Backend: `server/routes/stats.js`
- Frontend: `client/src/pages/AdminDashboard.jsx`

**Styling?**
- Global: `client/src/index.css`
- Config: `client/tailwind.config.js`

**Database models?**
- Backend: `server/models/`

---

**This structure provides a clean, maintainable, and scalable codebase! 🏗️**
