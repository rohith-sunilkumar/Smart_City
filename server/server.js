import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';
import connectDB from './config/database.js';
import { initializeSocket } from './config/socket.js';
import authRoutes from './routes/auth.js';
import reportRoutes from './routes/reports.js';
import departmentReportsRoutes from './routes/departmentReports.js';
import statsRoutes from './routes/stats.js';
import feedbackRoutes from './routes/feedback.js';
import mayorRoutes from './routes/mayor.js';
import mayorAlertRoutes from './routes/mayorAlert.js';
import chatRoutes from './routes/chat.js';
import reviewRoutes from './routes/reviews.js';
import aiChatRoutes from './routes/aiChat.js';
import visualAnalysisRoutes from './routes/visualAnalysis.js';
import notificationRoutes from './routes/notifications.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const httpServer = createServer(app);

// Connect to MongoDB
connectDB();

// Initialize Socket.IO
const io = initializeSocket(httpServer);
console.log('🔌 Socket.IO initialized');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check route
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Smart City Portal API is running',
    timestamp: new Date().toISOString()
  });
});

// API Health check route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Smart City Portal API is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/department-reports', departmentReportsRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/mayor', mayorRoutes);
app.use('/api/mayor-alert', mayorAlertRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/chat', aiChatRoutes); // AI chat assistant
app.use('/api/reviews', reviewRoutes);
app.use('/api/visual-analysis', visualAnalysisRoutes); // Local visual analyzer
app.use('/api/notifications', notificationRoutes); // Notifications

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API URL: http://localhost:${PORT}`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
  console.log(`🔌 Socket.IO ready for real-time feedback\n`);
});

export default app;
