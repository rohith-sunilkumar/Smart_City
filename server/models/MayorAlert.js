import mongoose from 'mongoose';

const mayorAlertSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Alert title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  message: {
    type: String,
    required: [true, 'Alert message is required'],
    trim: true,
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  sentBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying
mayorAlertSchema.index({ createdAt: -1 });
mayorAlertSchema.index({ sentBy: 1 });

const MayorAlert = mongoose.model('MayorAlert', mayorAlertSchema);

export default MayorAlert;
