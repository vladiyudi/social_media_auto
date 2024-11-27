import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request) {
  // Bypass auth for cron endpoint
  if (request.nextUrl.pathname.startsWith('/api/cron')) {
    return NextResponse.next();
  }

  // Check if this is an API route
  const isApiRoute = request.nextUrl.pathname.startsWith('/api');

  // Get the token
  const token = await getToken({ req: request });

  // If no token and trying to access protected route
  if (!token && (isApiRoute || request.nextUrl.pathname.startsWith('/app'))) {
    if (isApiRoute) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/app/:path*',
    '/api/:path*',
  ],
}
