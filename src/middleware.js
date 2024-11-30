import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request) {
  // Bypass auth for public routes
  const publicPaths = ['/login', '/api/auth'];
  const isPublicPath = publicPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  if (isPublicPath) {
    return NextResponse.next();
  }

  // Bypass auth for cron endpoint
  if (request.nextUrl.pathname.startsWith('/api/cron')) {
    return NextResponse.next();
  }

  try {
    // Get the token
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    const isApiRoute = request.nextUrl.pathname.startsWith('/api');

    // If no token and trying to access protected route
    if (!token) {
      if (isApiRoute) {
        return NextResponse.json(
          { error: 'Unauthorized' }, 
          { status: 401 }
        );
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    if (request.nextUrl.pathname.startsWith('/api')) {
      return NextResponse.json(
        { error: 'Internal Server Error' }, 
        { status: 500 }
      );
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: [
    '/app/:path*',
    '/api/:path*',
  ],
};
