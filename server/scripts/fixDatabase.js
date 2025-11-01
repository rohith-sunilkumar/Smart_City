import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Report from '../models/Report.js';
import User from '../models/User.js';

dotenv.config();

// Consolidated database fix script
const fixDatabase = async () => {
  try {
    console.log('🔧 Starting database optimization and fixes...\n');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database\n');

    let totalFixed = 0;

    // 1. Fix admin users without departments
    console.log('👥 Fixing admin users...');
    const adminsWithoutDept = await User.find({ 
      role: 'admin',
      $or: [{ department: null }, { department: { $exists: false } }]
    });

    if (adminsWithoutDept.length > 0) {
      console.log(`Found ${adminsWithoutDept.length} admins without departments`);
      
      // Auto-assign based on email or name
      for (const admin of adminsWithoutDept) {
        let department = 'general'; // default
        
        const emailLower = admin.email.toLowerCase();
        const nameLower = admin.name.toLowerCase();
        
        if (emailLower.includes('road') || nameLower.includes('road')) {
          department = 'road_service';
        } else if (emailLower.includes('water') || nameLower.includes('water')) {
          department = 'water_management';
        } else if (emailLower.includes('hospital') || emailLower.includes('health') || nameLower.includes('hospital')) {
          department = 'hospital_emergency';
        } else if (emailLower.includes('electric') || emailLower.includes('power') || nameLower.includes('electric')) {
          department = 'electrical_service';
        }
        
        await User.updateOne(
          { _id: admin._id },
          { $set: { department } }
        );
        
        console.log(`  ✅ ${admin.name} → ${department}`);
        totalFixed++;
      }
    } else {
      console.log('  ✅ All admins have departments');
    }

    // 2. Fix reports without assignedDepartment
    console.log('\n📊 Fixing reports...');
    const reportsWithoutDept = await Report.find({ 
      $or: [
        { assignedDepartment: null },
        { assignedDepartment: { $exists: false } }
      ]
    });

    if (reportsWithoutDept.length > 0) {
      console.log(`Found ${reportsWithoutDept.length} reports without departments`);
      
      for (const report of reportsWithoutDept) {
        let department = 'general';
        let category = 'General Department';
        
        // Detect from title and description
        const text = `${report.title} ${report.description}`.toLowerCase();
        
        if (text.match(/pothole|road|street|highway|pavement|traffic/)) {
          department = 'road_service';
          category = 'Road Service Department';
        } else if (text.match(/water|leak|pipe|drainage|flood|sewage/)) {
          department = 'water_management';
          category = 'Water Management Department';
        } else if (text.match(/electric|power|light|streetlight|outage|transformer/)) {
          department = 'electrical_service';
          category = 'Electrical Service Department';
        } else if (text.match(/hospital|medical|health|emergency|ambulance|doctor/)) {
          department = 'hospital_emergency';
          category = 'Hospital Emergency Department';
        }
        
        await Report.updateOne(
          { _id: report._id },
          { $set: { assignedDepartment: department, category } }
        );
        
        console.log(`  ✅ "${report.title}" → ${department}`);
        totalFixed++;
      }
    } else {
      console.log('  ✅ All reports have departments');
    }

    // 3. Fix category-department mismatches
    console.log('\n🔄 Checking for mismatches...');
    const categoryToDept = {
      'Road Service Department': 'road_service',
      'Water Management Department': 'water_management',
      'Electrical Service Department': 'electrical_service',
      'Hospital Emergency Department': 'hospital_emergency',
      'General Department': 'general'
    };

    for (const [cat, dept] of Object.entries(categoryToDept)) {
      const mismatched = await Report.updateMany(
        { category: cat, assignedDepartment: { $ne: dept } },
        { $set: { assignedDepartment: dept } }
      );
      
      if (mismatched.modifiedCount > 0) {
        console.log(`  ✅ Fixed ${mismatched.modifiedCount} ${cat} reports`);
        totalFixed += mismatched.modifiedCount;
      }
    }

    // 4. Summary
    console.log('\n📈 Final Status:');
    console.log('═══════════════════════════════════════');
    
    const adminCount = await User.countDocuments({ role: 'admin' });
    const reportCount = await Report.countDocuments();
    
    const deptDist = await Report.aggregate([
      { $group: { _id: '$assignedDepartment', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log(`Total Admins: ${adminCount}`);
    console.log(`Total Reports: ${reportCount}`);
    console.log(`Total Fixed: ${totalFixed}`);
    console.log('\nDepartment Distribution:');
    deptDist.forEach(d => {
      console.log(`  ${d._id}: ${d.count} reports`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Database optimization complete!');
    console.log('🔌 Connection closed\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

fixDatabase();
