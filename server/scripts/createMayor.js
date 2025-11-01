import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const createMayor = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('✅ Connected to MongoDB');

    // Check if mayor already exists
    const existingMayor = await User.findOne({ role: 'mayor' });
    
    if (existingMayor) {
      console.log('⚠️  Mayor account already exists:');
      console.log(`   Email: ${existingMayor.email}`);
      console.log(`   Name: ${existingMayor.name}`);
      
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });

      readline.question('Do you want to create another mayor account? (yes/no): ', async (answer) => {
        if (answer.toLowerCase() !== 'yes') {
          console.log('❌ Operation cancelled');
          readline.close();
          process.exit(0);
        }
        readline.close();
        await createNewMayor();
      });
    } else {
      await createNewMayor();
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

const createNewMayor = async () => {
  try {
    // Create mayor account
    const mayorData = {
      name: 'City Mayor',
      email: 'mayor@city.gov',
      password: 'mayor123', // Change this in production!
      role: 'mayor',
      phone: '1234567890',
      isApproved: true
    };

    const mayor = await User.create(mayorData);

    console.log('\n✅ Mayor account created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:', mayorData.email);
    console.log('🔑 Password:', mayorData.password);
    console.log('👤 Name:', mayorData.name);
    console.log('🎯 Role:', mayorData.role);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🌐 Access the Mayor Portal at: http://localhost:3000/mayor/login');
    console.log('\n⚠️  IMPORTANT: Change the password after first login!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating mayor:', error.message);
    process.exit(1);
  }
};

createMayor();
