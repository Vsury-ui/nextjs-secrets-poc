import { NextResponse } from 'next/server';
import { secretsManager } from '@/lib/secrets';

export async function middleware() {
  // Initialize secrets if not already done (fallback for first request)
  try {
    if (!secretsManager.isReady()) {
      console.log('🔄 Initializing secrets in middleware (fallback)...');
      await secretsManager.initialize();
      console.log('✅ Secrets initialized successfully in middleware');
    }
  } catch (error) {
    console.error('❌ Failed to initialize secrets in middleware:', error);
    // Continue processing the request even if secrets fail to load
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 