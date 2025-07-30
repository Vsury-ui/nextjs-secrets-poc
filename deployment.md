# 🚀 Deployment Guide

This guide covers deploying the Next.js Secrets Management POC to various platforms.

## 📋 Prerequisites

Before deploying, ensure you have:

1. ✅ A GitHub repository with your secrets.json file
2. ✅ A GitHub Personal Access Token with `repo` scope
3. ✅ Your secrets.json file properly formatted
4. ✅ All required environment variables ready

## 🌐 Vercel Deployment

### Step 1: Connect Repository
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Select the repository containing this POC

### Step 2: Configure Environment Variables
In the Vercel project settings, add these environment variables:

```env
REPO_ACCESS_TOKEN=your_github_personal_access_token
REPO_OWNER=your_github_username
REPO_NAME=your_repository_name
SECRETS_FILE_PATH=secrets.json
NODE_ENV=production
```

### Step 3: Deploy
1. Vercel will automatically detect Next.js
2. Click "Deploy"
3. Wait for build to complete
4. Your app will be live at `https://your-project.vercel.app`

### Step 4: Verify Deployment
1. Visit your deployed URL
2. Check that secrets are loading from GitHub
3. Test the API endpoints
4. Verify no secrets are exposed in responses

## 🐳 Docker Deployment

### Step 1: Create Dockerfile
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### Step 2: Update next.config.ts
```typescript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    outputFileTracingRoot: undefined,
  },
};

export default nextConfig;
```

### Step 3: Build and Run
```bash
# Build the Docker image
docker build -t github-secrets-demo .

# Run the container with environment variables
docker run -p 3000:3000 \
      -e REPO_ACCESS_TOKEN=your_token \
    -e REPO_OWNER=your_username \
    -e REPO_NAME=your_repo \
    -e NODE_ENV=production \
  github-secrets-demo
```

## ☁️ AWS Deployment

### Step 1: Prepare for AWS
1. Install AWS CLI
2. Configure AWS credentials
3. Create an ECR repository

### Step 2: Build and Push to ECR
```bash
# Get ECR login token
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin your-account.dkr.ecr.us-east-1.amazonaws.com

# Build image
docker build -t github-secrets-demo .

# Tag image
docker tag github-secrets-demo:latest your-account.dkr.ecr.us-east-1.amazonaws.com/github-secrets-demo:latest

# Push to ECR
docker push your-account.dkr.ecr.us-east-1.amazonaws.com/github-secrets-demo:latest
```

### Step 3: Deploy to ECS
1. Create ECS cluster
2. Create task definition with environment variables
3. Create service
4. Configure load balancer

## 🔧 Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `REPO_ACCESS_TOKEN` | Yes | GitHub Personal Access Token | `ghp_xxxxxxxxxxxx` |
| `REPO_OWNER` | Yes | GitHub username or organization | `yourusername` |
| `REPO_NAME` | Yes | Repository name | `my-secrets-repo` |
| `SECRETS_FILE_PATH` | No | Path to secrets file in repo | `secrets.json` |
| `NODE_ENV` | Yes | Environment mode | `production` |
| `DEBUG` | No | Enable debug logging | `true` |

## 🔒 Security Checklist

Before deploying to production:

- [ ] GitHub token has minimal required permissions (`repo` scope only)
- [ ] Secrets.json file is not publicly accessible
- [ ] Environment variables are properly set
- [ ] HTTPS is enabled
- [ ] No secrets are logged or exposed
- [ ] Regular secret rotation is planned
- [ ] Monitoring is configured
- [ ] Error handling doesn't expose sensitive data

## 🧪 Testing Deployment

### Health Check Endpoint
```bash
curl https://your-app.com/api/secrets
```

Expected response:
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
  "environment": "production",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Test Secret Usage
```bash
curl -X POST https://your-app.com/api/secrets \
  -H "Content-Type: application/json" \
  -d '{"action": "authenticate"}'
```

## 🚨 Troubleshooting

### Common Deployment Issues

1. **Build Fails**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check for TypeScript errors

2. **Secrets Not Loading**
   - Verify GitHub token permissions
   - Check repository access
   - Validate secrets.json format

3. **Environment Variables Missing**
   - Double-check variable names
   - Ensure no typos
   - Verify platform-specific syntax

4. **CORS Issues**
   - Configure CORS in next.config.ts if needed
   - Check domain whitelist

### Debug Commands

```bash
# Check environment variables
echo $REPO_ACCESS_TOKEN

# Test GitHub API access
curl -H "Authorization: token $REPO_ACCESS_TOKEN" \
  https://api.github.com/repos/$REPO_OWNER/$REPO_NAME

# Check application logs
docker logs your-container-name
```

## 📊 Monitoring

### Recommended Monitoring
- Application health checks
- Secret loading success/failure rates
- API response times
- Error rates
- GitHub API rate limits

### Logging Best Practices
- Log secret loading status (not values)
- Monitor GitHub API usage
- Track authentication failures
- Alert on critical errors

## 🔄 CI/CD Integration

### GitHub Actions Example
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 📞 Support

For deployment issues:
1. Check the troubleshooting section
2. Review platform-specific documentation
3. Verify environment variable configuration
4. Test locally with production settings 