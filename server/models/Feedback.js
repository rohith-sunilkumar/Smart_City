import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  reportId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report',
    required: true,
    index: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  senderRole: {
    type: String,
    enum: ['citizen', 'admin', 'mayor'],
    required: true
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: 2000
  },
  isRead: {
    type: Boolean,
    default: false
  },
  attachments: [{
    url: String,
    publicId: String,
    type: {
      type: String,
      enum: ['image', 'document']
    }
  }]
}, {
  timestamps: true
});

// Index for efficient queries
feedbackSchema.index({ reportId: 1, createdAt: -1 });
feedbackSchema.index({ sender: 1, createdAt: -1 });

const Feedback = mongoose.model('Feedback', feedbackSchema);

export default Feedback;
