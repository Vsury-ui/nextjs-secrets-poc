# 🐳 Docker Deployment Guide

This guide covers deploying the Next.js Secrets Management POC using Docker.

## 📋 Prerequisites

Before deploying with Docker, ensure you have:

1. ✅ Docker installed and running
2. ✅ Docker Compose installed (optional, for easier management)
3. ✅ A GitHub repository with your secrets.json file
4. ✅ A GitHub Personal Access Token with `repo` scope
5. ✅ Your secrets.json file properly formatted

## 🚀 Quick Start

### Option 1: Using Docker Compose (Recommended)

1. **Create environment file**
   ```bash
   cp .env.example .env
   ```

2. **Edit .env file with your values**
   ```env
   GITHUB_TOKEN=your_github_personal_access_token
   GITHUB_REPO_OWNER=your_github_username
   GITHUB_REPO_NAME=your_repository_name
   GITHUB_SECRETS_PATH=secrets.json
   ```

3. **Build and run with Docker Compose**
   ```bash
   npm run docker:compose
   ```

4. **Access your application**
   - Open http://localhost:3000 in your browser
   - The API will be available at http://localhost:3000/api/secrets

### Option 2: Using Docker directly

1. **Build the Docker image**
   ```bash
   npm run docker:build
   ```

2. **Run the container**
   ```bash
   npm run docker:run
   ```

   Or manually with environment variables:
   ```bash
   docker run -p 3000:3000 \
     -e GITHUB_TOKEN=your_token \
     -e GITHUB_REPO_OWNER=your_username \
     -e GITHUB_REPO_NAME=your_repo \
     -e NODE_ENV=production \
     github-secrets-demo
   ```

## 🔧 Configuration Files

### Dockerfile
The Dockerfile is optimized for Next.js 15 with:
- Multi-stage build for smaller image size
- Standalone output for better performance
- Non-root user for security
- Alpine Linux for minimal footprint

### docker-compose.yml
Includes:
- Environment variable configuration
- Health checks
- Automatic restart policy
- Port mapping

### .dockerignore
Excludes unnecessary files from the build context:
- node_modules
- .next build output
- Environment files
- Git files
- Documentation

## 🌐 Production Deployment

### Docker Hub

1. **Build and tag your image**
   ```bash
   docker build -t yourusername/github-secrets-demo:latest .
   ```

2. **Push to Docker Hub**
   ```bash
   docker push yourusername/github-secrets-demo:latest
   ```

3. **Deploy on any platform**
   ```bash
   docker run -p 3000:3000 \
     -e GITHUB_TOKEN=your_token \
     -e GITHUB_REPO_OWNER=your_username \
     -e GITHUB_REPO_NAME=your_repo \
     yourusername/github-secrets-demo:latest
   ```

### AWS ECS

1. **Create ECR repository**
   ```bash
   aws ecr create-repository --repository-name github-secrets-demo
   ```

2. **Build and push to ECR**
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

3. **Create ECS task definition with environment variables**
4. **Deploy to ECS cluster**

### Google Cloud Run

1. **Build and push to Google Container Registry**
   ```bash
   # Build image
   docker build -t gcr.io/your-project/github-secrets-demo .

   # Push to GCR
   docker push gcr.io/your-project/github-secrets-demo
   ```

2. **Deploy to Cloud Run**
   ```bash
   gcloud run deploy github-secrets-demo \
     --image gcr.io/your-project/github-secrets-demo \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --set-env-vars GITHUB_TOKEN=your_token,GITHUB_REPO_OWNER=your_username,GITHUB_REPO_NAME=your_repo
   ```

## 🔒 Security Best Practices

### Environment Variables
- Never commit secrets to version control
- Use Docker secrets or environment variables
- Rotate GitHub tokens regularly
- Use least privilege principle for GitHub tokens

### Container Security
- Run as non-root user (already configured)
- Use specific image tags, not `latest`
- Regularly update base images
- Scan images for vulnerabilities

### Network Security
- Use internal networks when possible
- Expose only necessary ports
- Use reverse proxy for SSL termination
- Implement rate limiting

## 🧪 Testing

### Health Check
```bash
curl http://localhost:3000/api/secrets
```

### Test Secret Loading
```bash
curl -X POST http://localhost:3000/api/secrets \
  -H "Content-Type: application/json" \
  -d '{"action": "authenticate"}'
```

### Container Logs
```bash
# Docker Compose
docker-compose logs -f app

# Docker
docker logs -f container_name
```

## 🚨 Troubleshooting

### Common Issues

1. **Build fails**
   ```bash
   # Check Docker version
   docker --version
   
   # Clean build cache
   docker system prune -a
   
   # Rebuild without cache
   docker build --no-cache -t github-secrets-demo .
   ```

2. **Container won't start**
   ```bash
   # Check logs
   docker logs container_name
   
   # Verify environment variables
   docker exec container_name env | grep GITHUB
   ```

3. **Secrets not loading**
   - Verify GitHub token permissions
   - Check repository access
   - Validate secrets.json format
   - Check network connectivity

4. **Port already in use**
   ```bash
   # Change port mapping
   docker run -p 3001:3000 github-secrets-demo
   ```

### Debug Commands

```bash
# Enter running container
docker exec -it container_name sh

# Check container resources
docker stats

# Inspect container configuration
docker inspect container_name

# Check image layers
docker history github-secrets-demo
```

## 📊 Monitoring

### Health Checks
The container includes a health check that:
- Tests the `/api/secrets` endpoint
- Runs every 30 seconds
- Times out after 10 seconds
- Retries 3 times before marking unhealthy

### Logging
- Application logs are available via `docker logs`
- Use structured logging for better monitoring
- Consider log aggregation for production

### Metrics
Monitor:
- Container resource usage
- Application response times
- Error rates
- GitHub API rate limits

## 🔄 CI/CD Integration

### GitHub Actions Example
```yaml
name: Build and Deploy Docker Image

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2
      
      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}
      
      - name: Build and push Docker image
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: yourusername/github-secrets-demo:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

## 📞 Support

For Docker deployment issues:
1. Check the troubleshooting section
2. Verify Docker and Docker Compose versions
3. Review container logs
4. Test with minimal configuration
5. Check GitHub token permissions

## 📝 Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GITHUB_TOKEN` | Yes | - | GitHub Personal Access Token |
| `GITHUB_REPO_OWNER` | Yes | - | GitHub username or organization |
| `GITHUB_REPO_NAME` | Yes | - | Repository name |
| `GITHUB_SECRETS_PATH` | No | `secrets.json` | Path to secrets file in repo |
| `NODE_ENV` | Yes | `production` | Environment mode |
| `NEXT_TELEMETRY_DISABLED` | No | `1` | Disable Next.js telemetry |
| `PORT` | No | `3000` | Application port |
| `HOSTNAME` | No | `0.0.0.0` | Application hostname | 