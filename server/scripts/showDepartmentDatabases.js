import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { getAllDepartmentModels } from '../models/DepartmentReport.js';

dotenv.config();

const showDepartmentDatabases = async () => {
  try {
    console.log('🔍 Connecting to MongoDB...\n');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected!\n');

    const allModels = getAllDepartmentModels();
    
    console.log('📊 DEPARTMENT-SPECIFIC COLLECTIONS:');
    console.log('═══════════════════════════════════════\n');

    for (const [dept, Model] of Object.entries(allModels)) {
      const collectionName = Model.collection.name;
      const total = await Model.countDocuments();
      
      console.log(`🏢 ${dept.toUpperCase().replace('_', ' ')}`);
      console.log(`   Collection: ${collectionName}`);
      console.log(`   Total Reports: ${total}`);
      
      if (total > 0) {
        const reports = await Model.find({}).populate('reporter', 'name email').limit(5);
        
        console.log(`   Reports:`);
        reports.forEach((report, index) => {
          console.log(`   ${index + 1}. ${report.title}`);
          console.log(`      Status: ${report.status} | Priority: ${report.priority}`);
          console.log(`      Reporter: ${report.reporter?.name || 'Unknown'}`);
          console.log(`      Created: ${new Date(report.createdAt).toLocaleString()}`);
        });
        
        if (total > 5) {
          console.log(`   ... and ${total - 5} more reports`);
        }
      } else {
        console.log(`   No reports yet`);
      }
      console.log('');
    }

    // Show statistics
    console.log('\n📈 STATISTICS BY DEPARTMENT:');
    console.log('═══════════════════════════════════════\n');
    
    for (const [dept, Model] of Object.entries(allModels)) {
      const total = await Model.countDocuments();
      const open = await Model.countDocuments({ status: 'open' });
      const inProgress = await Model.countDocuments({ status: 'in-progress' });
      const resolved = await Model.countDocuments({ status: 'resolved' });
      const closed = await Model.countDocuments({ status: 'closed' });
      
      const deptName = dept.replace('_', ' ').toUpperCase();
      console.log(`${deptName}:`);
      console.log(`  Total: ${total}`);
      console.log(`  Open: ${open}`);
      console.log(`  In Progress: ${inProgress}`);
      console.log(`  Resolved: ${resolved}`);
      console.log(`  Closed: ${closed}`);
      console.log('');
    }

    // Show collection names
    console.log('\n💾 MONGODB COLLECTIONS:');
    console.log('═══════════════════════════════════════\n');
    
    for (const [dept, Model] of Object.entries(allModels)) {
      console.log(`${dept.padEnd(25)} → ${Model.collection.name}`);
    }

    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

showDepartmentDatabases();
