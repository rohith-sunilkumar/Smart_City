import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Report from '../models/Report.js';

// Load environment variables
dotenv.config();

// Category to department mapping
const categoryToDepartment = {
  'Road Service Department': 'road_service',
  'Hospital Emergency Department': 'hospital_emergency',
  'Water Management Department': 'water_management',
  'Electrical Service Department': 'electrical_service',
  'General Department': 'general',
  // Old categories for migration
  'road': 'road_service',
  'emergency': 'hospital_emergency',
  'water': 'water_management',
  'electrical': 'electrical_service',
  'hospital': 'hospital_emergency',
  'lighting': 'electrical_service',
  'waste': 'general',
  'safety': 'hospital_emergency',
  'other': 'general'
};

// Enhanced keyword detection for re-classification
const categoryKeywords = {
  road: ['pothole', 'road', 'street', 'highway', 'pavement', 'asphalt', 'crack', 'traffic'],
  water: ['water', 'leak', 'pipe', 'drainage', 'flood', 'sewage', 'drain'],
  electrical: ['electricity', 'power', 'light', 'streetlight', 'outage', 'transformer', 'wire'],
  emergency: ['emergency', 'urgent', 'accident', 'injury', 'fire', 'danger', 'critical'],
  hospital: ['hospital', 'clinic', 'medical', 'health', 'doctor', 'patient', 'icu', 'ward']
};

// Detect category from text
const detectCategory = (title, description) => {
  const text = `${title} ${description}`.toLowerCase();
  
  let scores = {
    road: 0,
    water: 0,
    electrical: 0,
    emergency: 0,
    hospital: 0
  };
  
  // Score each category
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        scores[category] += 1;
      }
    }
  }
  
  // Find highest score
  let maxScore = 0;
  let detectedCategory = 'other';
  
  for (const [category, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      detectedCategory = category;
    }
  }
  
  // Map to new category names
  const categoryMapping = {
    'road': 'Road Service Department',
    'water': 'Water Management Department',
    'electrical': 'Electrical Service Department',
    'emergency': 'Hospital Emergency Department',
    'hospital': 'Hospital Emergency Department',
    'other': 'General Department'
  };
  
  return categoryMapping[detectedCategory] || 'General Department';
};

const migrateDepartments = async () => {
  try {
    console.log('🔄 Starting department migration...\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Get all reports
    const reports = await Report.find({});
    console.log(`📊 Found ${reports.length} reports to process\n`);
    
    let updated = 0;
    let skipped = 0;
    let reclassified = 0;
    
    for (const report of reports) {
      const oldCategory = report.category;
      const oldDepartment = report.assignedDepartment;
      
      // Detect new category based on content
      const newCategory = detectCategory(report.title, report.description);
      const newDepartment = categoryToDepartment[newCategory] || 'general';
      
      let needsUpdate = false;
      let changes = [];
      
      // Check if category needs update
      if (oldCategory !== newCategory) {
        report.category = newCategory;
        needsUpdate = true;
        reclassified++;
        changes.push(`category: ${oldCategory} → ${newCategory}`);
      }
      
      // Check if department needs update
      if (oldDepartment !== newDepartment) {
        report.assignedDepartment = newDepartment;
        needsUpdate = true;
        changes.push(`department: ${oldDepartment} → ${newDepartment}`);
      }
      
      if (needsUpdate) {
        await report.save();
        updated++;
        console.log(`✅ Updated Report #${report._id.toString().slice(-6)}: ${report.title.substring(0, 40)}...`);
        console.log(`   Changes: ${changes.join(', ')}\n`);
      } else {
        skipped++;
      }
    }
    
    console.log('\n📊 Migration Summary:');
    console.log('═══════════════════════════════════════');
    console.log(`Total Reports:        ${reports.length}`);
    console.log(`Updated:              ${updated}`);
    console.log(`Reclassified:         ${reclassified}`);
    console.log(`Already Correct:      ${skipped}`);
    console.log('═══════════════════════════════════════\n');
    
    // Show department distribution
    const departmentCounts = await Report.aggregate([
      {
        $group: {
          _id: '$assignedDepartment',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    console.log('📈 Department Distribution:');
    console.log('═══════════════════════════════════════');
    for (const dept of departmentCounts) {
      const deptName = dept._id || 'unassigned';
      const emoji = {
        'road_service': '🛣️',
        'water_management': '💧',
        'electrical_service': '⚡',
        'hospital_emergency': '🏥',
        'general': '📋'
      }[deptName] || '❓';
      
      console.log(`${emoji} ${deptName.padEnd(25)} ${dept.count} reports`);
    }
    console.log('═══════════════════════════════════════\n');
    
    // Show category distribution
    const categoryCounts = await Report.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    console.log('📊 Category Distribution:');
    console.log('═══════════════════════════════════════');
    for (const cat of categoryCounts) {
      const catName = cat._id || 'unassigned';
      const emoji = {
        'road': '🛣️',
        'water': '💧',
        'electrical': '⚡',
        'emergency': '🚑',
        'hospital': '🏥',
        'other': '📋'
      }[catName] || '❓';
      
      console.log(`${emoji} ${catName.padEnd(15)} ${cat.count} reports`);
    }
    console.log('═══════════════════════════════════════\n');
    
    console.log('✅ Migration completed successfully!\n');
    
    // Close connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

// Run migration
migrateDepartments();
