import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  senderName: {
    type: String,
    required: true
  },
  senderRole: {
    type: String,
    enum: ['citizen', 'admin', 'mayor'],
    required: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  read: {
    type: Boolean,
    default: false
  }
});

const chatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  userName: {
    type: String,
    required: true
  },
  userRole: {
    type: String,
    enum: ['citizen', 'admin', 'mayor'],
    default: 'citizen'
  },
  userDepartment: {
    type: String,
    enum: ['road_service', 'hospital_emergency', 'water_management', 'electrical_service', 'general', null],
    default: null
  },
  department: {
    type: String,
    enum: ['mayor_office', 'road_service', 'hospital_emergency', 'water_management', 'electrical_service', 'general'],
    required: true,
    index: true
  },
  reportId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false
  },
  reportTitle: {
    type: String,
    required: false
  },
  messages: [messageSchema],
  lastMessage: {
    type: String,
    default: ''
  },
  lastMessageTime: {
    type: Date,
    default: Date.now
  },
  unreadCount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'closed'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Index for efficient queries
chatSchema.index({ userId: 1, department: 1 });
chatSchema.index({ department: 1, status: 1 });

const Chat = mongoose.model('Chat', chatSchema);

export default Chat;
