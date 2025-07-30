import SecretsDemo from '@/components/SecretsDemo';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🔐 Next.js Secrets Management POC
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A proof of concept demonstrating secure secret management in Next.js applications
            with GitHub integration for production environments.
          </p>
        </div>
        
        <SecretsDemo />
        
        <div className="mt-12 max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              📋 Setup Instructions
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Local Development
                </h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-gray-700 mb-2">
                    Create a <code className="bg-gray-200 px-1 rounded">.env.local</code> file in the root directory:
                  </p>
                  <pre className="text-sm text-gray-800 bg-white p-3 rounded border overflow-x-auto">
{`DATABASE_URL=postgresql://localhost:5432/myapp_dev
API_KEY=local_dev_api_key_12345
JWT_SECRET=local_jwt_secret_key_67890
REDIS_URL=redis://localhost:6379
STRIPE_SECRET_KEY=sk_test_local_stripe_key`}
                  </pre>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Production Setup
                </h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-gray-700 mb-2">
                    Set the following environment variables in your production environment:
                  </p>
                  <pre className="text-sm text-gray-800 bg-white p-3 rounded border overflow-x-auto">
{`GITHUB_TOKEN=your_github_personal_access_token
GITHUB_REPO_OWNER=your_github_username
GITHUB_REPO_NAME=your_repository_name
GITHUB_SECRETS_PATH=secrets.json  # Optional, defaults to secrets.json`}
                  </pre>
                  <p className="text-gray-700 mt-2">
                    Create a <code className="bg-gray-200 px-1 rounded">secrets.json</code> file in your GitHub repository:
                  </p>
                  <pre className="text-sm text-gray-800 bg-white p-3 rounded border overflow-x-auto">
{`{
  "databaseUrl": "postgresql://prod-db-url",
  "apiKey": "prod_api_key",
  "jwtSecret": "prod_jwt_secret",
  "redisUrl": "redis://prod-redis-url",
  "stripeSecretKey": "sk_live_prod_stripe_key"
}`}
                  </pre>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Security Features
                </h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Secrets are loaded server-side only and never exposed to the client</li>
                  <li>API responses only return status information, never actual secret values</li>
                  <li>Environment-specific loading (local .env vs GitHub in production)</li>
                  <li>Singleton pattern ensures secrets are loaded only once per application lifecycle</li>
                  <li>Middleware automatically initializes secrets on first request</li>
                  <li>TypeScript interfaces ensure type safety for secret access</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
