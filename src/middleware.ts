import { NextResponse } from 'next/server';
import { secretsManager } from '@/lib/secrets';

export async function middleware() {
  // Initialize secrets on first request
  try {
    if (!secretsManager.isReady()) {
      await secretsManager.initialize();
      console.log('✅ Secrets initialized successfully');
    }
  } catch (error) {
    console.error('❌ Failed to initialize secrets:', error);
    // In production, you might want to return an error response
    // For now, we'll continue but log the error
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 