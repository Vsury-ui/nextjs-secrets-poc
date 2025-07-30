import { NextRequest, NextResponse } from 'next/server';
import { getSecrets } from '@/lib/secrets';

export async function GET(request: NextRequest) {
  try {
    // Get secrets (this will initialize them if not already done)
    const secrets = await getSecrets();
    
    // Return only non-sensitive information about secrets
    // NEVER return actual secret values in API responses
    const secretsInfo = {
      status: 'success',
      message: 'Secrets are properly configured',
      secretsConfigured: {
        databaseUrl: secrets.databaseUrl ? '✅ Configured' : '❌ Missing',
        apiKey: secrets.apiKey ? '✅ Configured' : '❌ Missing',
        jwtSecret: secrets.jwtSecret ? '✅ Configured' : '❌ Missing',
        redisUrl: secrets.redisUrl ? '✅ Configured' : '❌ Missing',
        stripeSecretKey: secrets.stripeSecretKey ? '✅ Configured' : '❌ Missing',
      },
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(secretsInfo, { status: 200 });
  } catch (error) {
    console.error('Error in secrets API:', error);
    
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to access secrets',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

// Example of using secrets in a business logic API
export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();
    
    // Get secrets for business logic
    const secrets = await getSecrets();
    
    // Example: Using secrets for authentication
    if (action === 'authenticate') {
      // Use the JWT secret for token generation (example)
      const token = `jwt_token_using_${secrets.jwtSecret.substring(0, 8)}...`;
      
      return NextResponse.json({
        status: 'success',
        message: 'Authentication successful',
        token: token,
        // Note: We never return the actual secret values
      });
    }
    
    // Example: Using database URL for connection
    if (action === 'database') {
      const dbInfo = {
        status: 'success',
        message: 'Database connection configured',
        databaseType: secrets.databaseUrl.includes('postgresql') ? 'PostgreSQL' : 'Unknown',
        // Note: We never return the actual connection string
      };
      
      return NextResponse.json(dbInfo);
    }
    
    return NextResponse.json(
      { status: 'error', message: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in secrets POST API:', error);
    
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to process request',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Internal server error',
      },
      { status: 500 }
    );
  }
} 