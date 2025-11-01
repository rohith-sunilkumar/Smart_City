import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Report from '../models/Report.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Report.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create demo users
    const citizen = await User.create({
      name: 'John Citizen',
      email: 'citizen@demo.com',
      password: 'password',
      role: 'citizen',
      phone: '+1 234 567 8900'
    });

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@demo.com',
      password: 'password',
      role: 'admin',
      phone: '+1 234 567 8901'
    });

    console.log('👥 Created demo users');

    // Create demo reports
    const reports = [
      {
        title: 'Large pothole on Main Street',
        description: 'There is a dangerous pothole near the intersection of Main Street and 5th Avenue. It\'s about 2 feet wide and causing damage to vehicles. This needs immediate attention as it poses a safety hazard.',
        category: 'road',
        priority: 'high',
        status: 'open',
        reporter: citizen._id,
        assignedDepartment: 'roads',
        location: {
          type: 'Point',
          coordinates: [-122.4194, 37.7749],
          address: 'Main Street & 5th Avenue, San Francisco, CA'
        },
        ai_metadata: {
          suggestedCategory: 'road',
          suggestedPriority: 'high',
          confidence: 0.95,
          reasoning: 'Road damage with safety implications requires high priority'
        }
      },
      {
        title: 'Streetlight not working',
        description: 'The streetlight at the corner of Oak Street has been out for three days. This area gets very dark at night and it\'s becoming a safety concern for pedestrians.',
        category: 'lighting',
        priority: 'medium',
        status: 'in-progress',
        reporter: citizen._id,
        assignedDepartment: 'electricity',
        location: {
          type: 'Point',
          coordinates: [-122.4195, 37.7750],
          address: 'Oak Street Corner, San Francisco, CA'
        },
        ai_metadata: {
          suggestedCategory: 'lighting',
          suggestedPriority: 'medium',
          confidence: 0.92,
          reasoning: 'Lighting issue affecting safety, medium priority'
        }
      },
      {
        title: 'Overflowing garbage bins',
        description: 'The public garbage bins near the park have been overflowing for days. It\'s attracting pests and creating an unpleasant smell in the area.',
        category: 'waste',
        priority: 'medium',
        status: 'resolved',
        reporter: citizen._id,
        assignedDepartment: 'sanitation',
        location: {
          type: 'Point',
          coordinates: [-122.4196, 37.7751],
          address: 'Central Park Area, San Francisco, CA'
        },
        resolvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        ai_metadata: {
          suggestedCategory: 'waste',
          suggestedPriority: 'medium',
          confidence: 0.88,
          reasoning: 'Waste management issue requiring attention'
        },
        adminNotes: 'Bins have been emptied and collection schedule adjusted.'
      },
      {
        title: 'Suspicious activity in parking lot',
        description: 'There have been reports of suspicious individuals loitering in the parking lot late at night. Residents are concerned about their safety.',
        category: 'safety',
        priority: 'high',
        status: 'in-progress',
        reporter: citizen._id,
        assignedDepartment: 'police',
        location: {
          type: 'Point',
          coordinates: [-122.4197, 37.7752],
          address: 'Community Parking Lot, San Francisco, CA'
        },
        ai_metadata: {
          suggestedCategory: 'safety',
          suggestedPriority: 'high',
          confidence: 0.90,
          reasoning: 'Public safety concern requires immediate attention'
        },
        adminNotes: 'Police patrol increased in the area.'
      },
      {
        title: 'Water leak on sidewalk',
        description: 'There is a continuous water leak on the sidewalk near the library. Water has been flowing for several days and is creating a slippery surface.',
        category: 'water',
        priority: 'medium',
        status: 'open',
        reporter: citizen._id,
        assignedDepartment: 'water',
        location: {
          type: 'Point',
          coordinates: [-122.4198, 37.7753],
          address: 'Near Public Library, San Francisco, CA'
        },
        ai_metadata: {
          suggestedCategory: 'water',
          suggestedPriority: 'medium',
          confidence: 0.93,
          reasoning: 'Water infrastructure issue needs repair'
        }
      },
      {
        title: 'Graffiti on public building',
        description: 'The community center has been vandalized with graffiti. It would be great to have it cleaned up to maintain the appearance of our neighborhood.',
        category: 'other',
        priority: 'low',
        status: 'open',
        reporter: citizen._id,
        assignedDepartment: 'general',
        location: {
          type: 'Point',
          coordinates: [-122.4199, 37.7754],
          address: 'Community Center, San Francisco, CA'
        },
        ai_metadata: {
          suggestedCategory: 'other',
          suggestedPriority: 'low',
          confidence: 0.85,
          reasoning: 'Cosmetic issue, lower priority'
        }
      },
      {
        title: 'Broken traffic signal',
        description: 'The traffic signal at the busy intersection is malfunctioning. It\'s stuck on red in all directions, causing traffic congestion and potential accidents.',
        category: 'road',
        priority: 'high',
        status: 'resolved',
        reporter: citizen._id,
        assignedDepartment: 'roads',
        location: {
          type: 'Point',
          coordinates: [-122.4200, 37.7755],
          address: 'Main Intersection, San Francisco, CA'
        },
        resolvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        ai_metadata: {
          suggestedCategory: 'road',
          suggestedPriority: 'high',
          confidence: 0.97,
          reasoning: 'Traffic safety issue requires immediate response'
        },
        adminNotes: 'Traffic signal repaired and tested. Back to normal operation.'
      },
      {
        title: 'Park bench needs repair',
        description: 'One of the benches in the park is broken and has sharp edges. It could be dangerous for children playing nearby.',
        category: 'other',
        priority: 'medium',
        status: 'open',
        reporter: citizen._id,
        assignedDepartment: 'general',
        location: {
          type: 'Point',
          coordinates: [-122.4201, 37.7756],
          address: 'City Park, San Francisco, CA'
        },
        ai_metadata: {
          suggestedCategory: 'other',
          suggestedPriority: 'medium',
          confidence: 0.82,
          reasoning: 'Public facility maintenance with safety concern'
        }
      }
    ];

    // Add timestamps to reports
    const reportsWithTimestamps = reports.map((report, index) => ({
      ...report,
      createdAt: new Date(Date.now() - (7 - index) * 24 * 60 * 60 * 1000) // Spread over last 7 days
    }));

    await Report.insertMany(reportsWithTimestamps);
    console.log('📋 Created demo reports');

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📧 Demo Credentials:');
    console.log('Citizen: citizen@demo.com / password');
    console.log('Admin: admin@demo.com / password\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
