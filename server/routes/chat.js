import express from 'express';
import Chat from '../models/Chat.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/chat/start
// @desc    Start a new chat or get existing chat with department
// @access  Private (Citizen/Admin/Mayor)
router.post('/start', protect, async (req, res) => {
  try {
    const { department, reportId, reportTitle } = req.body;

    if (!department) {
      return res.status(400).json({
        success: false,
        message: 'Department is required'
      });
    }

    // Prevent admins from chatting with their own department
    if (req.user.role === 'admin' && req.user.department === department) {
      return res.status(400).json({
        success: false,
        message: 'You cannot start a chat with your own department'
      });
    }

    // Prevent mayor from chatting with mayor_office
    if (req.user.role === 'mayor' && department === 'mayor_office') {
      return res.status(400).json({
        success: false,
        message: 'You cannot start a chat with your own office'
      });
    }

    // Check if chat already exists
    let chat = await Chat.findOne({
      userId: req.user._id,
      department,
      status: 'active'
    });

    if (!chat) {
      // Create new chat
      chat = await Chat.create({
        userId: req.user._id,
        userName: req.user.name,
        userRole: req.user.role,
        userDepartment: req.user.department || null,
        department,
        reportId,
        reportTitle,
        messages: [],
        status: 'active'
      });
    }

    res.json({
      success: true,
      data: { chat }
    });
  } catch (error) {
    console.error('Start chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   POST /api/chat/:chatId/message
// @desc    Send a message in a chat
// @access  Private
router.post('/:chatId/message', protect, async (req, res) => {
  try {
    const { message } = req.body;
    const { chatId } = req.params;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Verify access: user must be the chat owner OR admin of the department OR mayor
    const isOwner = chat.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin' && req.user.department === chat.department;
    const isMayor = req.user.role === 'mayor'; // Mayor has access to all chats

    if (!isOwner && !isAdmin && !isMayor) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this chat'
      });
    }

    // Add message
    const newMessage = {
      senderId: req.user._id,
      senderName: req.user.name,
      senderRole: req.user.role,
      message: message.trim(),
      timestamp: new Date(),
      read: false
    };

    chat.messages.push(newMessage);
    chat.lastMessage = message.trim();
    chat.lastMessageTime = new Date();

    // Increment unread count if sender is not the user
    if (!isOwner) {
      chat.unreadCount += 1;
    }

    await chat.save();

    res.json({
      success: true,
      data: { chat }
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/chat/my-chats
// @desc    Get all chats for current user (citizen view)
// @access  Private (Citizen)
router.get('/my-chats', protect, async (req, res) => {
  try {
    const chats = await Chat.find({
      userId: req.user._id
    })
    .sort({ lastMessageTime: -1 })
    .limit(20)
    .select('-messages'); // Don't include messages in list view

    res.json({
      success: true,
      data: { chats }
    });
  } catch (error) {
    console.error('Get my chats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/chat/department-chats
// @desc    Get all chats for admin's department or all chats for mayor
// @access  Private (Admin/Mayor)
router.get('/department-chats', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'mayor') {
      return res.status(403).json({
        success: false,
        message: 'Only admins and mayors can access department chats'
      });
    }

    // Mayor sees chats directed to mayor_office OR started by mayor
    // Admin sees only their department chats
    let query;
    if (req.user.role === 'mayor') {
      query = {
        $or: [
          { department: 'mayor_office', status: 'active' }, // Chats TO mayor
          { userId: req.user._id, status: 'active' }        // Chats FROM mayor
        ]
      };
    } else {
      query = { department: req.user.department, status: 'active' };
    }

    // Limit to 50 most recent chats for performance
    const chats = await Chat.find(query)
      .sort({ lastMessageTime: -1 })
      .limit(50)
      .select('-messages'); // Don't include messages in list view

    res.json({
      success: true,
      data: { chats }
    });
  } catch (error) {
    console.error('Get department chats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/chat/:chatId
// @desc    Get a specific chat with all messages
// @access  Private
router.get('/:chatId', protect, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Verify access
    const isOwner = chat.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin' && req.user.department === chat.department;
    const isMayor = req.user.role === 'mayor'; // Mayor has access to all chats

    if (!isOwner && !isAdmin && !isMayor) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this chat'
      });
    }

    // Mark messages as read if user is viewing
    if (isOwner) {
      chat.messages.forEach(msg => {
        if (msg.senderRole === 'admin') {
          msg.read = true;
        }
      });
      chat.unreadCount = 0;
      await chat.save();
    }

    res.json({
      success: true,
      data: { chat }
    });
  } catch (error) {
    console.error('Get chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   DELETE /api/chat/:chatId/message/:messageIndex
// @desc    Delete a specific message
// @access  Private
router.delete('/:chatId/message/:messageIndex', protect, async (req, res) => {
  try {
    const { chatId, messageIndex } = req.params;
    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    const msgIndex = parseInt(messageIndex);
    if (isNaN(msgIndex) || msgIndex < 0 || msgIndex >= chat.messages.length) {
      return res.status(400).json({
        success: false,
        message: 'Invalid message index'
      });
    }

    const message = chat.messages[msgIndex];
    
    // Only the message sender can delete their own message
    if (message.senderId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own messages'
      });
    }

    // Check if message is within 2 minutes of being sent
    const messageTime = new Date(message.timestamp);
    const currentTime = new Date();
    const timeDifferenceInMinutes = (currentTime - messageTime) / (1000 * 60);
    
    if (timeDifferenceInMinutes > 2) {
      return res.status(403).json({
        success: false,
        message: 'Messages can only be deleted within 2 minutes of sending'
      });
    }

    // Remove the message
    chat.messages.splice(msgIndex, 1);
    await chat.save();

    res.json({
      success: true,
      message: 'Message deleted successfully',
      data: { chat }
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PATCH /api/chat/:chatId/close
// @desc    Close a chat
// @access  Private
router.patch('/:chatId/close', protect, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Verify access
    const isOwner = chat.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin' && req.user.department === chat.department;

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this chat'
      });
    }

    chat.status = 'closed';
    await chat.save();

    res.json({
      success: true,
      message: 'Chat closed successfully',
      data: { chat }
    });
  } catch (error) {
    console.error('Close chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

export default router;
