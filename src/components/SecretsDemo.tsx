'use client';

import { useState, useEffect } from 'react';

interface SecretsInfo {
  status: string;
  message: string;
  secretsConfigured: {
    databaseUrl: string;
    apiKey: string;
    jwtSecret: string;
    redisUrl: string;
    stripeSecretKey: string;
  };
  environment: string;
  timestamp: string;
}

interface ApiResponse {
  status: string;
  message: string;
  token?: string;
  databaseType?: string;
  error?: string;
}

export default function SecretsDemo() {
  const [secretsInfo, setSecretsInfo] = useState<SecretsInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);

  useEffect(() => {
    fetchSecretsInfo();
  }, []);

  const fetchSecretsInfo = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/secrets');
      const data = await response.json();
      
      if (response.ok) {
        setSecretsInfo(data);
        setError(null);
      } else {
        setError(data.message || 'Failed to fetch secrets info');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const testAuthentication = async () => {
    try {
      const response = await fetch('/api/secrets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'authenticate' }),
      });
      
      const data = await response.json();
      setApiResponse(data);
    } catch (err) {
      setApiResponse({ status: 'error', message: 'Network error occurred' });
    }
  };

  const testDatabase = async () => {
    try {
      const response = await fetch('/api/secrets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'database' }),
      });
      
      const data = await response.json();
      setApiResponse(data);
    } catch (err) {
      setApiResponse({ status: 'error', message: 'Network error occurred' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          🔐 Secrets Management Demo
        </h2>
        
        <div className="mb-4">
          <p className="text-gray-600">
            This demo shows how secrets are securely managed in Next.js:
          </p>
          <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
            <li>Local development: Secrets loaded from <code className="bg-gray-100 px-1 rounded">.env.local</code></li>
            <li>Production: Secrets fetched from GitHub repository</li>
            <li>Secrets are never exposed in client-side code or API responses</li>
            <li>Server-side only access to actual secret values</li>
          </ul>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
            <p className="text-red-800">❌ {error}</p>
          </div>
        )}

        {secretsInfo && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                ✅ Secrets Status
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {Object.entries(secretsInfo.secretsConfigured).map(([key, status]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                    </span>
                    <span className={status.includes('✅') ? 'text-green-600' : 'text-red-600'}>
                      {status}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-sm text-gray-600">
                <p><strong>Environment:</strong> {secretsInfo.environment}</p>
                <p><strong>Last Updated:</strong> {new Date(secretsInfo.timestamp).toLocaleString()}</p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">
                🧪 Test Secret Usage
              </h3>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={testAuthentication}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Test Authentication
                  </button>
                  <button
                    onClick={testDatabase}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    Test Database Connection
                  </button>
                </div>
                
                {apiResponse && (
                  <div className="mt-4 p-3 bg-white rounded border">
                    <h4 className="font-medium text-gray-800 mb-2">API Response:</h4>
                    <pre className="text-sm text-gray-700 bg-gray-50 p-2 rounded overflow-x-auto">
                      {JSON.stringify(apiResponse, null, 2)}
                    </pre>
                    <p className="text-xs text-gray-500 mt-2">
                      Note: Actual secret values are never returned in API responses
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                🔒 Security Features
              </h3>
              <ul className="list-disc list-inside text-yellow-800 space-y-1">
                <li>Secrets are loaded server-side only</li>
                <li>No secret values are bundled in client-side JavaScript</li>
                <li>API responses only return status information, never actual secrets</li>
                <li>Environment-specific secret loading (local vs production)</li>
                <li>Singleton pattern ensures secrets are loaded only once</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 