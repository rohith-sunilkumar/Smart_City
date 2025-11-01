import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Review from './models/Review.js';

dotenv.config();

const checkReviews = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const allReviews = await Review.find({});
    console.log(`\n📊 Total reviews in database: ${allReviews.length}`);

    const publicReviews = await Review.find({ isPublic: true });
    console.log(`📊 Public reviews: ${publicReviews.length}`);

    const privateReviews = await Review.find({ isPublic: false });
    console.log(`📊 Private reviews: ${privateReviews.length}`);

    if (allReviews.length > 0) {
      console.log('\n📝 All reviews:');
      allReviews.forEach((review, index) => {
        console.log(`\n${index + 1}. Review ID: ${review._id}`);
        console.log(`   User: ${review.userName}`);
        console.log(`   Department: ${review.department}`);
        console.log(`   Rating: ${review.rating} ⭐`);
        console.log(`   Experience: ${review.experience}`);
        console.log(`   Is Public: ${review.isPublic}`);
        console.log(`   Comment: ${review.comment.substring(0, 100)}...`);
        console.log(`   Created: ${review.createdAt}`);
      });
    } else {
      console.log('\n❌ No reviews found in database!');
      console.log('💡 Users need to submit reviews for resolved reports.');
    }

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkReviews();
