import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Campaign } from '@/lib/db/models/campaign';
import connectDB from '@/lib/db/connect';

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { isActive } = await request.json();

    await connectDB();

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
