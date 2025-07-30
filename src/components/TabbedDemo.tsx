'use client';

import { useState } from 'react';
import SecretsDemo from './SecretsDemo';
import ApiKeyClient from './ApiKeyClient';

export default function TabbedDemo() {
  const [activeTab, setActiveTab] = useState<'secrets' | 'api-key'>('secrets');

  return (
    <>
      {/* Tabs for different demos */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex space-x-1 bg-white p-1 rounded-lg shadow-sm">
          <button
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'secrets'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setActiveTab('secrets')}
          >
            🔐 Secrets Demo
          </button>
          <button
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'api-key'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setActiveTab('api-key')}
          >
            🔑 API Key Demo
          </button>
        </div>
      </div>

      {/* Demo Content */}
      {activeTab === 'secrets' && <SecretsDemo />}
      {activeTab === 'api-key' && <ApiKeyClient />}
    </>
  );
} 