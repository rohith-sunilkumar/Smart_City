import express from 'express';
import { body, validationResult } from 'express-validator';
import { protect, authorize } from '../middleware/auth.js';
import { upload } from '../config/cloudinary.js';
import { classifyComplaint } from '../services/aiClassifier.js';
import { getDepartmentModel, getAllDepartmentModels } from '../models/DepartmentReport.js';
import aiModelService from '../services/aiModelService.js';
import path from 'path';

const router = express.Router();

// Category to department mapping
const CATEGORY_TO_DEPT = {
  'Road Service Department': 'road_service',
  'Hospital Emergency Department': 'hospital_emergency',
  'Water Management Department': 'water_management',
  'Electrical Service Department': 'electrical_service',
  'General Department': 'general'
};

// @route   POST /api/department-reports
// @desc    Create a new report (stored in department-specific collection)
// @access  Private
router.post('/', protect, upload.array('images', 5), [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { title, description, location, category: userSelectedCategory } = req.body;

    // Process images with full URL
    // Determine base URL: use env variable, or construct from request
    let baseUrl = process.env.BASE_URL;
    if (!baseUrl) {
      const host = req.get('host');
      const protocol = req.protocol;
      baseUrl = `${protocol}://${host}`;
      console.log(`📸 Constructed BASE_URL: ${baseUrl} (protocol: ${protocol}, host: ${host})`);
    } else {
      console.log(`📸 Using BASE_URL from env: ${baseUrl}`);
    }
    
    const images = req.files ? req.files.map(file => ({
      url: `${baseUrl}/uploads/${file.filename}`,
      publicId: file.filename
    })) : [];
    
    if (images.length > 0) {
      console.log(`📸 Stored image URLs:`, images.map(img => img.url));
    }

    const imagePaths = req.files ? req.files.map(file => file.filename) : [];

    // Determine classification
    let aiResult;
    if (userSelectedCategory && CATEGORY_TO_DEPT[userSelectedCategory]) {
      // User manually selected category - don't override
      aiResult = {
        category: userSelectedCategory,
        priority: 'medium',
        department: CATEGORY_TO_DEPT[userSelectedCategory],
        confidence: 1.0,
        reasoning: 'User-selected category'
      };
      console.log('👤 User manually selected category:', userSelectedCategory);
    } else if (imagePaths.length > 0) {
      // User uploaded images but didn't select category - use trained AI model
      console.log('🖼️  Attempting AI image classification with trained model...');
      try {
        const isModelAvailable = await aiModelService.isModelAvailable();
        
        if (isModelAvailable) {
          // Use the first image for classification
          const firstImagePath = path.join(process.cwd(), 'uploads', imagePaths[0]);
          const modelPrediction = await aiModelService.predictImage(firstImagePath);
          
          if (modelPrediction.success) {
            console.log('✅ Trained AI model prediction:', modelPrediction);
            
            // Map trained model categories to our department system
            const categoryMapping = {
              'Pothole Issues': 'Road Service Department',
              'Damaged Road issues': 'Road Service Department',
              'Broken Road Sign Issues': 'Road Service Department',
              'Illegal Parking Issues': 'Road Service Department',
              'Littering Garbage on Public Places Issues': 'General Department',
              'Vandalism Issues': 'General Department',
              'Mixed Issues': 'Road Service Department'
            };
            
            const mappedCategory = categoryMapping[modelPrediction.category] || 'General Department';
            const mappedDept = CATEGORY_TO_DEPT[mappedCategory] || 'general';
            
            // Determine priority based on confidence
            let priority = 'medium';
            if (modelPrediction.confidence >= 0.85) {
              priority = 'high';
            } else if (modelPrediction.confidence < 0.6) {
              priority = 'low';
            }
            
            aiResult = {
              category: mappedCategory,
              priority: priority,
              department: mappedDept,
              confidence: modelPrediction.confidence,
              reasoning: `Trained AI model detected: ${modelPrediction.category} (${(modelPrediction.confidence * 100).toFixed(1)}% confidence)`
            };
            
            console.log('🎯 Using trained AI model classification:', aiResult);
          } else {
            // Model prediction failed, fallback to text+image classification
            console.log('⚠️  Model prediction failed, using fallback classification');
            aiResult = await classifyComplaint(title, description, imagePaths);
          }
        } else {
          // Model not trained yet, use existing classification
          console.log('⚠️  Trained model not available, using existing classification');
          aiResult = await classifyComplaint(title, description, imagePaths);
        }
      } catch (error) {
        console.error('❌ Error with trained AI model:', error.message);
        console.log('⚠️  Falling back to existing classification');
        aiResult = await classifyComplaint(title, description, imagePaths);
      }
    } else {
      // No images and no manual selection - use text-based classification
      console.log('📝 Using text-based classification');
      aiResult = await classifyComplaint(title, description, imagePaths);
    }

    const { category, department } = aiResult;
    let { priority } = aiResult;

    // If the reporter is a mayor, automatically set priority to high
    if (req.user.role === 'mayor') {
      priority = 'high';
      console.log('👑 Mayor report detected - Priority automatically set to HIGH');
    }

    // Parse location
    let parsedLocation = undefined;
    if (location) {
      try {
        const locationData = typeof location === 'string' ? JSON.parse(location) : location;
        // Only create location if coordinates are valid (2 numeric elements)
        if (locationData.coordinates && 
            Array.isArray(locationData.coordinates) && 
            locationData.coordinates.length === 2 &&
            typeof locationData.coordinates[0] === 'number' &&
            typeof locationData.coordinates[1] === 'number') {
          parsedLocation = {
            type: 'Point',
            coordinates: locationData.coordinates,
            address: locationData.address || ''
          };
        }
      } catch (error) {
        console.log('⚠️  Invalid location data, skipping location field');
      }
    }

    // Get the appropriate department model
    const DepartmentModel = getDepartmentModel(department);
    
    console.log(`📝 Creating report in ${department} collection`);

    // Create report in department-specific collection
    const reportData = {
      title,
      description,
      category,
      priority,
      images,
      reporter: req.user._id,
      assignedDepartment: department,
      ai_metadata: {
        suggestedCategory: aiResult.category,
        suggestedPriority: aiResult.priority,
        confidence: aiResult.confidence,
        reasoning: aiResult.reasoning
      }
    };

    // Only add location if it's properly defined
    if (parsedLocation) {
      reportData.location = parsedLocation;
    }

    const report = await DepartmentModel.create(reportData);

    const populatedReport = await DepartmentModel.findById(report._id).populate('reporter', 'name email');

    console.log(`✅ Report created in ${department} database`);

    res.status(201).json({
      success: true,
      message: 'Report created successfully',
      data: {
        report: populatedReport,
        department: department,
        collection: DepartmentModel.collection.name,
        aiClassification: {
          category: aiResult.category,
          priority: aiResult.priority,
          department: department,
          confidence: aiResult.confidence
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

// @route   GET /api/department-reports
// @desc    Get reports (Citizens: their own reports, Admins: department reports)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { status, priority, page = 1, limit = 10 } = req.query;
    
    if (req.user.role === 'admin') {
      // Admin: Get all reports from their department
      console.log(`📥 Admin ${req.user.name} (${req.user.department}) fetching reports`);

      const DepartmentModel = getDepartmentModel(req.user.department);
      
      const query = {};
      if (status) query.status = status;
      if (priority) query.priority = priority;

      console.log(`🔍 Querying ${DepartmentModel.collection.name} collection`);

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const reports = await DepartmentModel.find(query)
        .populate('reporter', 'name email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await DepartmentModel.countDocuments(query);

      console.log(`📊 Found ${reports.length} reports in ${req.user.department} collection`);

      res.json({
        success: true,
        data: {
          reports,
          department: req.user.department,
          collection: DepartmentModel.collection.name,
          pagination: {
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit))
          }
        }
      });
    } else {
      // Citizen: Get their own reports from all departments
      console.log(`👤 Citizen ${req.user.name} fetching their reports`);
      
      const allModels = getAllDepartmentModels();
      let allReports = [];
      
      // Query all department collections for this user's reports
      for (const [dept, Model] of Object.entries(allModels)) {
        const query = { reporter: req.user._id };
        if (status) query.status = status;
        if (priority) query.priority = priority;
        
        const reports = await Model.find(query)
          .populate('reporter', 'name email phone')
          .sort({ createdAt: -1 });
        
        // Add department info to each report
        const reportsWithDept = reports.map(report => ({
          ...report.toObject(),
          department: dept
        }));
        
        allReports = allReports.concat(reportsWithDept);
      }
      
      // Sort by creation date
      allReports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      // Apply pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const paginatedReports = allReports.slice(skip, skip + parseInt(limit));
      
      console.log(`📊 Found ${allReports.length} total reports for citizen`);

      res.json({
        success: true,
        data: {
          reports: paginatedReports,
          pagination: {
            total: allReports.length,
            page: parseInt(page),
            pages: Math.ceil(allReports.length / parseInt(limit))
          }
        }
      });
    }
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching reports',
      error: error.message
    });
  }
});

// @route   GET /api/department-reports/all
// @desc    Get ALL reports across all departments (for admins)
// @access  Private (Admin)
router.get('/all', protect, authorize('admin'), async (req, res) => {
  try {
    const { status, priority, page = 1, limit = 10 } = req.query;
    
    console.log(`📥 Admin ${req.user.name} fetching ALL reports across all departments`);
    
    const allModels = getAllDepartmentModels();
    let allReports = [];
    
    // Query all department collections
    for (const [dept, Model] of Object.entries(allModels)) {
      const query = {};
      if (status) query.status = status;
      if (priority) query.priority = priority;
      
      const reports = await Model.find(query)
        .populate('reporter', 'name email phone')
        .sort({ createdAt: -1 });
      
      // Add department info to each report
      const reportsWithDept = reports.map(report => ({
        ...report.toObject(),
        department: dept,
        collection: Model.collection.name
      }));
      
      allReports = allReports.concat(reportsWithDept);
    }
    
    // Sort by creation date
    allReports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Apply pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedReports = allReports.slice(skip, skip + parseInt(limit));
    
    console.log(`📊 Found ${allReports.length} total reports across all departments`);

    res.json({
      success: true,
      data: {
        reports: paginatedReports,
        pagination: {
          total: allReports.length,
          page: parseInt(page),
          pages: Math.ceil(allReports.length / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get all reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching all reports',
      error: error.message
    });
  }
});

// @route   GET /api/department-reports/stats
// @desc    Get statistics for all departments
// @access  Private (Admin)
router.get('/stats', protect, authorize('admin'), async (req, res) => {
  try {
    const allModels = getAllDepartmentModels();
    const stats = {};

    for (const [dept, Model] of Object.entries(allModels)) {
      const total = await Model.countDocuments();
      const open = await Model.countDocuments({ status: 'open' });
      const inProgress = await Model.countDocuments({ status: 'in-progress' });
      const resolved = await Model.countDocuments({ status: 'resolved' });
      
      stats[dept] = {
        collection: Model.collection.name,
        total,
        open,
        inProgress,
        resolved
      };
    }

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching stats',
      error: error.message
    });
  }
});

// @route   GET /api/department-reports/:id
// @desc    Get single report from department collection
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    let report = null;
    let foundCollection = null;

    if (req.user.role === 'admin') {
      // Admin: Search in their department only
      const DepartmentModel = getDepartmentModel(req.user.department);
      report = await DepartmentModel.findById(req.params.id).populate('reporter', 'name email phone');
      foundCollection = DepartmentModel.collection.name;
    } else if (req.user.role === 'mayor') {
      // Mayor: Search across all departments (full access)
      const allModels = getAllDepartmentModels();
      
      for (const [dept, Model] of Object.entries(allModels)) {
        try {
          const foundReport = await Model.findById(req.params.id).populate('reporter', 'name email phone');
          if (foundReport) {
            report = foundReport;
            foundCollection = Model.collection.name;
            break;
          }
        } catch (err) {
          // Continue searching in other collections
          continue;
        }
      }
    } else {
      // Citizen: Search across all departments
      const allModels = getAllDepartmentModels();
      
      for (const [dept, Model] of Object.entries(allModels)) {
        try {
          const foundReport = await Model.findById(req.params.id).populate('reporter', 'name email phone');
          if (foundReport) {
            report = foundReport;
            foundCollection = Model.collection.name;
            break;
          }
        } catch (err) {
          // Continue searching in other collections
          continue;
        }
      }
    }

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Citizens can only view their own reports
    // Mayor and Admin can view all reports
    if (req.user.role === 'citizen' && report.reporter._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this report'
      });
    }

    res.json({
      success: true,
      data: { 
        report,
        collection: foundCollection
      }
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

// @route   PATCH /api/department-reports/:id
// @desc    Update report in department collection
// @access  Private (Admin)
router.patch('/:id', protect, authorize('admin'), [
  body('status').optional().isIn(['open', 'in-progress', 'resolved', 'closed']),
  body('adminNotes').optional().trim(),
  body('priority').optional().isIn(['high', 'medium', 'low'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const DepartmentModel = getDepartmentModel(req.user.department);
    const report = await DepartmentModel.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found in your department'
      });
    }

    const { status, adminNotes, priority } = req.body;

    if (status) {
      report.status = status;
      if (status === 'resolved' && !report.resolvedAt) {
        report.resolvedAt = new Date();
      }
    }
    if (adminNotes) report.adminNotes = adminNotes;
    if (priority) report.priority = priority;

    await report.save();

    const updatedReport = await DepartmentModel.findById(report._id).populate('reporter', 'name email');

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

// @route   DELETE /api/department-reports/my-report/:id
// @desc    Delete own report (for citizens)
// @access  Private (Citizen)
router.delete('/my-report/:id', protect, async (req, res) => {
  try {
    // Search in all department collections for the report
    const allModels = getAllDepartmentModels();
    let report = null;
    let foundModel = null;

    for (const [deptName, Model] of Object.entries(allModels)) {
      report = await Model.findById(req.params.id);
      if (report) {
        foundModel = Model;
        break;
      }
    }

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Check if the report belongs to the user
    const reporterId = report.reporter || report.userId;
    if (!reporterId || reporterId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own reports'
      });
    }

    await report.deleteOne();

    res.json({
      success: true,
      message: 'Report deleted successfully'
    });
  } catch (error) {
    console.error('Delete own report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting report',
      error: error.message
    });
  }
});

// @route   DELETE /api/department-reports/:id
// @desc    Delete report from department collection
// @access  Private (Citizens can delete their own, Admins can delete any in their dept)
router.delete('/:id', protect, async (req, res) => {
  try {
    const allModels = getAllDepartmentModels();
    let report = null;
    let foundModel = null;

    // Search all department collections for the report
    for (const [dept, Model] of Object.entries(allModels)) {
      const foundReport = await Model.findById(req.params.id);
      if (foundReport) {
        report = foundReport;
        foundModel = Model;
        break;
      }
    }

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Check authorization
    const isOwner = report.reporter.toString() === req.user._id.toString();
    const isAuthorizedAdmin = req.user.role === 'admin' && report.assignedDepartment === req.user.department;

    if (!isOwner && !isAuthorizedAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this report'
      });
    }

    await report.deleteOne();

    console.log(`🗑️ Report ${req.params.id} deleted by ${req.user.name}`);

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
