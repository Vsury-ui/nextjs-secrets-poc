import { NextResponse } from 'next/server';
import { withApiKeyAuth, AuthenticatedRequest } from '@/lib/apiKeyAuth';

// Example secure API endpoint that requires API key authentication
async function handleSecureRequest(request: AuthenticatedRequest) {
  try {
    const { action, data } = await request.json();
    const secrets = request.secrets!;

    switch (action) {
      case 'getUserData':
        // Example: Using secrets to connect to a service
        const userData = {
          status: 'success',
          message: 'User data retrieved successfully',
          data: {
            userId: 'user_123',
            email: 'user@example.com',
            permissions: ['read', 'write'],
            // Using secrets for service configuration (not exposing actual values)
            serviceConfigured: secrets.databaseUrl ? 'Database connected' : 'Database not configured',
            apiConfigured: secrets.apiKey ? 'API configured' : 'API not configured',
          },
          timestamp: new Date().toISOString(),
        };
        return NextResponse.json(userData);

      case 'processPayment':
        // Example: Using Stripe secret for payment processing
        const paymentResult = {
          status: 'success',
          message: 'Payment processed successfully',
          data: {
            transactionId: 'txn_' + Math.random().toString(36).substr(2, 9),
            amount: data?.amount || 0,
            currency: 'USD',
            // Using secrets for payment processing (not exposing actual values)
            paymentProvider: secrets.stripeSecretKey ? 'Stripe' : 'Not configured',
          },
          timestamp: new Date().toISOString(),
        };
        return NextResponse.json(paymentResult);

      case 'generateToken':
        // Example: Using JWT secret for token generation
        const token = {
          status: 'success',
          message: 'Token generated successfully',
          data: {
            token: `jwt_${Math.random().toString(36).substr(2, 15)}`,
            expiresIn: '1h',
            // Using secrets for token generation (not exposing actual values)
            tokenType: secrets.jwtSecret ? 'JWT' : 'Not configured',
          },
          timestamp: new Date().toISOString(),
        };
        return NextResponse.json(token);

      case 'cacheOperation':
        // Example: Using Redis secret for cache operations
        const cacheResult = {
          status: 'success',
          message: 'Cache operation completed',
          data: {
            operation: data?.operation || 'get',
            key: data?.key || 'default',
            // Using secrets for cache operations (not exposing actual values)
            cacheProvider: secrets.redisUrl ? 'Redis' : 'Not configured',
          },
          timestamp: new Date().toISOString(),
        };
        return NextResponse.json(cacheResult);

      default:
        return NextResponse.json(
          { 
            status: 'error', 
            message: 'Invalid action. Supported actions: getUserData, processPayment, generateToken, cacheOperation' 
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in secure API:', error);
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

// Export the handler wrapped with API key authentication
export const POST = withApiKeyAuth(handleSecureRequest);

// GET method for health check (also requires API key)
async function handleHealthCheck(request: AuthenticatedRequest) {
  const secrets = request.secrets!;
  
  return NextResponse.json({
    status: 'success',
    message: 'Secure API is healthy',
    data: {
      authenticated: true,
      apiKeyValid: true,
      services: {
        database: secrets.databaseUrl ? 'configured' : 'not configured',
        api: secrets.apiKey ? 'configured' : 'not configured',
        jwt: secrets.jwtSecret ? 'configured' : 'not configured',
        redis: secrets.redisUrl ? 'configured' : 'not configured',
        stripe: secrets.stripeSecretKey ? 'configured' : 'not configured',
      },
      timestamp: new Date().toISOString(),
    }
  });
}

export const GET = withApiKeyAuth(handleHealthCheck); 