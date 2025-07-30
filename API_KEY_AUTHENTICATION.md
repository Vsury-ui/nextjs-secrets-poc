# 🔑 API Key Authentication Guide

This guide covers the API key authentication system implemented in the Next.js Secrets Management POC.

## 📋 Overview

The API key authentication system provides secure access to protected endpoints by validating API keys against server-side secrets. This ensures that only authorized clients can access sensitive operations.

## 🏗️ Architecture

### Components

1. **API Key Authentication Middleware** (`src/lib/apiKeyAuth.ts`)
   - Validates API keys against server-side secrets
   - Supports multiple authentication header formats
   - Provides reusable authentication wrapper

2. **Secure API Endpoints** (`src/app/api/secure/route.ts`)
   - Protected endpoints requiring API key authentication
   - Business logic using server-side secrets
   - Multiple action types for different operations

3. **Client Component** (`src/components/ApiKeyClient.tsx`)
   - Interactive demo for testing API key authentication
   - Local storage for API key persistence
   - Real-time API testing interface

## 🔐 Authentication Flow

### 1. Client Request
```javascript
// Using Authorization header (Bearer token)
fetch('/api/secure', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-api-key-here'
  },
  body: JSON.stringify({ action: 'getUserData' })
});

// Alternative: Using X-API-Key header
fetch('/api/secure', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'your-api-key-here'
  },
  body: JSON.stringify({ action: 'getUserData' })
});
```

### 2. Server Validation
```typescript
// Middleware validates API key against secrets
const authResult = await validateApiKey(request);

if (!authResult.isValid) {
  return authResult.response!; // Returns 401 error
}

// API key is valid, proceed with request
return handler(authResult.request);
```

### 3. Business Logic Execution
```typescript
// Handler has access to validated secrets
const secrets = request.secrets!;

// Use secrets for business operations
const userData = {
  status: 'success',
  data: {
    userId: 'user_123',
    serviceConfigured: secrets.databaseUrl ? 'Connected' : 'Not configured'
  }
};
```

## 🛠️ Implementation Details

### API Key Validation

The `validateApiKey` function:

1. **Extracts API Key**: From `Authorization: Bearer <key>` or `X-API-Key` header
2. **Loads Secrets**: Retrieves server-side secrets using `getSecrets()`
3. **Validates Key**: Compares provided key against stored `apiKey` secret
4. **Returns Result**: Success with authenticated request or error response

### Middleware Wrapper

The `withApiKeyAuth` function:

```typescript
export function withApiKeyAuth(handler: (request: AuthenticatedRequest) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const authResult = await validateApiKey(request);
    
    if (!authResult.isValid) {
      return authResult.response!;
    }

    return handler(authResult.request);
  };
}
```

### Secure Endpoint Example

```typescript
// Protected endpoint using middleware
export const POST = withApiKeyAuth(async (request: AuthenticatedRequest) => {
  const { action, data } = await request.json();
  const secrets = request.secrets!;

  switch (action) {
    case 'getUserData':
      return NextResponse.json({
        status: 'success',
        data: { userId: 'user_123', serviceConfigured: secrets.databaseUrl ? 'Connected' : 'Not configured' }
      });
    
    case 'processPayment':
      return NextResponse.json({
        status: 'success',
        data: { transactionId: 'txn_123', paymentProvider: secrets.stripeSecretKey ? 'Stripe' : 'Not configured' }
      });
  }
});
```

## 🧪 Available API Actions

### 1. Health Check (GET)
```bash
GET /api/secure
Authorization: Bearer your-api-key
```

**Response:**
```json
{
  "status": "success",
  "message": "Secure API is healthy",
  "data": {
    "authenticated": true,
    "apiKeyValid": true,
    "services": {
      "database": "configured",
      "api": "configured",
      "jwt": "configured",
      "redis": "configured",
      "stripe": "configured"
    }
  }
}
```

### 2. Get User Data (POST)
```bash
POST /api/secure
Authorization: Bearer your-api-key
Content-Type: application/json

{
  "action": "getUserData"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "User data retrieved successfully",
  "data": {
    "userId": "user_123",
    "email": "user@example.com",
    "permissions": ["read", "write"],
    "serviceConfigured": "Database connected",
    "apiConfigured": "API configured"
  }
}
```

### 3. Process Payment (POST)
```bash
POST /api/secure
Authorization: Bearer your-api-key
Content-Type: application/json

{
  "action": "processPayment",
  "data": {
    "amount": 29.99,
    "currency": "USD"
  }
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Payment processed successfully",
  "data": {
    "transactionId": "txn_abc123",
    "amount": 29.99,
    "currency": "USD",
    "paymentProvider": "Stripe"
  }
}
```

### 4. Generate Token (POST)
```bash
POST /api/secure
Authorization: Bearer your-api-key
Content-Type: application/json

{
  "action": "generateToken"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Token generated successfully",
  "data": {
    "token": "jwt_abc123def456",
    "expiresIn": "1h",
    "tokenType": "JWT"
  }
}
```

### 5. Cache Operation (POST)
```bash
POST /api/secure
Authorization: Bearer your-api-key
Content-Type: application/json

{
  "action": "cacheOperation",
  "data": {
    "operation": "set",
    "key": "user_preferences",
    "value": "dark_mode"
  }
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Cache operation completed",
  "data": {
    "operation": "set",
    "key": "user_preferences",
    "cacheProvider": "Redis"
  }
}
```

## 🔒 Security Features

### 1. Server-Side Validation
- API keys are validated against server-side secrets
- No client-side exposure of secret values
- Automatic middleware protection for all secure endpoints

### 2. Multiple Header Support
- `Authorization: Bearer <api-key>` (standard OAuth2 format)
- `X-API-Key: <api-key>` (custom header format)
- Flexible authentication header options

### 3. Error Handling
- Proper HTTP status codes (401 for unauthorized, 500 for server errors)
- No information leakage in error messages
- Development vs production error detail control

### 4. Type Safety
- TypeScript interfaces for authenticated requests
- Compile-time type checking for API responses
- IntelliSense support for development

## 🚀 Usage Examples

### Frontend Integration

```typescript
// React component example
const [apiKey, setApiKey] = useState('');

const callSecureApi = async (action: string, data?: any) => {
  const response = await fetch('/api/secure', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ action, data }),
  });

  return response.json();
};

// Usage
const userData = await callSecureApi('getUserData');
const payment = await callSecureApi('processPayment', { amount: 29.99 });
```

### cURL Examples

```bash
# Health check
curl -X GET http://localhost:3000/api/secure \
  -H "Authorization: Bearer your-api-key"

# Get user data
curl -X POST http://localhost:3000/api/secure \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"action": "getUserData"}'

# Process payment
curl -X POST http://localhost:3000/api/secure \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"action": "processPayment", "data": {"amount": 29.99}}'
```

### JavaScript/Node.js

```javascript
// Node.js example
const axios = require('axios');

const apiKey = 'your-api-key';
const baseURL = 'http://localhost:3000';

const secureApi = axios.create({
  baseURL,
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  },
});

// Usage
const getUserData = async () => {
  const response = await secureApi.post('/api/secure', {
    action: 'getUserData'
  });
  return response.data;
};

const processPayment = async (amount) => {
  const response = await secureApi.post('/api/secure', {
    action: 'processPayment',
    data: { amount, currency: 'USD' }
  });
  return response.data;
};
```

## 🧪 Testing

### Manual Testing

1. **Start the application:**
   ```bash
   npm run dev
   ```

2. **Navigate to the API Key Demo tab**

3. **Enter your API key** (from secrets.json or .env.local)

4. **Test different actions:**
   - Health Check
   - Get User Data
   - Process Payment
   - Generate Token
   - Cache Operation

### Automated Testing

```typescript
// Example test with Jest
describe('Secure API', () => {
  const apiKey = process.env.TEST_API_KEY;

  test('should require API key', async () => {
    const response = await fetch('/api/secure', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'getUserData' })
    });

    expect(response.status).toBe(401);
  });

  test('should accept valid API key', async () => {
    const response = await fetch('/api/secure', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({ action: 'getUserData' })
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.status).toBe('success');
  });
});
```

## 🚨 Error Handling

### Common Error Responses

1. **Missing API Key (401):**
   ```json
   {
     "status": "error",
     "message": "API key required. Use Authorization: Bearer <api-key> or X-API-Key header"
   }
   ```

2. **Invalid API Key (401):**
   ```json
   {
     "status": "error",
     "message": "Invalid API key"
   }
   ```

3. **Server Configuration Error (500):**
   ```json
   {
     "status": "error",
     "message": "API key not configured on server"
   }
   ```

4. **Invalid Action (400):**
   ```json
   {
     "status": "error",
     "message": "Invalid action. Supported actions: getUserData, processPayment, generateToken, cacheOperation"
   }
   ```

## 🔄 Best Practices

### 1. API Key Management
- Store API keys securely (environment variables, secrets management)
- Rotate API keys regularly
- Use different keys for different environments
- Never commit API keys to version control

### 2. Security Headers
- Use HTTPS in production
- Implement rate limiting
- Add CORS configuration if needed
- Consider API key expiration

### 3. Error Handling
- Don't expose internal errors to clients
- Log authentication failures for monitoring
- Implement proper HTTP status codes
- Provide meaningful error messages

### 4. Monitoring
- Track API key usage
- Monitor authentication failures
- Set up alerts for suspicious activity
- Log all secure API access

## 📊 Monitoring and Logging

### Recommended Metrics
- API key validation success/failure rates
- Endpoint usage by action type
- Response times for secure endpoints
- Error rates and types

### Logging Example
```typescript
// Add logging to middleware
console.log(`API Key validation: ${authResult.isValid ? 'SUCCESS' : 'FAILED'}`, {
  timestamp: new Date().toISOString(),
  ip: request.ip,
  userAgent: request.headers.get('user-agent'),
  endpoint: request.url,
});
```

## 🔧 Configuration

### Environment Variables
```env
# Required for API key validation
API_KEY=your-secure-api-key-here

# Optional: Customize error messages
NODE_ENV=production
```

### Docker Configuration
```dockerfile
# API key should be provided as environment variable
ENV API_KEY=your-docker-api-key
```

## 📞 Support

For API key authentication issues:
1. Verify API key is correctly configured in secrets
2. Check authentication header format
3. Ensure HTTPS is used in production
4. Review server logs for detailed error information
5. Test with the provided demo interface 