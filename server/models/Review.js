import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  reportId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  department: {
    type: String,
    enum: ['road_service', 'hospital_emergency', 'water_management', 'electrical_service', 'general'],
    required: true
  },
  reportTitle: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  experience: {
    type: String,
    enum: ['excellent', 'good', 'average', 'poor'],
    required: true
  },
  resolutionTime: {
    type: String, // e.g., "2 days", "1 week"
  },
  wouldRecommend: {
    type: Boolean,
    default: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: true // Verified because linked to actual resolved report
  }
}, {
  timestamps: true
});

// Index for efficient queries
reviewSchema.index({ department: 1, createdAt: -1 });
reviewSchema.index({ rating: -1 });
reviewSchema.index({ isPublic: 1 });

const Review = mongoose.model('Review', reviewSchema);

export default Review;
