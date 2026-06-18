'use client';

import dynamic from 'next/dynamic';

// Dynamically import ErrorBoundary component
const ErrorBoundary = dynamic(() => import('./ErrorBoundary'), { ssr: false });

export default function ClientErrorBoundary({ children }: { children: React.ReactNode }) {
  return <ErrorBoundary>{children}</ErrorBoundary>;
} 