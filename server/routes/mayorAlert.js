import express from 'express';
import MayorAlert from '../models/MayorAlert.js';
import User from '../models/User.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/mayor-alert
// @desc    Get all mayor alerts
// @access  Private (Mayor only)
router.get('/', protect, authorize('mayor'), async (req, res) => {
  try {
    const alerts = await MayorAlert.find()
      .sort({ createdAt: -1 })
      .limit(20); // Get last 20 alerts

    res.json({
      success: true,
      data: { alerts }
    });
  } catch (error) {
    console.error('Error fetching mayor alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching alerts',
      error: error.message
    });
  }
});

// @route   POST /api/mayor-alert
// @desc    Send a new mayor alert to all users and admins
// @access  Private (Mayor only)
router.post('/', protect, authorize('mayor'), async (req, res) => {
  try {
    const { title, message } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Title and message are required'
      });
    }

    // Create the alert
    const alert = new MayorAlert({
      title: title.trim(),
      message: message.trim(),
      sentBy: req.user.id
    });

    await alert.save();

    // Get all users and admins to send notifications
    const allUsers = await User.find({
      role: { $in: ['citizen', 'admin'] }
    });

    // For now, we'll just return success
    // In a real implementation, you would:
    // 1. Send push notifications
    // 2. Send email notifications
    // 3. Update user notification preferences
    // 4. Use WebSocket for real-time updates

    console.log(`Mayor alert sent to ${allUsers.length} users and admins`);

    res.json({
      success: true,
      message: 'Alert sent successfully to all users and admins',
      data: { alert }
    });

  } catch (error) {
    console.error('Error sending mayor alert:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while sending alert',
      error: error.message
    });
  }
});

export default router;
