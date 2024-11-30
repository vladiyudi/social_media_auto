import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Campaign from '@/models/Campaign';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const campaign = await Campaign.findOne({ 
      _id: params.id,
      userId: session.user.id 
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    campaign.isActive = !campaign.isActive;
    await campaign.save();

    return NextResponse.json({ 
      success: true, 
      isActive: campaign.isActive 
    });
  } catch (error) {
    console.error('Error toggling campaign:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
