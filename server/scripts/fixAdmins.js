import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const fixAdmins = async () => {
  try {
    console.log('🔧 Fixing admin departments...\n');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database\n');

    // Update each admin with appropriate department
    const updates = [
      { email: 'road@demo.com', department: 'road_service', name: 'Road Department' },
      { email: 'hospital@demo.com', department: 'hospital_emergency', name: 'Hospital Department' },
      { email: 'water@demo.com', department: 'water_management', name: 'Water Department' },
      { email: 'karthik@gmail.com', department: 'electrical_service', name: 'Electrical Department' },
      { email: 'admin@demo.com', department: 'general', name: 'General Department' },
      { email: 'adminuser@demo.com', department: 'general', name: 'General Admin' }
    ];

    for (const update of updates) {
      const result = await User.updateOne(
        { email: update.email },
        { $set: { department: update.department } }
      );
      
      if (result.modifiedCount > 0) {
        console.log(`✅ Updated ${update.name} (${update.email}) → ${update.department}`);
      } else {
        console.log(`⚠️  ${update.email} not found or already updated`);
      }
    }

    console.log('\n✅ All admins updated!\n');

    // Verify
    const admins = await User.find({ role: 'admin' }, { name: 1, email: 1, department: 1 });
    console.log('📊 Current admin departments:');
    console.log('═══════════════════════════════════════');
    admins.forEach(admin => {
      console.log(`${admin.name} (${admin.email}): ${admin.department || '❌ NOT SET'}`);
    });

    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

fixAdmins();
