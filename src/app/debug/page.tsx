'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Skip static prerendering: this page reads Clerk context at runtime and must
// not be evaluated with the build-time fallback publishable key.
export const dynamic = 'force-dynamic';

export default function DebugPage() {
  const [envVars, setEnvVars] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [clearStatus, setClearStatus] = useState('');

  useEffect(() => {
    // Collect relevant environment variables
    const vars: Record<string, string> = {};
    if (typeof window !== 'undefined') {
      // Only collect public env vars
      if (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
        vars['NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY'] = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.substring(0, 10) + '...';
      }
      vars['NODE_ENV'] = process.env.NODE_ENV || 'unknown';
      
      // Add browser info
      vars['USER_AGENT'] = navigator.userAgent;
      vars['BROWSER_TIME'] = new Date().toString();
      vars['TIMEZONE'] = Intl.DateTimeFormat().resolvedOptions().timeZone;
    }
    
    setEnvVars(vars);
    setIsLoading(false);
  }, []);

  const clearCookies = async () => {
    try {
      setClearStatus('Clearing...');
      const response = await fetch('/api/clear-session');
      const data = await response.json();
      setClearStatus(data.message || 'Cookies cleared');
      
      // Reload after a short delay
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } catch (error) {
      setClearStatus('Error clearing cookies');
      console.error(error);
    }
  };

  if (isLoading) {
    return <div className="p-8">Loading debug information...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Debug Information</h1>
      
      <div className="mb-8 bg-gray-100 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
        <pre className="bg-gray-900 text-white p-4 rounded overflow-x-auto">
          {JSON.stringify(envVars, null, 2)}
        </pre>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Actions</h2>
        <div className="flex flex-col space-y-4">
          <button 
            onClick={clearCookies}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
          >
            Clear All Clerk Cookies
          </button>
          {clearStatus && (
            <div className="mt-2 p-2 bg-gray-100 rounded">
              Status: {clearStatus}
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-8">
        <Link href="/" className="text-blue-500 hover:underline">
          Back to Home
        </Link>
      </div>
    </div>
  );
} 