import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const checkImages = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    
    // Check all department collections
    const collections = [
      'roadservicereports', 
      'hospitalemergencyreports', 
      'watermanagementreports', 
      'electricalservicereports', 
      'generalreports'
    ];
    
    for (const col of collections) {
      try {
        const docs = await db.collection(col).find({}).sort({createdAt: -1}).limit(2).toArray();
        if (docs.length > 0) {
          console.log(`\n📊 Collection: ${col}`);
          docs.forEach(doc => {
            console.log(`\n  Report ID: ${doc._id}`);
            console.log(`  Title: ${doc.title}`);
            console.log(`  Created: ${doc.createdAt}`);
            if (doc.images && doc.images.length > 0) {
              console.log(`  Images (${doc.images.length}):`);
              doc.images.forEach((img, idx) => {
                console.log(`    ${idx + 1}. URL: ${img.url}`);
                console.log(`       PublicId: ${img.publicId}`);
              });
            } else {
              console.log(`  Images: None`);
            }
          });
        }
      } catch (e) {
        console.error(`Error checking ${col}:`, e.message);
      }
    }

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkImages();
