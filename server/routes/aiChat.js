import express from 'express';
import { getChatResponse } from '../services/aiChatAssistant.js';
import { getChatResponseEnhanced } from '../services/aiChatAssistantEnhanced.js';
import { getChatResponseWithUserData } from '../services/aiChatWithUserData.js';
import { optionalAuth } from '../middleware/optionalAuth.js';

const router = express.Router();

// @route   POST /api/chat/ai-assistant
// @desc    Get AI assistant response with user data access
// @access  Public (but enhanced with user data if logged in)
router.post('/ai-assistant', optionalAuth, async (req, res) => {
  try {
    const { message, conversationHistory, useEnhanced = true } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    // If user is logged in, use the enhanced version with user data
    let result;
    if (req.user) {
      result = await getChatResponseWithUserData(
        message.trim(), 
        req.user._id.toString(), 
        conversationHistory || []
      );
    } else {
      // Use regular AI for non-logged-in users
      result = await getChatResponse(message.trim(), conversationHistory || []);
    }

    res.json({
      success: true,
      data: {
        response: result.response,
        confidence: result.confidence,
        source: result.source,
        context: result.context,
        suggestions: result.suggestions || [],
        tokensUsed: result.tokensUsed,
        userData: result.userData || null
      }
    });
  } catch (error) {
    console.error('AI Chat API Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get AI response',
      error: error.message
    });
  }
});

export default router;
