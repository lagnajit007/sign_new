'use client';

import React, { useEffect, useState } from 'react';
import StyledComponentsRegistry from '@/lib/registry';
import ClientErrorBoundary from '@/components/ClientErrorBoundary';
import GlobalPreloader from '@/components/GlobalPreloader';
import dynamic from 'next/dynamic';

// Check if Clerk key is valid (basic format check for pk_test_* or pk_live_*)
function isValidClerkKey(key?: string): boolean {
  return Boolean(key && typeof key === 'string' && key.startsWith('pk_') && key.length > 20);
}

// Dynamically import ClerkProvider — SSR disabled to avoid server-side crashes
// when Clerk keys are missing/invalid in production
const ClerkProviderWithFallback = dynamic(
  () => import('@clerk/nextjs').then((mod) => {
    const { ClerkProvider } = mod;
    return ({ children, ...props }: { children: React.ReactNode } & Record<string, any>) => (
      <ClerkProvider {...props}>{children}</ClerkProvider>
    );
  }),
  {
    ssr: false,
    loading: () => null,
  }
);

interface ClientWrapperProps {
  children: React.ReactNode;
  clerkProps: Record<string, any>;
}

export default function ClientWrapper({ children, clerkProps }: ClientWrapperProps) {
  const [clerkReady, setClerkReady] = useState(false);
  const [clerkError, setClerkError] = useState<Error | null>(null);

  useEffect(() => {
    // Only initialize Clerk on client side after hydration
    const key = clerkProps?.publishableKey;
    if (isValidClerkKey(key)) {
      setClerkReady(true);
    } else {
      console.warn('Clerk publishableKey missing or invalid — ClerkProvider will not mount');
      setClerkError(new Error('Clerk not configured'));
    }
  }, [clerkProps?.publishableKey]);

  // Enhanced Clerk props with smarter navigation handling
  const enhancedClerkProps = {
    ...clerkProps,
    navigate: (to: string) => {
      if (to.startsWith('/dashboard')) {
        window.location.href = to;
      } else {
        window.location.href = to;
      }
    }
  };

  // If Clerk isn't ready or key invalid, render children without ClerkProvider
  // This prevents server-side crashes while keeping the UI functional
  if (!clerkReady) {
    return (
      <StyledComponentsRegistry>
        <ClientErrorBoundary>
          <div className="min-h-screen bg-background text-foreground">
            <GlobalPreloader />
            {children}
          </div>
        </ClientErrorBoundary>
      </StyledComponentsRegistry>
    );
  }

  return (
    <ClerkProviderWithFallback {...enhancedClerkProps}>
      <StyledComponentsRegistry>
        <ClientErrorBoundary>
          <div className="min-h-screen bg-background text-foreground">
            <GlobalPreloader />
            {children}
          </div>
        </ClientErrorBoundary>
      </StyledComponentsRegistry>
    </ClerkProviderWithFallback>
  );
} 