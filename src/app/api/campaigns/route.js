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
    console.log('Received campaign data:', {
      startDate: data.startDate,
      endDate: data.endDate,
      platforms: data.platforms
    });

    await connectDB();

    // Convert dates to proper ISO strings
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    console.log('Converted dates:', {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });

    const campaignIdeas = await generateCampaignIdeas({
      description: data.description,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      platforms: data.platforms
    });

    console.log('Generated posts dates:', campaignIdeas.posts.map(post => ({
      date: new Date(post.date).toISOString(),
      platform: post.platform
    })));
    
    const postsWithImages = await Promise.all(
      campaignIdeas.posts.map(async (post) => {
        if (post.imagePrompt) {
          try {
            const imageUrl = await generateImage(post.imagePrompt);
            return { ...post, imageUrl };
          } catch (error) {
            console.error('Error generating image for post:', error);
            return post;
          }
        }
        return post;
      })
    );

    // Create campaign with generated ideas and images
    const campaign = await Campaign.create({
      ...data,
      startDate: startDate,
      endDate: endDate,
      userId: session.user.email,
      generatedPosts: postsWithImages
    });

    console.log('Created campaign with posts:', campaign.generatedPosts.map(post => ({
      date: new Date(post.date).toISOString(),
      platform: post.platform
    })));

    return NextResponse.json({ campaign });
  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
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
