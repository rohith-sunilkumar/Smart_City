import express from 'express';
import User from '../models/User.js';
import { getAllDepartmentModels } from '../models/DepartmentReport.js';
import Feedback from '../models/Feedback.js';
import MayorAlert from '../models/MayorAlert.js';
import { protect as auth } from '../middleware/auth.js';

const router = express.Router();

// Helper function to query across all department models
const queryAllDepartments = async (query) => {
  const departmentModels = getAllDepartmentModels();
  const results = await Promise.all(
    Object.values(departmentModels).map(model => model.find(query))
  );
  return results.flat();
};

// Helper function to count across all department models
const countAllDepartments = async (query) => {
  const departmentModels = getAllDepartmentModels();
  const counts = await Promise.all(
    Object.values(departmentModels).map(model => model.countDocuments(query))
  );
  return counts.reduce((sum, count) => sum + count, 0);
};

// @route   GET /api/notifications
// @desc    Get notifications for current user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    let notifications = {
      total: 0,
      items: []
    };

    if (user.role === 'citizen') {
      // Citizen notifications
      const openReports = await countAllDepartments({
        reporter: userId,
        status: { $in: ['open', 'in-progress'] }
      });

      const recentReports = await queryAllDepartments({
        reporter: userId,
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
      });
      recentReports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const limitedRecentReports = recentReports.slice(0, 5);

      const resolvedReports = await queryAllDepartments({
        reporter: userId,
        status: 'resolved',
        updatedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
      });
      resolvedReports.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      const limitedResolvedReports = resolvedReports.slice(0, 3);

      // Get recent mayor alerts (last 7 days)
      const recentMayorAlerts = await MayorAlert.find({
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      }).sort({ createdAt: -1 }).limit(3);

      notifications.total = openReports + limitedRecentReports.length + limitedResolvedReports.length + recentMayorAlerts.length;

      // Add open reports notification
      if (openReports > 0) {
        notifications.items.push({
          id: 'open-reports',
          type: 'info',
          title: 'Open Reports',
          message: `You have ${openReports} report${openReports > 1 ? 's' : ''} that are still being processed`,
          count: openReports,
          link: '/my-reports?status=open',
          icon: 'FileText'
        });
      }

      // Add recent reports
      limitedRecentReports.forEach(report => {
        notifications.items.push({
          id: `recent-${report._id}`,
          type: 'success',
          title: 'Report Submitted',
          message: `Your report "${report.title}" has been submitted successfully`,
          count: 1,
          link: `/reports/${report._id}`,
          icon: 'CheckCircle',
          timestamp: report.createdAt
        });
      });

      // Add resolved reports
      limitedResolvedReports.forEach(report => {
        notifications.items.push({
          id: `resolved-${report._id}`,
          type: 'success',
          title: 'Report Resolved',
          message: `Your report "${report.title}" has been resolved`,
          count: 1,
          link: `/reports/${report._id}`,
          icon: 'CheckCircle',
          timestamp: report.updatedAt
        });
      });

      // Add mayor alerts
      recentMayorAlerts.forEach(alert => {
        notifications.items.push({
          id: `mayor-alert-${alert._id}`,
          type: 'error',
          title: 'Mayor Alert',
          message: alert.title,
          count: 1,
          link: '/dashboard',
          icon: 'AlertCircle',
          timestamp: alert.createdAt,
          details: {
            title: alert.title,
            body: alert.message
          }
        });
      });

    } else if (user.role === 'admin') {
      // Admin notifications - get the specific department model
      const departmentModels = getAllDepartmentModels();
      const departmentModel = departmentModels[user.department] || departmentModels.general;

      const openReports = await departmentModel.countDocuments({
        status: { $in: ['open', 'in-progress'] }
      });

      const newReports = await departmentModel.countDocuments({
        status: 'open',
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
      });

      const highPriorityReports = await departmentModel.countDocuments({
        priority: 'high',
        status: { $in: ['open', 'in-progress'] }
      });

      const recentReports = await departmentModel.find({
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }).sort({ createdAt: -1 }).limit(5);

      // Get recent mayor alerts (last 7 days)
      const recentMayorAlerts = await MayorAlert.find({
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      }).sort({ createdAt: -1 }).limit(3);

      notifications.total = openReports + newReports + highPriorityReports + recentMayorAlerts.length;

      // Add open reports notification
      if (openReports > 0) {
        notifications.items.push({
          id: 'open-reports',
          type: 'warning',
          title: 'Open Reports',
          message: `You have ${openReports} report${openReports > 1 ? 's' : ''} in your department`,
          count: openReports,
          link: '/admin/reports?status=open',
          icon: 'FileText'
        });
      }

      // Add new reports notification
      if (newReports > 0) {
        notifications.items.push({
          id: 'new-reports',
          type: 'info',
          title: 'New Reports',
          message: `${newReports} new report${newReports > 1 ? 's' : ''} assigned to your department in the last 24 hours`,
          count: newReports,
          link: '/admin/reports?status=open&sort=newest',
          icon: 'PlusCircle'
        });
      }

      // Add high priority reports notification
      if (highPriorityReports > 0) {
        notifications.items.push({
          id: 'high-priority',
          type: 'error',
          title: 'High Priority Reports',
          message: `${highPriorityReports} high priority report${highPriorityReports > 1 ? 's' : ''} need immediate attention`,
          count: highPriorityReports,
          link: '/admin/reports?priority=high',
          icon: 'AlertTriangle'
        });
      }

      // Add recent reports
      recentReports.forEach(report => {
        notifications.items.push({
          id: `recent-${report._id}`,
          type: 'info',
          title: 'New Report',
          message: `New report: "${report.title}" assigned to your department`,
          count: 1,
          link: `/admin/reports/${report._id}`,
          icon: 'FileText',
          timestamp: report.createdAt
        });
      });

      // Add mayor alerts
      recentMayorAlerts.forEach(alert => {
        notifications.items.push({
          id: `mayor-alert-${alert._id}`,
          type: 'error',
          title: 'Mayor Alert',
          message: alert.title,
          count: 1,
          link: '/admin/dashboard',
          icon: 'AlertCircle',
          timestamp: alert.createdAt,
          details: {
            title: alert.title,
            body: alert.message
          }
        });
      });

    } else if (user.role === 'mayor') {
      // Mayor notifications (existing logic)
      const pendingAdmins = await User.countDocuments({
        role: 'admin',
        isApproved: false
      });

      const openReports = await countAllDepartments({
        status: { $in: ['open', 'in-progress'] }
      });

      const recentFeedback = await Feedback.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      });

      const negativeFeedback = await Feedback.find({
        rating: { $lte: 3 },
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      }).populate('reportId', 'title').limit(5);

      notifications.total = pendingAdmins + openReports + recentFeedback + negativeFeedback.length;

      // Add pending admins notification
      if (pendingAdmins > 0) {
        notifications.items.push({
          id: 'pending-admins',
          type: 'warning',
          title: 'Pending Admin Approvals',
          message: `${pendingAdmins} admin${pendingAdmins > 1 ? 's' : ''} waiting for approval`,
          count: pendingAdmins,
          link: '/mayor/dashboard?tab=pending',
          icon: 'UserCheck'
        });
      }

      // Add open reports notification
      if (openReports > 0) {
        notifications.items.push({
          id: 'open-reports',
          type: 'error',
          title: 'Open Reports',
          message: `${openReports} report${openReports > 1 ? 's' : ''} need attention`,
          count: openReports,
          link: '/mayor/dashboard?tab=reports',
          icon: 'AlertCircle'
        });
      }

      // Add recent feedback notification
      if (recentFeedback > 0) {
        notifications.items.push({
          id: 'recent-feedback',
          type: 'info',
          title: 'New Feedback',
          message: `${recentFeedback} new review${recentFeedback > 1 ? 's' : ''} in last 24 hours`,
          count: recentFeedback,
          link: '/mayor/dashboard?tab=feedback',
          icon: 'Star'
        });
      }

      // Add negative feedback notification
      if (negativeFeedback.length > 0) {
        notifications.items.push({
          id: 'negative-feedback',
          type: 'error',
          title: 'Negative Feedback Alert',
          message: `${negativeFeedback.length} review${negativeFeedback.length > 1 ? 's' : ''} with 3 stars or below need attention`,
          count: negativeFeedback.length,
          link: '/mayor/dashboard?tab=feedback',
          icon: 'ThumbsDown',
          details: negativeFeedback.map(feedback => ({
            reportTitle: feedback.reportId?.title || 'Unknown Report',
            rating: feedback.rating,
            userName: feedback.userName
          }))
        });
      }
    }

    // Sort notifications by timestamp (newest first)
    notifications.items.sort((a, b) => {
      if (a.timestamp && b.timestamp) {
        return new Date(b.timestamp) - new Date(a.timestamp);
      }
      return 0;
    });

    res.json({
      success: true,
      data: notifications
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching notifications',
      error: error.message
    });
  }
});

// @route   POST /api/notifications/mark-read
// @desc    Mark notification as read
// @access  Private
router.post('/mark-read', auth, async (req, res) => {
  try {
    const { notificationId } = req.body;
    
    // For now, we'll just return success since we're not storing read status
    // In a real implementation, you'd store this in a database
    res.json({
      success: true,
      message: 'Notification marked as read'
    });

  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while marking notification as read',
      error: error.message
    });
  }
});

export default router;
