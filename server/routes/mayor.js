import express from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Review from '../models/Review.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/mayor/pending-admins
// @desc    Get all pending admin requests
// @access  Private (Mayor only)
router.get('/pending-admins', protect, authorize('mayor'), async (req, res) => {
  try {
    const pendingAdmins = await User.find({
      role: 'admin',
      isApproved: false
    }).select('-password').sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        admins: pendingAdmins,
        count: pendingAdmins.length
      }
    });
  } catch (error) {
    console.error('Error fetching pending admins:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/mayor/all-admins
// @desc    Get all admins (approved and pending)
// @access  Private (Mayor only)
router.get('/all-admins', protect, authorize('mayor'), async (req, res) => {
  try {
    const admins = await User.find({
      role: 'admin'
    }).select('-password').sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        admins,
        count: admins.length,
        approved: admins.filter(a => a.isApproved).length,
        pending: admins.filter(a => !a.isApproved).length
      }
    });
  } catch (error) {
    console.error('Error fetching admins:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PATCH /api/mayor/approve-admin/:id
// @desc    Approve an admin
// @access  Private (Mayor only)
router.patch('/approve-admin/:id', protect, authorize('mayor'), async (req, res) => {
  try {
    const admin = await User.findById(req.params.id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    if (admin.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'User is not an admin'
      });
    }

    admin.isApproved = true;
    await admin.save();

    res.json({
      success: true,
      message: 'Admin approved successfully',
      data: {
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          department: admin.department,
          isApproved: admin.isApproved
        }
      }
    });
  } catch (error) {
    console.error('Error approving admin:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   DELETE /api/mayor/remove-admin/:id
// @desc    Remove/delete an admin
// @access  Private (Mayor only)
router.delete('/remove-admin/:id', protect, authorize('mayor'), async (req, res) => {
  try {
    const admin = await User.findById(req.params.id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    if (admin.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'User is not an admin'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Admin removed successfully'
    });
  } catch (error) {
    console.error('Error removing admin:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/mayor/stats
// @desc    Get mayor dashboard statistics
// @access  Private (Mayor only)
router.get('/stats', protect, authorize('mayor'), async (req, res) => {
  try {
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const approvedAdmins = await User.countDocuments({ role: 'admin', isApproved: true });
    const pendingAdmins = await User.countDocuments({ role: 'admin', isApproved: false });
    const totalCitizens = await User.countDocuments({ role: 'citizen' });

    // Get department-wise admin count
    const departmentStats = await User.aggregate([
      { $match: { role: 'admin', isApproved: true } },
      { $group: { _id: '$department', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        totalAdmins,
        approvedAdmins,
        pendingAdmins,
        totalCitizens,
        departmentStats
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/mayor/all-reports
// @desc    Get all reports from all departments
// @access  Private (Mayor only)
router.get('/all-reports', protect, authorize('mayor'), async (req, res) => {
  try {
    const { status, priority, department, page = 1, limit = 50 } = req.query;
    
    // Define all department collections
    const collections = [
      'roadservicereports',
      'watermanagementreports',
      'electricalservicereports',
      'hospitalemergencyreports',
      'generalreports'
    ];

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    let allReports = [];

    // Query each collection
    for (const collectionName of collections) {
      // Only query if department filter matches or no department filter
      if (department) {
        const deptMap = {
          'road_service': 'roadservicereports',
          'water_management': 'watermanagementreports',
          'electrical_service': 'electricalservicereports',
          'hospital_emergency': 'hospitalemergencyreports',
          'general': 'generalreports'
        };
        if (deptMap[department] !== collectionName) continue;
      }

      try {
        const collection = mongoose.connection.collection(collectionName);
        const reports = await collection.find(filter).toArray();
        
        // Add department info to each report
        const deptName = collectionName.replace('reports', '').replace(/([A-Z])/g, '_$1').toLowerCase();
        const reportsWithDept = reports.map(report => ({
          ...report,
          department: deptName,
          collectionName
        }));
        
        allReports = allReports.concat(reportsWithDept);
      } catch (err) {
        console.log(`Collection ${collectionName} not found or error:`, err.message);
      }
    }

    // Sort by creation date (newest first)
    allReports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedReports = allReports.slice(startIndex, endIndex);

    // Get statistics
    const stats = {
      total: allReports.length,
      open: allReports.filter(r => r.status === 'open').length,
      inProgress: allReports.filter(r => r.status === 'in-progress').length,
      resolved: allReports.filter(r => r.status === 'resolved').length,
      byDepartment: {}
    };

    collections.forEach(col => {
      const deptReports = allReports.filter(r => r.collectionName === col);
      const deptName = col.replace('reports', '');
      stats.byDepartment[deptName] = deptReports.length;
    });

    res.json({
      success: true,
      data: {
        reports: paginatedReports,
        stats,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(allReports.length / limit),
          totalReports: allReports.length,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching all reports:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/mayor/reports-stats
// @desc    Get detailed statistics of all reports
// @access  Private (Mayor only)
router.get('/reports-stats', protect, authorize('mayor'), async (req, res) => {
  try {
    const collections = [
      { name: 'roadservicereports', dept: 'Road Service' },
      { name: 'watermanagementreports', dept: 'Water Management' },
      { name: 'electricalservicereports', dept: 'Electrical Service' },
      { name: 'hospitalemergencyreports', dept: 'Hospital Emergency' },
      { name: 'generalreports', dept: 'General' }
    ];

    const departmentStats = [];
    let totalReports = 0;
    let totalOpen = 0;
    let totalInProgress = 0;
    let totalResolved = 0;

    for (const col of collections) {
      try {
        const collection = mongoose.connection.collection(col.name);
        const total = await collection.countDocuments();
        const open = await collection.countDocuments({ status: 'open' });
        const inProgress = await collection.countDocuments({ status: 'in-progress' });
        const resolved = await collection.countDocuments({ status: 'resolved' });

        departmentStats.push({
          department: col.dept,
          total,
          open,
          inProgress,
          resolved
        });

        totalReports += total;
        totalOpen += open;
        totalInProgress += inProgress;
        totalResolved += resolved;
      } catch (err) {
        console.log(`Collection ${col.name} not found:`, err.message);
      }
    }

    res.json({
      success: true,
      data: {
        overall: {
          total: totalReports,
          open: totalOpen,
          inProgress: totalInProgress,
          resolved: totalResolved
        },
        byDepartment: departmentStats
      }
    });
  } catch (error) {
    console.error('Error fetching reports stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PATCH /api/mayor/update-report/:collectionName/:id
// @desc    Update a report (status, notes, etc.)
// @access  Private (Mayor only)
router.patch('/update-report/:collectionName/:id', protect, authorize('mayor'), async (req, res) => {
  try {
    const { collectionName, id } = req.params;
    const { status, adminNotes, priority } = req.body;

    // Validate collection name
    const validCollections = [
      'roadservicereports',
      'watermanagementreports',
      'electricalservicereports',
      'hospitalemergencyreports',
      'generalreports'
    ];

    if (!validCollections.includes(collectionName)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid collection name'
      });
    }

    const collection = mongoose.connection.collection(collectionName);
    
    // Build update object
    const updateData = {
      updatedAt: new Date()
    };
    
    if (status) updateData.status = status;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
    if (priority) updateData.priority = priority;

    const result = await collection.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    res.json({
      success: true,
      message: 'Report updated successfully',
      data: {
        report: result
      }
    });
  } catch (error) {
    console.error('Error updating report:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   DELETE /api/mayor/delete-report/:collectionName/:id
// @desc    Delete a report
// @access  Private (Mayor only)
router.delete('/delete-report/:collectionName/:id', protect, authorize('mayor'), async (req, res) => {
  try {
    const { collectionName, id } = req.params;

    // Validate collection name
    const validCollections = [
      'roadservicereports',
      'watermanagementreports',
      'electricalservicereports',
      'hospitalemergencyreports',
      'generalreports'
    ];

    if (!validCollections.includes(collectionName)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid collection name'
      });
    }

    const collection = mongoose.connection.collection(collectionName);
    
    const result = await collection.deleteOne({
      _id: new mongoose.Types.ObjectId(id)
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    res.json({
      success: true,
      message: 'Report deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/mayor/recent-feedback
// @desc    Get count of recent feedback/reviews (last 24 hours)
// @access  Private (Mayor only)
router.get('/recent-feedback', protect, authorize('mayor'), async (req, res) => {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const recentReviews = await Review.countDocuments({
      createdAt: { $gte: twentyFourHoursAgo }
    });

    // Get negative reviews (3 stars or below)
    const negativeReviews = await Review.countDocuments({
      createdAt: { $gte: twentyFourHoursAgo },
      rating: { $lte: 3 }
    });

    // Get positive reviews (4-5 stars)
    const positiveReviews = await Review.countDocuments({
      createdAt: { $gte: twentyFourHoursAgo },
      rating: { $gte: 4 }
    });

    const allReviews = await Review.find({
      createdAt: { $gte: twentyFourHoursAgo }
    }).sort({ createdAt: -1 }).limit(10);

    // Get negative reviews with details
    const negativeReviewsDetails = await Review.find({
      createdAt: { $gte: twentyFourHoursAgo },
      rating: { $lte: 3 }
    }).sort({ createdAt: -1 }).limit(10);

    // Get average rating
    const avgRating = allReviews.length > 0 
      ? (allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(1)
      : 0;

    res.json({
      success: true,
      data: {
        recentCount: recentReviews,
        negativeCount: negativeReviews,
        positiveCount: positiveReviews,
        reviews: allReviews,
        negativeReviews: negativeReviewsDetails,
        averageRating: parseFloat(avgRating)
      }
    });
  } catch (error) {
    console.error('Error fetching recent feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/mayor/feedback-stats
// @desc    Get overall feedback statistics
// @access  Private (Mayor only)
router.get('/feedback-stats', protect, authorize('mayor'), async (req, res) => {
  try {
    const totalReviews = await Review.countDocuments();
    
    // Get reviews from last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentReviews = await Review.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    // Get average rating
    const ratingStats = await Review.aggregate([
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    // Get rating distribution
    const ratingDistribution = await Review.aggregate([
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    // Get department-wise feedback
    const departmentFeedback = await Review.aggregate([
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 },
          avgRating: { $avg: '$rating' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        totalReviews,
        recentReviews,
        averageRating: ratingStats[0]?.avgRating?.toFixed(1) || 0,
        ratingDistribution,
        departmentFeedback
      }
    });
  } catch (error) {
    console.error('Error fetching feedback stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

export default router;
