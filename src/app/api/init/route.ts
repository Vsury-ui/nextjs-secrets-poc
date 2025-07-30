import { NextResponse } from 'next/server';
import { secretsManager } from '@/lib/secrets';

export async function POST() {
  try {
    console.log('🔧 Initializing secrets on application startup...');
    
    // Initialize secrets
    if (!secretsManager.isReady()) {
      await secretsManager.initialize();
      console.log('✅ Secrets initialized successfully on startup');
    } else {
      console.log('⚡ Secrets already initialized, serving from cache');
    }

    return NextResponse.json({
      status: 'success',
      message: 'Application initialized successfully',
      secretsReady: secretsManager.isReady(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Failed to initialize application:', error);
    
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to initialize application',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Internal server error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Also allow GET requests for health checks
export async function GET() {
  try {
    const isReady = secretsManager.isReady();
    
    return NextResponse.json({
      status: 'success',
      message: 'Application health check',
      secretsReady: isReady,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Health check failed:', error);
    
    return NextResponse.json(
      {
        status: 'error',
        message: 'Health check failed',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Internal server error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
} 