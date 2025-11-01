import mongoose from 'mongoose';
import dotenv from 'dotenv';
import readline from 'readline';
import User from '../models/User.js';

dotenv.config();

const deleteAllAdmins = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('✅ Connected to MongoDB');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Count existing admins
    const adminCount = await User.countDocuments({ role: 'admin' });
    
    if (adminCount === 0) {
      console.log('ℹ️  No admin accounts found in database');
      console.log('   Database is already clean!\n');
      process.exit(0);
    }

    // Show existing admins
    const admins = await User.find({ role: 'admin' }).select('name email department isApproved');
    
    console.log(`📊 Found ${adminCount} admin account(s):\n`);
    admins.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.name}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Department: ${admin.department}`);
      console.log(`   Approved: ${admin.isApproved ? 'Yes' : 'No'}`);
      console.log('');
    });

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚠️  WARNING: This will DELETE all admin accounts!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Confirm deletion
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('Are you sure you want to delete ALL admin accounts? (yes/no): ', async (answer) => {
      if (answer.toLowerCase() === 'yes') {
        // Delete all admins
        const result = await User.deleteMany({ role: 'admin' });
        
        console.log('\n✅ Successfully deleted all admin accounts!');
        console.log(`   Deleted: ${result.deletedCount} admin(s)\n`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📊 Current Database Status:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        const citizenCount = await User.countDocuments({ role: 'citizen' });
        const mayorCount = await User.countDocuments({ role: 'mayor' });
        const remainingAdmins = await User.countDocuments({ role: 'admin' });
        
        console.log(`👥 Citizens: ${citizenCount}`);
        console.log(`👑 Mayors: ${mayorCount}`);
        console.log(`🛡️  Admins: ${remainingAdmins}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log('✨ Database is now fresh and ready!');
        console.log('   You can register new admins at: http://localhost:3000/register\n');
      } else {
        console.log('\n❌ Operation cancelled - No admins were deleted\n');
      }
      
      rl.close();
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

deleteAllAdmins();
