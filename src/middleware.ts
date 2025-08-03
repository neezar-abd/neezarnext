import { NextResponse, type NextRequest } from 'next/server';
import {
  getOrigin,
  getBearerToken,
  generateNextResponse
} from '@lib/helper-server';
import { frontendEnv, IS_DEVELOPMENT } from '@lib/env';

export function middleware(req: NextRequest): NextResponse {
  const pathname = req.nextUrl.pathname;
  
  // Skip middleware for specific paths that should be public
  if (pathname.startsWith('/api/admin') || 
      pathname.startsWith('/api/auth') || 
      pathname.startsWith('/api/guestbook') || 
      pathname.startsWith('/api/views') || 
      pathname.startsWith('/api/likes')) {
    return NextResponse.next();
  }

  // Debug logging for other routes
  console.log('Middleware checking:', pathname);

  const origin = getOrigin(req);

  const isValidOrigin = IS_DEVELOPMENT
    ? [frontendEnv.NEXT_PUBLIC_URL, 'http://localhost:3000'].includes(
        origin as string
      )
    : origin === frontendEnv.NEXT_PUBLIC_URL;

  if (!isValidOrigin) {
    console.log('Invalid origin:', origin, 'for path:', pathname);
    return generateNextResponse(403, 'Forbidden');
  }

  const bearerToken = getBearerToken(req);

  if (bearerToken !== frontendEnv.NEXT_PUBLIC_OWNER_BEARER_TOKEN) {
    console.log('Invalid bearer token for path:', pathname);
    return generateNextResponse(401, 'Unauthorized');
  }

  return NextResponse.next();
}

type Config = {
  matcher: string;
};

export const config: Config = {
  // Match all API routes, then filter in middleware function
  matcher: '/api/(.*)'
};
