import mongoose from 'mongoose';

// Base report schema
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
    required: true
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
      type: [Number]
    },
    address: String
  },
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  adminNotes: {
    type: String,
    trim: true
  },
  resolvedAt: {
    type: Date
  },
  ai_metadata: {
    suggestedCategory: String,
    suggestedPriority: String,
    confidence: Number,
    reasoning: String
  }
}, {
  timestamps: true
});

// Create separate models for each department
export const RoadServiceReports = mongoose.model('RoadServiceReport', reportSchema);
export const WaterManagementReports = mongoose.model('WaterManagementReport', reportSchema);
export const ElectricalServiceReports = mongoose.model('ElectricalServiceReport', reportSchema);
export const HospitalEmergencyReports = mongoose.model('HospitalEmergencyReport', reportSchema);
export const GeneralReports = mongoose.model('GeneralReport', reportSchema);

// Helper function to get the correct model based on department
export const getDepartmentModel = (department) => {
  const models = {
    'road_service': RoadServiceReports,
    'water_management': WaterManagementReports,
    'electrical_service': ElectricalServiceReports,
    'hospital_emergency': HospitalEmergencyReports,
    'general': GeneralReports
  };
  return models[department] || GeneralReports;
};

// Helper to get all department models
export const getAllDepartmentModels = () => ({
  road_service: RoadServiceReports,
  water_management: WaterManagementReports,
  electrical_service: ElectricalServiceReports,
  hospital_emergency: HospitalEmergencyReports,
  general: GeneralReports
});
