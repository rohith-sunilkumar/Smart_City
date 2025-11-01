import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Feedback from '../models/Feedback.js';
import Report from '../models/Report.js';

// Helper function to find report in any collection
const findReport = async (reportId) => {
  // Try main reports collection first
  try {
    let report = await Report.findById(reportId);
    if (report) return { report, model: 'Report' };
  } catch (error) {
    // Report not found in main collection, continue
  }
  
  // Try department-specific collections by directly querying the database
  const departments = ['roadservice', 'hospitalemergency', 'watermanagement', 'electricalservice', 'general'];
  
  for (const dept of departments) {
    const collectionName = `${dept}reports`;
    try {
      // Query directly using the database connection
      const collection = mongoose.connection.db.collection(collectionName);
      const doc = await collection.findOne({ _id: new mongoose.Types.ObjectId(reportId) });
      
      if (doc) {
        return { report: doc, model: collectionName };
      }
    } catch (error) {
      console.error(`Error searching ${collectionName}:`, error.message);
      continue;
    }
  }
  
  return { report: null, model: null };
};

let io;

export const initializeSocket = (server) => {
  // Allow multiple origins for development and production
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://team-design.onrender.com',
    'https://smart-city-4nwz.onrender.com',
    process.env.CLIENT_URL
  ].filter(Boolean);

  io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          console.log('⚠️ Blocked CORS request from:', origin);
          callback(null, true); // Allow all origins for now
        }
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization']
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // Socket.IO authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.user.name} (${socket.user.role})`);

    // Join report-specific room
    socket.on('join_report', async (reportId) => {
      try {
        const { report, model } = await findReport(reportId);
        
        if (!report) {
          socket.emit('error', { message: 'Report not found' });
          return;
        }

        // Check authorization
        const isReporter = report.reporter.toString() === socket.user._id.toString();
        
        let reportDepartment = report.assignedDepartment;
        if (!reportDepartment && model !== 'Report') {
          reportDepartment = model.replace('reports', '');
          if (reportDepartment === 'roadservice') reportDepartment = 'road_service';
          if (reportDepartment === 'hospitalemergency') reportDepartment = 'hospital_emergency';
          if (reportDepartment === 'watermanagement') reportDepartment = 'water_management';
          if (reportDepartment === 'electricalservice') reportDepartment = 'electrical_service';
        }
        
        const isAuthorizedAdmin = socket.user.role === 'admin' && reportDepartment === socket.user.department;
        const isMayor = socket.user.role === 'mayor'; // Mayor has access to all reports

        if (!isReporter && !isAuthorizedAdmin && !isMayor) {
          socket.emit('error', { message: 'Not authorized to access this report' });
          return;
        }

        socket.join(`report_${reportId}`);
        console.log(`📍 ${socket.user.name} joined report room: ${reportId}`);
        
        socket.emit('joined_report', { reportId, message: 'Successfully joined report room' });
      } catch (error) {
        console.error('Join report error:', error);
        socket.emit('error', { message: 'Failed to join report room' });
      }
    });

    // Leave report room
    socket.on('leave_report', (reportId) => {
      socket.leave(`report_${reportId}`);
      console.log(`📤 ${socket.user.name} left report room: ${reportId}`);
    });

    // Send feedback message
    socket.on('send_feedback', async (data) => {
      try {
        const { reportId, message, attachments } = data;

        const { report, model } = await findReport(reportId);
        
        if (!report) {
          socket.emit('error', { message: 'Report not found' });
          return;
        }

        // Check authorization
        const isReporter = report.reporter.toString() === socket.user._id.toString();
        
        let reportDepartment = report.assignedDepartment;
        if (!reportDepartment && model !== 'Report') {
          reportDepartment = model.replace('reports', '');
          if (reportDepartment === 'roadservice') reportDepartment = 'road_service';
          if (reportDepartment === 'hospitalemergency') reportDepartment = 'hospital_emergency';
          if (reportDepartment === 'watermanagement') reportDepartment = 'water_management';
          if (reportDepartment === 'electricalservice') reportDepartment = 'electrical_service';
        }
        
        const isAuthorizedAdmin = socket.user.role === 'admin' && reportDepartment === socket.user.department;
        const isMayor = socket.user.role === 'mayor'; // Mayor has access to all reports

        if (!isReporter && !isAuthorizedAdmin && !isMayor) {
          socket.emit('error', { message: 'Not authorized to send feedback on this report' });
          return;
        }

        // Create feedback message
        const feedback = await Feedback.create({
          reportId,
          sender: socket.user._id,
          senderRole: socket.user.role,
          message,
          attachments: attachments || []
        });

        // Update report feedback metadata using direct database update
        const updateData = {
          $inc: { feedbackCount: 1 },
          $set: { 
            lastFeedbackAt: new Date(),
            hasUnreadFeedback: true 
          }
        };
        
        if (model === 'Report') {
          await Report.findByIdAndUpdate(reportId, updateData);
        } else {
          // Update in department-specific collection
          await mongoose.connection.db.collection(model).updateOne(
            { _id: new mongoose.Types.ObjectId(reportId) },
            updateData
          );
        }

        // Populate sender details
        await feedback.populate('sender', 'name email role');

        // Emit to all users in the report room
        io.to(`report_${reportId}`).emit('new_feedback', {
          feedback,
          reportId
        });

        console.log(`💬 Feedback sent by ${socket.user.name} on report ${reportId}`);
      } catch (error) {
        console.error('Send feedback error:', error);
        socket.emit('error', { message: 'Failed to send feedback' });
      }
    });

    // Mark feedback as read
    socket.on('mark_feedback_read', async (data) => {
      try {
        const { reportId } = data;

        const { report, model } = await findReport(reportId);
        
        if (!report) {
          socket.emit('error', { message: 'Report not found' });
          return;
        }

        // Check authorization
        const isReporter = report.reporter.toString() === socket.user._id.toString();
        
        let reportDepartment = report.assignedDepartment;
        if (!reportDepartment && model !== 'Report') {
          reportDepartment = model.replace('reports', '');
          if (reportDepartment === 'roadservice') reportDepartment = 'road_service';
          if (reportDepartment === 'hospitalemergency') reportDepartment = 'hospital_emergency';
          if (reportDepartment === 'watermanagement') reportDepartment = 'water_management';
          if (reportDepartment === 'electricalservice') reportDepartment = 'electrical_service';
        }
        
        const isAuthorizedAdmin = socket.user.role === 'admin' && reportDepartment === socket.user.department;
        const isMayor = socket.user.role === 'mayor'; // Mayor has access to all reports

        if (!isReporter && !isAuthorizedAdmin && !isMayor) {
          return;
        }

        // Mark all unread feedback as read for this user
        await Feedback.updateMany(
          { 
            reportId, 
            sender: { $ne: socket.user._id },
            isRead: false 
          },
          { isRead: true }
        );

        // Update report using direct database update
        if (model === 'Report') {
          await Report.findByIdAndUpdate(reportId, { hasUnreadFeedback: false });
        } else {
          await mongoose.connection.db.collection(model).updateOne(
            { _id: new mongoose.Types.ObjectId(reportId) },
            { $set: { hasUnreadFeedback: false } }
          );
        }

        socket.emit('feedback_marked_read', { reportId });
      } catch (error) {
        console.error('Mark feedback read error:', error);
      }
    });

    // Typing indicator
    socket.on('typing', (data) => {
      const { reportId } = data;
      socket.to(`report_${reportId}`).emit('user_typing', {
        userId: socket.user._id,
        userName: socket.user.name,
        reportId
      });
    });

    socket.on('stop_typing', (data) => {
      const { reportId } = data;
      socket.to(`report_${reportId}`).emit('user_stop_typing', {
        userId: socket.user._id,
        reportId
      });
    });

    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.user.name}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};
