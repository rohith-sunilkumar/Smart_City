import express from 'express';
import Review from '../models/Review.js';
import { protect } from '../middleware/auth.js';
import { getAllDepartmentModels } from '../models/DepartmentReport.js';

const router = express.Router();

// @route   GET /api/reviews/public
// @desc    Get all public reviews for homepage
// @access  Public
router.get('/public', async (req, res) => {
  try {
    const { department, rating, limit = 10, page = 1 } = req.query;
    
    const filter = { isPublic: true };
    if (department) filter.department = department;
    if (rating) filter.rating = { $gte: parseInt(rating) };

    console.log('🔍 Fetching public reviews with filter:', filter);

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reviews = await Review.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('userId', 'name');

    console.log(`📊 Found ${reviews.length} public reviews`);

    const total = await Review.countDocuments(filter);
    console.log(`📈 Total public reviews in database: ${total}`);

    // Calculate statistics
    const stats = await Review.aggregate([
      { $match: { isPublic: true } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          excellent: {
            $sum: { $cond: [{ $eq: ['$experience', 'excellent'] }, 1, 0] }
          },
          good: {
            $sum: { $cond: [{ $eq: ['$experience', 'good'] }, 1, 0] }
          },
          average: {
            $sum: { $cond: [{ $eq: ['$experience', 'average'] }, 1, 0] }
          },
          poor: {
            $sum: { $cond: [{ $eq: ['$experience', 'poor'] }, 1, 0] }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        reviews,
        stats: stats[0] || { averageRating: 0, totalReviews: 0 },
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get public reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   POST /api/reviews/:reportId
// @desc    Create a review for a resolved report
// @access  Private
router.post('/:reportId', protect, async (req, res) => {
  try {
    const { reportId } = req.params;
    const { rating, comment, experience, resolutionTime, wouldRecommend, isPublic } = req.body;

    // Validate required fields
    if (!rating || !comment || !experience) {
      return res.status(400).json({
        success: false,
        message: 'Rating, comment, and experience are required'
      });
    }

    // Find the report in department collections
    const allModels = getAllDepartmentModels();
    let report = null;
    let department = null;

    for (const [deptName, Model] of Object.entries(allModels)) {
      report = await Model.findById(reportId);
      if (report) {
        department = deptName;
        break;
      }
    }

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Check if user is the reporter
    const reporterId = report.reporter || report.userId;
    if (reporterId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only review your own reports'
      });
    }

    // Check if report is resolved
    if (report.status !== 'resolved') {
      return res.status(400).json({
        success: false,
        message: 'You can only review resolved reports'
      });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ reportId, userId: req.user._id });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this report'
      });
    }

    // Create review
    console.log('📝 Creating review with data:', {
      reportId,
      userId: req.user._id,
      userName: req.user.name,
      department,
      reportTitle: report.title,
      rating,
      comment: comment.substring(0, 50) + '...',
      experience,
      resolutionTime,
      wouldRecommend,
      isPublic
    });

    const review = await Review.create({
      reportId,
      userId: req.user._id,
      userName: req.user.name,
      department,
      reportTitle: report.title,
      rating,
      comment,
      experience,
      resolutionTime,
      wouldRecommend: wouldRecommend !== false,
      isPublic: isPublic !== false
    });

    console.log('✅ Review created successfully:', {
      _id: review._id,
      isPublic: review.isPublic,
      department: review.department,
      rating: review.rating
    });

    await review.populate('userId', 'name');

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: { review }
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/reviews/my-reviews
// @desc    Get user's own reviews
// @access  Private
router.get('/my-reviews', protect, async (req, res) => {
  try {
    const reviews = await Review.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { reviews }
    });
  } catch (error) {
    console.error('Get my reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/reviews/report/:reportId
// @desc    Check if user can review a report
// @access  Private
router.get('/report/:reportId/can-review', protect, async (req, res) => {
  try {
    const { reportId } = req.params;

    // Find the report
    const allModels = getAllDepartmentModels();
    let report = null;

    for (const [deptName, Model] of Object.entries(allModels)) {
      report = await Model.findById(reportId);
      if (report) break;
    }

    if (!report) {
      return res.json({
        success: true,
        data: { canReview: false, reason: 'Report not found' }
      });
    }

    // Check if user is the reporter
    const reporterId = report.reporter || report.userId;
    if (reporterId.toString() !== req.user._id.toString()) {
      return res.json({
        success: true,
        data: { canReview: false, reason: 'Not your report' }
      });
    }

    // Check if report is resolved
    if (report.status !== 'resolved') {
      return res.json({
        success: true,
        data: { canReview: false, reason: 'Report not resolved yet' }
      });
    }

    // Check if already reviewed
    const existingReview = await Review.findOne({ reportId, userId: req.user._id });
    if (existingReview) {
      return res.json({
        success: true,
        data: { canReview: false, reason: 'Already reviewed', review: existingReview }
      });
    }

    res.json({
      success: true,
      data: { canReview: true, report }
    });
  } catch (error) {
    console.error('Check can review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   DELETE /api/reviews/:reviewId
// @desc    Delete own review
// @access  Private
router.delete('/:reviewId', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    if (review.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own reviews'
      });
    }

    await review.deleteOne();

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

export default router;
