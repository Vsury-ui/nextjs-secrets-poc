import { NextRequest, NextResponse } from 'next/server';
import { getSecrets } from './secrets';

export interface AuthenticatedRequest extends NextRequest {
  apiKey?: string;
  secrets?: Awaited<ReturnType<typeof getSecrets>>;
}

export async function validateApiKey(request: NextRequest): Promise<{
  isValid: boolean;
  request: AuthenticatedRequest;
  response?: NextResponse;
}> {
  const authHeader = request.headers.get('authorization');
  const apiKeyHeader = request.headers.get('x-api-key');
  
  // Get API key from Authorization header (Bearer token) or X-API-Key header
  const providedApiKey = authHeader?.startsWith('Bearer ') 
    ? authHeader.substring(7) 
    : apiKeyHeader;

  if (!providedApiKey) {
    return {
      isValid: false,
      request: request as AuthenticatedRequest,
      response: NextResponse.json(
        { 
          status: 'error', 
          message: 'API key required. Use Authorization: Bearer <api-key> or X-API-Key header' 
        },
        { status: 401 }
      )
    };
  }

  try {
    // Get secrets to validate against stored API key
    const secrets = await getSecrets();
    
    if (!secrets.apiKey) {
      return {
        isValid: false,
        request: request as AuthenticatedRequest,
        response: NextResponse.json(
          { 
            status: 'error', 
            message: 'API key not configured on server' 
          },
          { status: 500 }
        )
      };
    }

    // Validate API key
    if (providedApiKey !== secrets.apiKey) {
      return {
        isValid: false,
        request: request as AuthenticatedRequest,
        response: NextResponse.json(
          { 
            status: 'error', 
            message: 'Invalid API key' 
          },
          { status: 401 }
        )
      };
    }

    // API key is valid, attach it and secrets to the request
    const authenticatedRequest = request as AuthenticatedRequest;
    authenticatedRequest.apiKey = providedApiKey;
    authenticatedRequest.secrets = secrets;

    return {
      isValid: true,
      request: authenticatedRequest
    };
  } catch (error) {
    console.error('Error validating API key:', error);
    return {
      isValid: false,
      request: request as AuthenticatedRequest,
      response: NextResponse.json(
        { 
          status: 'error', 
          message: 'Internal server error during authentication' 
        },
        { status: 500 }
      )
    };
  }
}

export function withApiKeyAuth(handler: (request: AuthenticatedRequest) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const authResult = await validateApiKey(request);
    
    if (!authResult.isValid) {
      return authResult.response!;
    }

    return handler(authResult.request);
  };
} 