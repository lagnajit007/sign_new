'use client';

import React from 'react';
import StyledComponentsRegistry from '@/lib/registry';
import ClientErrorBoundary from '@/components/ClientErrorBoundary';
import GlobalPreloader from '@/components/GlobalPreloader';
import dynamic from 'next/dynamic';

// Dynamically import ClerkProvider to avoid issues during build time
const ClerkProviderWithFallback = dynamic(
  () => import('@clerk/nextjs').then((mod) => {
    const { ClerkProvider } = mod;
    return ({ children, ...props }: { children: React.ReactNode } & Record<string, any>) => (
      <ClerkProvider {...props}>{children}</ClerkProvider>
    );
  }),
  {
    ssr: true,
    loading: () => null,
  }
);

interface ClientWrapperProps {
  children: React.ReactNode;
  clerkProps: Record<string, any>;
}

export default function ClientWrapper({ children, clerkProps }: ClientWrapperProps) {
  // Enhanced Clerk props with smarter navigation handling
  const enhancedClerkProps = {
    ...clerkProps,
    navigate: (to: string) => {
      // Use standard navigation for most routes, but hard redirect for dashboard
      // to ensure proper authentication and state handling
      if (to.startsWith('/dashboard')) {
        window.location.href = to;
      } else {
        // For non-dashboard routes, use standard URL API
        window.location.href = to;
      }
    }
  };

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