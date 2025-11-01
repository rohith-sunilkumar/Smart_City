# 🏙️ Smart City Citizen Portal

A full-stack MERN web application that empowers citizens to report civic issues with AI-powered automatic categorization and priority assignment.

## 🌟 Features

### Citizen Features
- **Easy Issue Reporting**: Simple form to report civic problems
- **Photo Upload**: Attach up to 5 images per report
- **Location Tracking**: Auto-detect or manually enter location
- **AI Classification**: Automatic categorization and priority assignment
- **Status Tracking**: Monitor report progress from submission to resolution
- **Personal Dashboard**: View all your submitted reports

### Admin Features
- **Comprehensive Dashboard**: Analytics and statistics overview
- **Report Management**: Filter, view, and update report status
- **AI Insights**: View AI classification results and confidence scores
- **Department Assignment**: Automatic department routing based on category
- **Analytics Charts**: Visual representation of reports by category, status, and trends
- **Workload Distribution**: Monitor department workload

### AI Capabilities
- **Smart Categorization**: Automatically classifies reports into categories (road, lighting, waste, safety, water, other)
- **Priority Assignment**: Determines urgency (high, medium, low) based on description
- **Department Routing**: Routes reports to appropriate departments
- **Confidence Scoring**: Provides confidence level for AI decisions

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Recharts** - Data visualization
- **Axios** - HTTP client
- **Vite** - Build tool

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **OpenAI API** - AI classification
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File upload
- **Cloudinary** - Image storage (optional)

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- OpenAI API key

### Backend Setup

1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smart-city-portal
JWT_SECRET=your_secure_jwt_secret_here
OPENAI_API_KEY=your_openai_api_key_here
CLOUDINARY_CLOUD_NAME=your_cloudinary_name (optional)
CLOUDINARY_API_KEY=your_cloudinary_key (optional)
CLOUDINARY_API_SECRET=your_cloudinary_secret (optional)
NODE_ENV=development
```

5. Start the server:
```bash
npm run dev
```

Server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

Client will run on `http://localhost:3000`

## 🚀 Usage

### For Citizens

1. **Register/Login**: Create an account or login
2. **Report Issue**: Click "Report Issue" and fill out the form
   - Add title and description
   - Upload photos (optional)
   - Add location (auto-detect or manual)
3. **Submit**: AI will automatically categorize and prioritize
4. **Track**: View status in "My Reports"

### For Admins

1. **Login**: Use admin credentials
2. **Dashboard**: View analytics and statistics
3. **Manage Reports**: 
   - Filter by status, category, priority
   - Update report status
   - View detailed information
4. **Monitor**: Track department workload and trends

### Demo Credentials

**Citizen Account:**
- Email: `citizen@demo.com`
- Password: `password`

**Admin Account:**
- Email: `admin@demo.com`
- Password: `password`

> Note: Create these accounts manually or through registration

## 📁 Project Structure

```
smart-city-portal/
├── server/
│   ├── config/
│   │   ├── database.js
│   │   └── cloudinary.js
│   ├── models/
│   │   ├── User.js
│   │   └── Report.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── reports.js
│   │   └── stats.js
│   ├── middleware/
│   │   └── auth.js
│   ├── services/
│   │   └── aiClassifier.js
│   ├── server.js
│   └── package.json
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   └── Navbar.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Landing.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── ReportIssue.jsx
│   │   │   ├── MyReports.jsx
│   │   │   ├── ReportDetail.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   └── NotFound.jsx
│   │   ├── utils/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   └── package.json
│
└── README.md
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Reports
- `POST /api/reports` - Create new report (with AI classification)
- `GET /api/reports` - Get all reports (filtered)
- `GET /api/reports/:id` - Get single report
- `PATCH /api/reports/:id` - Update report (admin only)
- `DELETE /api/reports/:id` - Delete report (admin only)

### Statistics
- `GET /api/stats` - Get dashboard statistics (admin only)

## 🤖 AI Classification

The system uses OpenAI's GPT-4 to analyze report descriptions and automatically:

1. **Categorize** into: road, lighting, waste, safety, water, or other
2. **Prioritize** as: high, medium, or low
3. **Assign Department**: Based on category
4. **Provide Reasoning**: Explanation for classification

Example AI prompt structure:
```
Analyze this civic complaint:
Title: [title]
Description: [description]

Classify into category and priority with reasoning.
```

## 🎨 UI/UX Features

- **Responsive Design**: Works on all devices
- **Modern UI**: Clean, intuitive interface with Tailwind CSS
- **Loading States**: Smooth loading indicators
- **Error Handling**: User-friendly error messages
- **Success Feedback**: Clear confirmation messages
- **Interactive Charts**: Visual analytics with Recharts
- **Status Timeline**: Visual progress tracking

## 🔒 Security

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: Bcrypt for password security
- **Role-Based Access**: Citizen and admin roles
- **Input Validation**: Server-side validation
- **Protected Routes**: Frontend and backend protection

## 🚀 Deployment

### Backend (Render/Railway)
1. Push code to GitHub
2. Connect repository to Render/Railway
3. Set environment variables
4. Deploy

### Frontend (Vercel/Netlify)
1. Push code to GitHub
2. Connect repository to Vercel/Netlify
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Deploy

### Database (MongoDB Atlas)
1. Create cluster on MongoDB Atlas
2. Get connection string
3. Update `MONGODB_URI` in environment variables

## 📊 Future Enhancements

- [ ] Real-time notifications (Socket.io)
- [ ] Email/SMS alerts
- [ ] Interactive map with issue markers (Mapbox)
- [ ] Chat between citizens and admins
- [ ] AI-generated response templates
- [ ] Heatmap visualization
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Report voting/upvoting
- [ ] Public API for third-party integrations

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👥 Team

Built for Smart City Hackathon 2024

## 🙏 Acknowledgments

- OpenAI for AI classification capabilities
- MongoDB for database
- Cloudinary for image hosting
- All open-source libraries used in this project

---

**Made with ❤️ for building better cities**
