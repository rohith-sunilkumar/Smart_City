import express from 'express';
import { body, validationResult } from 'express-validator';
import Report from '../models/Report.js';
import { protect, authorize } from '../middleware/auth.js';
import { classifyComplaint } from '../services/aiClassifier.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

// @route   POST /api/reports
// @desc    Create a new report with AI classification
// @access  Private (Citizen)
router.post('/', protect, upload.array('images', 5), [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('location.coordinates').optional().isArray().withMessage('Coordinates must be an array'),
  body('location.address').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { title, description, location, category: userSelectedCategory } = req.body;

    // Process uploaded images with full URL
    let baseUrl = process.env.BASE_URL;
    if (!baseUrl) {
      const host = req.get('host');
      const protocol = req.protocol;
      baseUrl = `${protocol}://${host}`;
      console.log(`📸 Constructed BASE_URL: ${baseUrl} (protocol: ${protocol}, host: ${host})`);
    }
    
    const images = req.files ? req.files.map(file => ({
      url: `${baseUrl}/uploads/${file.filename}`,
      publicId: file.filename
    })) : [];

    const imagePaths = req.files ? req.files.map(file => file.filename) : [];

    // Category to department mapping (centralized)
    const CATEGORY_TO_DEPT = {
      'Road Service Department': 'road_service',
      'Hospital Emergency Department': 'hospital_emergency',
      'Water Management Department': 'water_management',
      'Electrical Service Department': 'electrical_service',
      'General Department': 'general'
    };

    // Determine final classification
    let aiResult;
    
    if (userSelectedCategory && CATEGORY_TO_DEPT[userSelectedCategory]) {
      // User manually selected - skip AI
      console.log('📋 User-selected:', userSelectedCategory);
      aiResult = {
        category: userSelectedCategory,
        priority: 'medium',
        department: CATEGORY_TO_DEPT[userSelectedCategory],
        confidence: 1.0,
        reasoning: 'User-selected category'
      };
    } else {
      // Use AI Classification
      console.log('🤖 AI classifying...');
      aiResult = await classifyComplaint(title, description, imagePaths);
      console.log('✅ AI result:', aiResult);
    }
    
    const { category: finalCategory, priority: finalPriority, department: finalDepartment } = aiResult;

    // Parse location if provided
    let parsedLocation = undefined;
    if (location) {
      const locationData = typeof location === 'string' ? JSON.parse(location) : location;
      if (locationData.coordinates && locationData.coordinates.length === 2) {
        parsedLocation = {
          type: 'Point',
          coordinates: locationData.coordinates,
          address: locationData.address || ''
        };
      }
    }

    // Create report
    console.log('📝 Creating report with:', {
      category: finalCategory,
      assignedDepartment: finalDepartment,
      priority: finalPriority
    });
    
    const report = await Report.create({
      title,
      description,
      category: finalCategory,
      priority: finalPriority,
      assignedDepartment: finalDepartment,
      images,
      location: parsedLocation,
      reporter: req.user._id,
      ai_metadata: {
        suggestedCategory: aiResult.category,
        suggestedPriority: aiResult.priority,
        confidence: aiResult.confidence,
        reasoning: aiResult.reasoning
      }
    });
    
    console.log('✅ Report created:', {
      id: report._id,
      category: report.category,
      assignedDepartment: report.assignedDepartment
    });

    const populatedReport = await Report.findById(report._id).populate('reporter', 'name email');

    res.status(201).json({
      success: true,
      message: 'Report created successfully',
      data: {
        report: populatedReport,
        aiClassification: {
          category: aiResult.category,
          priority: aiResult.priority,
          department: aiResult.department,
          confidence: aiResult.confidence,
          reasoning: aiResult.reasoning,
          imageAnalysis: aiResult.imageAnalysis
        }
      }
    });
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating report',
      error: error.message
    });
  }
});

// @route   GET /api/reports
// @desc    Get all reports (with filters for admin)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { status, category, priority, page = 1, limit = 10 } = req.query;
    
    console.log('📥 GET /api/reports - User:', {
      name: req.user.name,
      role: req.user.role,
      department: req.user.department
    });
    
    const query = {};
    
    // Citizens can only see their own reports
    if (req.user.role === 'citizen') {
      query.reporter = req.user._id;
      console.log('👤 Citizen query:', query);
    }
    
    // Admins can only see reports for their department
    if (req.user.role === 'admin') {
      if (req.user.department) {
        query.assignedDepartment = req.user.department;
        console.log(`🔒 Admin filter applied: ${req.user.name} (${req.user.department})`);
      } else {
        console.log('⚠️  WARNING: Admin has no department assigned!');
      }
    }
    
    // Apply filters
    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;

    console.log('🔍 Final query:', query);

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reports = await Report.find(query)
      .populate('reporter', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    console.log(`📊 Found ${reports.length} reports`);
    if (reports.length > 0) {
      console.log('📋 Sample report:', {
        id: reports[0]._id,
        title: reports[0].title,
        category: reports[0].category,
        assignedDepartment: reports[0].assignedDepartment
      });
    }

    const total = await Report.countDocuments(query);

    res.json({
      success: true,
      data: {
        reports,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching reports',
      error: error.message
    });
  }
});

// @route   GET /api/reports/:id
// @desc    Get single report by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id).populate('reporter', 'name email phone');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Citizens can only view their own reports
    if (req.user.role === 'citizen' && report.reporter._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this report'
      });
    }

    // Admins can only view reports for their department
    if (req.user.role === 'admin' && req.user.department && report.assignedDepartment !== req.user.department) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this report. This report is assigned to a different department.'
      });
    }

    res.json({
      success: true,
      data: { report }
    });
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching report',
      error: error.message
    });
  }
});

// @route   PATCH /api/reports/:id
// @desc    Update report status (Admin only)
// @access  Private (Admin)
router.patch('/:id', protect, authorize('admin'), [
  body('status').optional().isIn(['open', 'in-progress', 'resolved', 'closed']),
  body('adminNotes').optional().trim(),
  body('category').optional().isIn(['Road Service Department', 'Hospital Emergency Department', 'Water Management Department', 'Electrical Service Department', 'General Department']),
  body('priority').optional().isIn(['high', 'medium', 'low'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Admins can only update reports for their department
    if (req.user.department && report.assignedDepartment !== req.user.department) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this report. This report is assigned to a different department.'
      });
    }

    const { status, adminNotes, category, priority, assignedDepartment } = req.body;

    if (status) {
      report.status = status;
      if (status === 'resolved' && !report.resolvedAt) {
        report.resolvedAt = new Date();
      }
    }
    if (adminNotes) report.adminNotes = adminNotes;
    if (category) report.category = category;
    if (priority) report.priority = priority;
    if (assignedDepartment) report.assignedDepartment = assignedDepartment;

    await report.save();

    const updatedReport = await Report.findById(report._id).populate('reporter', 'name email');

    res.json({
      success: true,
      message: 'Report updated successfully',
      data: { report: updatedReport }
    });
  } catch (error) {
    console.error('Update report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating report',
      error: error.message
    });
  }
});

// @route   DELETE /api/reports/:id
// @desc    Delete report (Admin only)
// @access  Private (Admin)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Admins can only delete reports for their department
    if (req.user.department && report.assignedDepartment !== req.user.department) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this report. This report is assigned to a different department.'
      });
    }

    await report.deleteOne();

    res.json({
      success: true,
      message: 'Report deleted successfully'
    });
  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting report',
      error: error.message
    });
  }
});

export default router;
