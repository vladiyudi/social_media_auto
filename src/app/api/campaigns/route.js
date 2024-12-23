import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { Campaign } from '@/lib/db/models/campaign';
import mongoose from 'mongoose';
import { generateCampaignIdeas } from '@/lib/services/ai/claude';
import { generateImage } from '@/lib/services/falAi';

// Connect to MongoDB
const connectDB = async () => {
  if (mongoose.connections[0].readyState) return;
  await mongoose.connect(process.env.MONGODB_URI);
};

// GET /api/campaigns - Get all campaigns or a single campaign
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    // Check if an ID is provided in the query parameters
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      // Get a single campaign
      const campaign = await Campaign.findOne({
        _id: id,
        userId: session.user.email
      });

      if (!campaign) {
        return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
      }

      return NextResponse.json(campaign);
    }

    // Get all campaigns
    const campaigns = await Campaign.find({ userId: session.user.email })
      .sort({ createdAt: -1 });

    return NextResponse.json(campaigns);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST /api/campaigns - Create a new campaign
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    await connectDB();

    // Convert dates to proper ISO strings
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    // Generate campaign ideas with all parameters
    const campaignIdeas = await generateCampaignIdeas({
      description: data.description,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      platforms: data.platforms,
      brandLanguage: data.brandLanguage,
      imageStyle: data.imageStyle,
      llmModel: data.llmModel
    });

    let postsWithImages = campaignIdeas.posts;
    
    if (data.includeImages) {
      // Generate images for each post
      postsWithImages = await Promise.all(
        campaignIdeas.posts.map(async (post) => {
          try {
            const imageResult = await generateImage(post.imagePrompt, post.platform, data.imageModel);
       
            return { 
              ...post, 
              imageUrl: imageResult,
              imageGenerated: true 
            };
          } catch (error) {
            console.error('Error generating image:', error);
            return { 
              ...post, 
              imageUrl: null,
              imageGenerated: false,
              imageError: error.message 
            };
          }
        })
      );
    }

    // Create campaign in database
    const campaign = await Campaign.create({
      name: data.name,
      description: data.description,
      startDate,
      endDate,
      platforms: data.platforms,
      connection: data.connection,
      userId: session.user.email,
      brandLanguage: data.brandLanguage,
      imageStyle: data.imageStyle,
      llmModel: data.llmModel,
      imageModel: data.imageModel,
      includeImages: data.includeImages,
      generatedPosts: postsWithImages,
      status: 'pending'
    });

    return NextResponse.json({ 
      success: true,
      message: 'Campaign created successfully',
      campaign 
    });

  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || 'Failed to create campaign'
    }, { status: 500 });
  }
}

// DELETE /api/campaigns - Delete a campaign
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    await connectDB();
    const campaign = await Campaign.findOneAndDelete({
      _id: id,
      userId: session.user.email
    });

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(campaign);
  } catch (error) {
    console.error('Error deleting campaign:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// PATCH /api/campaigns - Update campaign activation status
export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Campaign ID is required' }, { status: 400 });
    }

    const { isActive } = await request.json();

    const campaign = await Campaign.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { isActive },
      { new: true }
    );

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    return NextResponse.json(campaign);
  } catch (error) {
    console.error('Error updating campaign:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
