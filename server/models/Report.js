import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  category: {
    type: String,
    enum: [
      'Road Service Department',
      'Hospital Emergency Department',
      'Water Management Department',
      'Electrical Service Department',
      'General Department'
    ],
    default: 'General Department'
  },
  priority: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'resolved', 'closed'],
    default: 'open'
  },
  images: [{
    url: String,
    publicId: String
  }],
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: false
    },
    address: {
      type: String,
      trim: true
    }
  },
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedDepartment: {
    type: String,
    enum: ['road_service', 'hospital_emergency', 'water_management', 'electrical_service', 'general'],
    default: 'general'
  },
  ai_metadata: {
    suggestedCategory: String,
    suggestedPriority: String,
    confidence: Number,
    reasoning: String
  },
  adminNotes: {
    type: String,
    trim: true
  },
  resolvedAt: {
    type: Date
  },
  feedbackCount: {
    type: Number,
    default: 0
  },
  lastFeedbackAt: {
    type: Date
  },
  hasUnreadFeedback: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Create geospatial index for location-based queries
reportSchema.index({ location: '2dsphere' });

// Index for efficient queries
reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ reporter: 1, createdAt: -1 });
reportSchema.index({ category: 1, status: 1 });

const Report = mongoose.model('Report', reportSchema);

export default Report;
