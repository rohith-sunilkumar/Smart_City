import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Report from '../models/Report.js';
import User from '../models/User.js';

dotenv.config();

const checkDatabase = async () => {
  try {
    console.log('🔍 Connecting to database...\n');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected!\n');

    // Check all reports
    console.log('📊 REPORTS IN DATABASE:');
    console.log('═══════════════════════════════════════\n');
    
    const reports = await Report.find({}).populate('reporter', 'name email');
    
    if (reports.length === 0) {
      console.log('❌ No reports found in database\n');
    } else {
      console.log(`Found ${reports.length} reports:\n`);
      
      reports.forEach((report, index) => {
        console.log(`Report #${index + 1}:`);
        console.log(`  ID: ${report._id}`);
        console.log(`  Title: ${report.title}`);
        console.log(`  Category: ${report.category}`);
        console.log(`  Assigned Department: ${report.assignedDepartment}`);
        console.log(`  Priority: ${report.priority}`);
        console.log(`  Status: ${report.status}`);
        console.log(`  Reporter: ${report.reporter?.name || 'Unknown'}`);
        console.log(`  Created: ${report.createdAt}`);
        console.log('');
      });
    }

    // Check all admin users
    console.log('\n👥 ADMIN USERS IN DATABASE:');
    console.log('═══════════════════════════════════════\n');
    
    const admins = await User.find({ role: 'admin' });
    
    if (admins.length === 0) {
      console.log('❌ No admin users found\n');
    } else {
      console.log(`Found ${admins.length} admin users:\n`);
      
      admins.forEach((admin, index) => {
        console.log(`Admin #${index + 1}:`);
        console.log(`  ID: ${admin._id}`);
        console.log(`  Name: ${admin.name}`);
        console.log(`  Email: ${admin.email}`);
        console.log(`  Department: ${admin.department || '❌ NOT SET'}`);
        console.log('');
      });
    }

    // Check department distribution
    console.log('\n📈 DEPARTMENT DISTRIBUTION:');
    console.log('═══════════════════════════════════════\n');
    
    const deptCounts = await Report.aggregate([
      {
        $group: {
          _id: '$assignedDepartment',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    deptCounts.forEach(dept => {
      const deptName = dept._id || 'UNASSIGNED';
      console.log(`  ${deptName}: ${dept.count} reports`);
    });

    // Check for mismatches
    console.log('\n\n⚠️  CHECKING FOR ISSUES:');
    console.log('═══════════════════════════════════════\n');
    
    const issues = [];
    
    // Check for reports without assignedDepartment
    const noDepReports = await Report.find({ 
      $or: [
        { assignedDepartment: null },
        { assignedDepartment: { $exists: false } }
      ]
    });
    
    if (noDepReports.length > 0) {
      issues.push(`❌ ${noDepReports.length} reports have no assignedDepartment`);
    }
    
    // Check for admins without department
    const noDepAdmins = await User.find({ 
      role: 'admin',
      $or: [
        { department: null },
        { department: { $exists: false } }
      ]
    });
    
    if (noDepAdmins.length > 0) {
      issues.push(`❌ ${noDepAdmins.length} admin users have no department`);
      noDepAdmins.forEach(admin => {
        console.log(`  - ${admin.name} (${admin.email}) has no department`);
      });
    }
    
    if (issues.length === 0) {
      console.log('✅ No issues found!\n');
    } else {
      issues.forEach(issue => console.log(issue));
      console.log('');
    }

    await mongoose.connection.close();
    console.log('🔌 Database connection closed\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkDatabase();
