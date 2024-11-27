import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import mongoose from 'mongoose';
import { Campaign } from '@/lib/db/models/campaign';
import { connectToDatabase } from '@/lib/db/mongodb';

// Connect to MongoDB
const connectDB = async () => {
  try {
    if (mongoose.connections[0].readyState) {

      return;
    }
 
    await mongoose.connect(process.env.MONGODB_URI);
  
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

export async function PUT(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      console.log('Unauthorized: No session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const { postId, content, imageUrl, imagePrompt } = body;

    if (!postId || !content) {
      console.log('Missing required fields:', { postId, content });
      return NextResponse.json(
        { error: 'Post ID and content are required' },
        { status: 400 }
      );
    }

    try {
      // Connect to MongoDB
      await connectToDatabase();

      // Find the campaign containing the post
      const campaign = await Campaign.findOne({
        'generatedPosts._id': postId
      });

   

      if (!campaign) {
  
        return NextResponse.json(
          { error: 'Post not found' },
          { status: 404 }
        );
      }

      // Update the post within the campaign
      const updateFields = {
        'generatedPosts.$.idea': content,
        'generatedPosts.$.updatedAt': new Date()
      };

      // Only add imageUrl and imagePrompt if they are provided
      if (imageUrl) {
        updateFields['generatedPosts.$.imageUrl'] = imageUrl;
      }
      if (imagePrompt) {
        updateFields['generatedPosts.$.imagePrompt'] = imagePrompt;
      }

      console.log('Updating with fields:', updateFields);

      const result = await Campaign.findOneAndUpdate(
        { 
          '_id': campaign._id,
          'generatedPosts._id': postId
        },
        { 
          $set: updateFields
        },
        { 
          new: true, // Return the updated document
          runValidators: true // Run schema validators
        }
      );


      if (!result) {
        console.log('Failed to update post in campaign');
        return NextResponse.json(
          { error: 'Failed to update post' },
          { status: 500 }
        );
      }

      // Find the updated post in the campaign
      const updatedPost = result.generatedPosts.find(
        post => post._id.toString() === postId
      );

      return NextResponse.json(updatedPost);
    } catch (dbError) {
      console.error('Database error:', dbError);
      // Check if it's a validation error
      if (dbError.name === 'ValidationError') {
        return NextResponse.json(
          { error: 'Validation failed', details: dbError.message },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: 'Database operation failed', details: dbError.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
