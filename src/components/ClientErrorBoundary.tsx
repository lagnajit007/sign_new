'use client';

import ErrorBoundary from './ErrorBoundary';

// Imported directly (not via next/dynamic with ssr:false) so page content is
// still server-rendered; the boundary only takes over after a client error.
export default function ClientErrorBoundary({ children }: { children: React.ReactNode }) {
  return <ErrorBoundary>{children}</ErrorBoundary>;
}
