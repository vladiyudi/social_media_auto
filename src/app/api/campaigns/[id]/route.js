import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { Campaign } from '@/lib/db/models/campaign';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Connect to MongoDB
const connectDB = async () => {
  if (mongoose.connections[0].readyState) return;
  await mongoose.connect(process.env.MONGODB_URI);
};

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { action } = await request.json();

    await connectDB();
    
    const campaign = await Campaign.findOne({ 
      _id: id,
      userId: session.user.email  
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    if (action === 'toggle') {
      campaign.isActive = !campaign.isActive;
      await campaign.save();

      return NextResponse.json({ 
        success: true, 
        isActive: campaign.isActive 
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error updating campaign:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
