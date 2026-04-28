import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(_request: NextRequest) {
  // Firebase handles auth client-side via sessionStorage password gate.
  // No server-side middleware needed — admin layout handles the gate.
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
