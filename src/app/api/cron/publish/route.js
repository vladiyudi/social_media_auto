import { NextResponse } from 'next/server';
import { publishScheduledPosts } from '@/lib/services/publisher';
import { connectDB } from '@/lib/db';

// This secret should match the one used in your cron job configuration
const CRON_SECRET = process.env.CRON_SECRET;

export const revalidate = 0;

export async function POST(request) {
  try {
    // Add CORS headers
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 204, headers });
    }

    // Verify the request is coming from our cron job
    const authorization = request.headers.get('authorization');
    
    // Support both Bearer token and direct secret comparison for cron-job.org
    const isAuthorized = 
      authorization === `Bearer ${CRON_SECRET}` || 
      request.headers.get('x-cron-secret') === CRON_SECRET;

    if (!isAuthorized) {
      console.log('Unauthorized request:', { 
        authorization,
        secret: request.headers.get('x-cron-secret')
      });
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401, headers }
      );
    }

    // Connect to database
    await connectDB();

    // Publish scheduled posts
    const result = await publishScheduledPosts();

    return NextResponse.json({
      success: true,
      message: 'Posts published successfully',
      ...result
    }, { headers });

  } catch (error) {
    console.error('Error in publish cron job:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500, headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    } });
  }
}

// Optional: Allow GET requests for manual triggering in development
export async function GET(request) {
  if (process.env.NODE_ENV === 'development') {
    return POST(request);
  }
  return NextResponse.json(
    { error: 'Method not allowed' }, 
    { 
      status: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    }
  );
}
