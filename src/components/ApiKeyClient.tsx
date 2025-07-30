'use client';

import { useState, useEffect } from 'react';

interface SecureApiResponse {
  status: string;
  message: string;
  data?: Record<string, unknown>;
  error?: string;
  timestamp?: string;
}

export default function ApiKeyClient() {
  const [apiKey, setApiKey] = useState('');
  const [selectedAction, setSelectedAction] = useState('getUserData');
  const [response, setResponse] = useState<SecureApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load API key from localStorage on component mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('demo-api-key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
      setIsAuthenticated(true);
    }
  }, []);

  const saveApiKey = (key: string) => {
    localStorage.setItem('demo-api-key', key);
    setApiKey(key);
    setIsAuthenticated(true);
  };

  const clearApiKey = () => {
    localStorage.removeItem('demo-api-key');
    setApiKey('');
    setIsAuthenticated(false);
    setResponse(null);
    setError(null);
  };

  const callSecureApi = async (action: string, data?: Record<string, unknown>) => {
    if (!apiKey) {
      setError('API key is required');
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const response = await fetch('/api/secure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          // Alternative: 'X-API-Key': apiKey,
        },
        body: JSON.stringify({ action, data }),
      });

      const result = await response.json();

      if (response.ok) {
        setResponse(result);
      } else {
        setError(result.message || 'API call failed');
        setResponse(result);
      }
    } catch {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const testHealthCheck = async () => {
    if (!apiKey) {
      setError('API key is required');
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const response = await fetch('/api/secure', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      const result = await response.json();

      if (response.ok) {
        setResponse(result);
      } else {
        setError(result.message || 'Health check failed');
        setResponse(result);
      }
    } catch {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getActionData = (action: string): Record<string, unknown> | undefined => {
    switch (action) {
      case 'processPayment':
        return { amount: 29.99, currency: 'USD' };
      case 'cacheOperation':
        return { operation: 'set', key: 'user_preferences', value: 'dark_mode' };
      default:
        return undefined;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          🔑 API Key Authentication Demo
        </h2>
        
        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            This demo shows how to use API key authentication to access secure endpoints:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-1">
            <li>API key is required for all secure endpoints</li>
            <li>Keys can be sent via Authorization header or X-API-Key header</li>
            <li>Secrets are used server-side to validate API keys</li>
            <li>Secure endpoints can access all configured secrets</li>
          </ul>
        </div>

        {/* API Key Input */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">
            🔐 API Key Configuration
          </h3>
          
          {!isAuthenticated ? (
            <div className="space-y-3">
              <div>
                <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
                  Enter API Key:
                </label>
                <input
                  type="password"
                  id="apiKey"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your API key"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={() => saveApiKey(apiKey)}
                disabled={!apiKey.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Save API Key
              </button>
              <p className="text-sm text-gray-600">
                💡 <strong>Demo Tip:</strong> Use the API key from your secrets.json file
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <span className="text-green-600">✅ API Key configured</span>
                <button
                  onClick={clearApiKey}
                  className="text-sm text-red-600 hover:text-red-800 underline"
                >
                  Clear API Key
                </button>
              </div>
              <p className="text-sm text-gray-600">
                API key is stored locally and will be used for all requests
              </p>
            </div>
          )}
        </div>

        {/* API Testing */}
        {isAuthenticated && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
            <h3 className="text-lg font-semibold text-green-800 mb-3">
              🧪 Test Secure API Endpoints
            </h3>
            
            <div className="space-y-4">
              {/* Health Check */}
              <div>
                <button
                  onClick={testHealthCheck}
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                >
                  {loading ? 'Testing...' : 'Health Check'}
                </button>
                <p className="text-sm text-gray-600 mt-1">
                  Test API connectivity and authentication
                </p>
              </div>

              {/* Action Selection */}
              <div>
                <label htmlFor="action" className="block text-sm font-medium text-gray-700 mb-1">
                  Select Action:
                </label>
                <select
                  id="action"
                  value={selectedAction}
                  onChange={(e) => setSelectedAction(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="getUserData">Get User Data</option>
                  <option value="processPayment">Process Payment</option>
                  <option value="generateToken">Generate Token</option>
                  <option value="cacheOperation">Cache Operation</option>
                </select>
              </div>

              {/* Execute Action */}
              <div>
                <button
                  onClick={() => callSecureApi(selectedAction, getActionData(selectedAction))}
                  disabled={loading}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400 transition-colors"
                >
                  {loading ? 'Executing...' : `Execute ${selectedAction}`}
                </button>
                <p className="text-sm text-gray-600 mt-1">
                  Call the secure API with the selected action
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
            <p className="text-red-800">❌ {error}</p>
          </div>
        )}

        {/* Response Display */}
        {response && (
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
            <h4 className="font-medium text-gray-800 mb-2">API Response:</h4>
            <pre className="text-sm text-gray-700 bg-white p-3 rounded border overflow-x-auto">
              {JSON.stringify(response, null, 2)}
            </pre>
            <div className="mt-3 text-xs text-gray-500 space-y-1">
              <p>✅ <strong>Security Note:</strong> Actual secret values are never returned in API responses</p>
              <p>🔐 <strong>Authentication:</strong> API key is validated against server-side secrets</p>
              <p>🛡️ <strong>Protection:</strong> All sensitive operations require valid API key</p>
            </div>
          </div>
        )}

        {/* Security Information */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mt-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            🔒 Security Features
          </h3>
          <ul className="list-disc list-inside text-yellow-800 space-y-1">
            <li>API key validation against server-side secrets</li>
            <li>Support for both Authorization and X-API-Key headers</li>
            <li>Automatic request authentication middleware</li>
            <li>Secrets are never exposed in client-side code</li>
            <li>All sensitive operations require valid API key</li>
            <li>Proper error handling without information leakage</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 