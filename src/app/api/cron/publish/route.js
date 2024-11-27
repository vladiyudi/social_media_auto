import { NextResponse } from 'next/server';
import { publishScheduledPosts } from '@/lib/services/publisher';
import { connectDB } from '@/lib/db';

// This secret should match the one used in your cron job configuration
const CRON_SECRET = process.env.CRON_SECRET;

export async function POST(request) {
  try {
    // Verify the request is coming from our cron job
    const authorization = request.headers.get('authorization');
    if (authorization !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Connect to database
    await connectDB();

    // Publish scheduled posts
    const result = await publishScheduledPosts();

    return NextResponse.json({
      success: true,
      message: 'Posts published successfully',
      ...result
    });

  } catch (error) {
    console.error('Error in publish cron job:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

// Optional: Allow GET requests for manual triggering in development
export async function GET(request) {
  if (process.env.NODE_ENV === 'development') {
    return POST(request);
  }
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
