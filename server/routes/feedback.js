import express from 'express';
import { body, validationResult } from 'express-validator';
import Feedback from '../models/Feedback.js';
import Report from '../models/Report.js';
import mongoose from 'mongoose';
import { protect } from '../middleware/auth.js';
import { upload } from '../config/cloudinary.js';

// Helper function to find report in any collection
const findReport = async (reportId) => {
  console.log(`🔎 findReport called for ID: ${reportId}`);
  
  // Try main reports collection first
  try {
    let report = await Report.findById(reportId);
    if (report) {
      console.log(`✅ Found in main reports collection`);
      return { report, model: 'Report' };
    }
  } catch (error) {
    console.log(`⚠️  Not in main reports collection`);
  }
  
  // Try department-specific collections by directly querying the database
  const departments = ['roadservice', 'hospitalemergency', 'watermanagement', 'electricalservice', 'general'];
  console.log(`🔍 Searching department collections...`);
  
  for (const dept of departments) {
    const collectionName = `${dept}reports`;
    try {
      // Query directly using the database connection
      const collection = mongoose.connection.db.collection(collectionName);
      const doc = await collection.findOne({ _id: new mongoose.Types.ObjectId(reportId) });
      
      if (doc) {
        console.log(`✅ Found in ${collectionName}`);
        // Convert to mongoose document-like object
        return { report: doc, model: collectionName };
      }
    } catch (error) {
      console.error(`❌ Error searching ${collectionName}:`, error.message);
      continue;
    }
  }
  
  console.log(`❌ Report ${reportId} not found in any collection`);
  return { report: null, model: null };
};

const router = express.Router();

// @route   GET /api/feedback/:reportId
// @desc    Get all feedback messages for a report
// @access  Private (Reporter or Authorized Admin)
router.get('/:reportId', protect, async (req, res) => {
  try {
    const { reportId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    console.log(`🔍 Searching for report: ${reportId}`);
    const { report, model } = await findReport(reportId);

    if (!report) {
      console.log(`❌ Report not found: ${reportId}`);
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }
    
    console.log(`✅ Report found in ${model} collection`);

    // Check authorization
    const isReporter = report.reporter.toString() === req.user._id.toString();
    
    // For department-specific collections, extract department from collection name
    let reportDepartment = report.assignedDepartment;
    if (!reportDepartment && model !== 'Report') {
      // Extract department from collection name (e.g., 'roadservicereports' -> 'road_service')
      reportDepartment = model.replace('reports', '').replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
      if (reportDepartment === 'roadservice') reportDepartment = 'road_service';
      if (reportDepartment === 'hospitalemergency') reportDepartment = 'hospital_emergency';
      if (reportDepartment === 'watermanagement') reportDepartment = 'water_management';
      if (reportDepartment === 'electricalservice') reportDepartment = 'electrical_service';
    }
    
    const isAuthorizedAdmin = req.user.role === 'admin' && reportDepartment === req.user.department;
    const isMayor = req.user.role === 'mayor'; // Mayor has access to all feedback
    
    console.log(`🔐 Authorization check: isReporter=${isReporter}, isAdmin=${req.user.role === 'admin'}, isMayor=${isMayor}, reportDept=${reportDepartment}, userDept=${req.user.department}`);

    if (!isReporter && !isAuthorizedAdmin && !isMayor) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view feedback for this report'
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const feedbacks = await Feedback.find({ reportId })
      .populate('sender', 'name email role department')
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Feedback.countDocuments({ reportId });

    // Mark feedback as read for the current user
    await Feedback.updateMany(
      { 
        reportId, 
        sender: { $ne: req.user._id },
        isRead: false 
      },
      { isRead: true }
    );

    res.json({
      success: true,
      data: {
        feedbacks,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching feedback',
      error: error.message
    });
  }
});

// @route   POST /api/feedback/:reportId
// @desc    Create a new feedback message (REST API fallback)
// @access  Private (Reporter or Authorized Admin)
router.post('/:reportId', protect, upload.array('attachments', 3), [
  body('message').trim().notEmpty().withMessage('Message is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { reportId } = req.params;
    const { message } = req.body;

    const { report, model } = await findReport(reportId);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Check authorization
    const isReporter = report.reporter.toString() === req.user._id.toString();
    
    // For department-specific collections, extract department from collection name
    let reportDepartment = report.assignedDepartment;
    if (!reportDepartment && model !== 'Report') {
      reportDepartment = model.replace('reports', '');
      if (reportDepartment === 'roadservice') reportDepartment = 'road_service';
      if (reportDepartment === 'hospitalemergency') reportDepartment = 'hospital_emergency';
      if (reportDepartment === 'watermanagement') reportDepartment = 'water_management';
      if (reportDepartment === 'electricalservice') reportDepartment = 'electrical_service';
    }
    
    const isAuthorizedAdmin = req.user.role === 'admin' && reportDepartment === req.user.department;
    const isMayor = req.user.role === 'mayor'; // Mayor has access to all feedback

    if (!isReporter && !isAuthorizedAdmin && !isMayor) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to send feedback on this report'
      });
    }

    // Process uploaded attachments with full URL
    let baseUrl = process.env.BASE_URL;
    if (!baseUrl) {
      const host = req.get('host');
      const protocol = req.protocol;
      baseUrl = `${protocol}://${host}`;
      console.log(`📎 Constructed BASE_URL: ${baseUrl} (protocol: ${protocol}, host: ${host})`);
    }
    
    const attachments = req.files ? req.files.map(file => ({
      url: `${baseUrl}/uploads/${file.filename}`,
      publicId: file.filename,
      type: file.mimetype.startsWith('image/') ? 'image' : 'document'
    })) : [];

    // Create feedback
    const feedback = await Feedback.create({
      reportId,
      sender: req.user._id,
      senderRole: req.user.role,
      message,
      attachments
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
    await feedback.populate('sender', 'name email role department');

    res.status(201).json({
      success: true,
      message: 'Feedback sent successfully',
      data: { feedback }
    });
  } catch (error) {
    console.error('Create feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating feedback',
      error: error.message
    });
  }
});

// @route   GET /api/feedback/:reportId/unread-count
// @desc    Get unread feedback count for a report
// @access  Private (Reporter or Authorized Admin)
router.get('/:reportId/unread-count', protect, async (req, res) => {
  try {
    const { reportId } = req.params;

    const { report } = await findReport(reportId);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Check authorization
    const isReporter = report.reporter.toString() === req.user._id.toString();
    const isAuthorizedAdmin = req.user.role === 'admin' && 
                              report.assignedDepartment === req.user.department;
    const isMayor = req.user.role === 'mayor'; // Mayor has access to all feedback

    if (!isReporter && !isAuthorizedAdmin && !isMayor) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view feedback for this report'
      });
    }

    const unreadCount = await Feedback.countDocuments({
      reportId,
      sender: { $ne: req.user._id },
      isRead: false
    });

    res.json({
      success: true,
      data: { unreadCount }
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching unread count',
      error: error.message
    });
  }
});

// @route   DELETE /api/feedback/:feedbackId
// @desc    Delete a feedback message (only sender can delete)
// @access  Private
router.delete('/:feedbackId', protect, async (req, res) => {
  try {
    const { feedbackId } = req.params;

    const feedback = await Feedback.findById(feedbackId);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    // Only sender can delete their own feedback
    if (feedback.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this feedback'
      });
    }

    await feedback.deleteOne();

    // Update report feedback count
    const { report } = await findReport(feedback.reportId);
    if (report && report.feedbackCount > 0) {
      report.feedbackCount -= 1;
      await report.save();
    }

    res.json({
      success: true,
      message: 'Feedback deleted successfully'
    });
  } catch (error) {
    console.error('Delete feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting feedback',
      error: error.message
    });
  }
});

export default router;
