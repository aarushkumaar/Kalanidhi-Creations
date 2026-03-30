import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Firebase handles auth client-side.
  // This middleware just ensures /admin/* always has the right headers.
  // The AdminLayout client component handles the actual auth redirect.
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
