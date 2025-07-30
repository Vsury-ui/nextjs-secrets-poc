# 🔐 Next.js Secrets Management POC

A proof of concept demonstrating secure secret management in Next.js applications with GitHub integration for production environments.

## 🚀 Features

- **Environment-specific secret loading**: Local development uses `.env.local`, production fetches from GitHub
- **Server-side only access**: Secrets are never exposed in client-side code or API responses
- **GitHub integration**: Production secrets are fetched from a GitHub repository
- **TypeScript support**: Full type safety for secret access
- **Singleton pattern**: Secrets are loaded only once per application lifecycle
- **Middleware integration**: Automatic secret initialization on application startup

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Local Dev     │    │   Production     │    │   Client Side   │
│                 │    │                  │    │                 │
│  .env.local     │    │  GitHub Repo     │    │  React App      │
│  ┌─────────────┐│    │  ┌──────────────┐│    │  ┌─────────────┐│
│  │ DATABASE_URL││    │  │ secrets.json ││    │  │ UI Only     ││
│  │ API_KEY     ││    │  │ (encrypted)  ││    │  │ No Secrets  ││
│  │ JWT_SECRET  ││    │  │              ││    │  │             ││
│  └─────────────┘│    │  └──────────────┘│    │  └─────────────┘│
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Server Side   │
                    │                 │
                    │ SecretsManager  │
                    │ ┌─────────────┐ │
                    │ │ Singleton   │ │
                    │ │ Pattern     │ │
                    │ └─────────────┘ │
                    └─────────────────┘
```

## 📦 Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd github-secrets-demo
```

2. Install dependencies:
```bash
npm install
```

3. Set up local environment:
```bash
cp .env.local.example .env.local
# Edit .env.local with your local secrets
```

4. Run the development server:
```bash
npm run dev
```

## 🔧 Configuration

### Local Development

Create a `.env.local` file in the root directory:

```env
DATABASE_URL=postgresql://localhost:5432/myapp_dev
API_KEY=local_dev_api_key_12345
JWT_SECRET=local_jwt_secret_key_67890
REDIS_URL=redis://localhost:6379
STRIPE_SECRET_KEY=sk_test_local_stripe_key
```

### Production Setup

1. **GitHub Repository Setup**:
   - Create a `secrets.json` file in your GitHub repository
   - Use the format from `secrets.example.json`

2. **Environment Variables**:
   Set these in your production environment (e.g., Vercel, Netlify, etc.):
   ```env
   GITHUB_TOKEN=your_github_personal_access_token
   GITHUB_REPO_OWNER=your_github_username
   GITHUB_REPO_NAME=your_repository_name
   GITHUB_SECRETS_PATH=secrets.json  # Optional, defaults to secrets.json
   ```

3. **GitHub Token**:
   - Create a Personal Access Token with `repo` scope
   - For private repositories, ensure the token has access

## 🔒 Security Features

### Client-Side Protection
- ✅ Secrets are loaded server-side only
- ✅ No secret values in client-side JavaScript bundles
- ✅ API responses only return status information
- ✅ TypeScript interfaces prevent accidental exposure

### Server-Side Security
- ✅ Singleton pattern ensures single initialization
- ✅ Environment-specific loading logic
- ✅ Error handling without exposing sensitive data
- ✅ Middleware integration for automatic setup

### Production Security
- ✅ GitHub repository-based secret storage
- ✅ Environment variable configuration
- ✅ No hardcoded secrets in codebase
- ✅ Secure token-based authentication

## 🧪 Testing the POC

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Open the application**:
   Navigate to `http://localhost:3000`

3. **Test the demo**:
   - View secrets status
   - Test authentication endpoint
   - Test database connection endpoint
   - Verify no secrets are exposed in responses

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── secrets/
│   │       └── route.ts          # API endpoints for secret testing
│   ├── page.tsx                  # Main page with demo
│   └── layout.tsx                # App layout
├── components/
│   └── SecretsDemo.tsx           # React component for demo UI
├── lib/
│   └── secrets.ts                # Core secrets management logic
└── middleware.ts                 # Middleware for secret initialization
```

## 🔍 API Endpoints

### GET /api/secrets
Returns the status of configured secrets without exposing actual values.

**Response**:
```json
{
  "status": "success",
  "message": "Secrets are properly configured",
  "secretsConfigured": {
    "databaseUrl": "✅ Configured",
    "apiKey": "✅ Configured",
    "jwtSecret": "✅ Configured",
    "redisUrl": "✅ Configured",
    "stripeSecretKey": "✅ Configured"
  },
  "environment": "development",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### POST /api/secrets
Test secret usage with different actions.

**Request**:
```json
{
  "action": "authenticate" | "database"
}
```

**Response**:
```json
{
  "status": "success",
  "message": "Authentication successful",
  "token": "jwt_token_using_abc123..."
}
```

## 🚀 Deployment

### Vercel
1. Connect your GitHub repository
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### Netlify
1. Connect your GitHub repository
2. Set environment variables in Netlify dashboard
3. Deploy automatically on push

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 🔧 Customization

### Adding New Secrets

1. Update the `AppSecrets` interface in `src/lib/secrets.ts`:
```typescript
export interface AppSecrets {
  databaseUrl: string;
  apiKey: string;
  jwtSecret: string;
  redisUrl: string;
  stripeSecretKey: string;
  // Add your new secret here
  newSecret: string;
}
```

2. Update the `loadFromEnv` method:
```typescript
private loadFromEnv(): void {
  this.secrets = {
    // ... existing secrets
    newSecret: process.env.NEW_SECRET || '',
  };
}
```

3. Add to your `.env.local` and `secrets.json` files

### Custom GitHub Integration

Modify the `loadFromGitHub` method in `src/lib/secrets.ts` to:
- Use different authentication methods
- Fetch from different file formats
- Implement caching strategies
- Add encryption/decryption

## 🛡️ Security Best Practices

1. **Never commit secrets to version control**
2. **Use environment-specific secret management**
3. **Implement proper error handling without exposing sensitive data**
4. **Regularly rotate secrets and tokens**
5. **Use least privilege principle for GitHub tokens**
6. **Monitor and log secret access (without logging values)**
7. **Implement proper validation for secret values**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Troubleshooting

### Common Issues

1. **"GitHub configuration missing"**
   - Ensure all required environment variables are set
   - Verify GitHub token has correct permissions

2. **"Failed to fetch secrets from GitHub"**
   - Check repository visibility and token access
   - Verify secrets.json file exists and is valid JSON

3. **"Missing required secrets"**
   - Ensure all secrets are defined in .env.local or secrets.json
   - Check for typos in secret names

### Debug Mode

Enable debug logging by setting:
```env
DEBUG=true
```

This will show additional information about secret loading (without exposing values).

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review the security best practices
3. Open an issue in the repository
