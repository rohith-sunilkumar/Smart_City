import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Report from '../models/Report.js';

dotenv.config();

const fixReports = async () => {
  try {
    console.log('🔧 Fixing reports...\n');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database\n');

    // Update the Pothole report to road department
    const result1 = await Report.updateOne(
      { title: 'Pothhole' },
      { 
        $set: { 
          category: 'Road Service Department',
          assignedDepartment: 'road_service'
        } 
      }
    );

    if (result1.modifiedCount > 0) {
      console.log('✅ Updated "Pothhole" → Road Service Department');
    }

    // Update "See That issue" to general (already is, but set category correctly)
    const result2 = await Report.updateOne(
      { title: 'See That issue' },
      { 
        $set: { 
          category: 'General Department',
          assignedDepartment: 'general'
        } 
      }
    );

    if (result2.modifiedCount > 0) {
      console.log('✅ Updated "See That issue" → General Department');
    }

    console.log('\n📊 Current reports:');
    console.log('═══════════════════════════════════════');
    
    const reports = await Report.find({}, { title: 1, category: 1, assignedDepartment: 1 });
    reports.forEach(report => {
      console.log(`${report.title}:`);
      console.log(`  Category: ${report.category}`);
      console.log(`  Department: ${report.assignedDepartment}`);
      console.log('');
    });

    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

fixReports();
