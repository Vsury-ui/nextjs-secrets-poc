'use client';

import { useEffect } from 'react';

export default function AppInitializer() {
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🚀 Initializing application...');
        
        // Initialize secrets on app startup
        const response = await fetch('/api/init', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          console.log('✅ Application initialized successfully');
        } else {
          console.warn('⚠️ Application initialization failed, will retry on first request');
        }
      } catch (error) {
        console.warn('⚠️ Application initialization failed, will retry on first request:', error);
      }
    };

    initializeApp();
  }, []);

  // This component doesn't render anything
  return null;
} 