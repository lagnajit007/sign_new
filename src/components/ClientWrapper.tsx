'use client';

import React from 'react';
import StyledComponentsRegistry from '@/lib/registry';
import ClientErrorBoundary from '@/components/ClientErrorBoundary';
import GlobalPreloader from '@/components/GlobalPreloader';
import dynamic from 'next/dynamic';

// Dynamically import ClerkProvider with SSR enabled. An error boundary wraps
// it to catch any initialization failures so Clerk never crashes the page.
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

// Guards against ClerkProvider render errors during SSR/CSR. If Clerk fails,
// child components (Sidebar, etc.) still render without Clerk context, so they
// must handle missing context gracefully (which Next.js already does for hooks
// like useAuth — they return default values instead of throwing).
class ClerkSafeBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? null;
    }
    return this.props.children;
  }
}

interface ClientWrapperProps {
  children: React.ReactNode;
  clerkProps: Record<string, any>;
}

export default function ClientWrapper({ children, clerkProps }: ClientWrapperProps) {
  const enhancedClerkProps = {
    ...clerkProps,
    navigate: (to: string) => { window.location.href = to; }
  };

  const content = (
    <StyledComponentsRegistry>
      <ClientErrorBoundary>
        <div className="min-h-screen bg-background text-foreground">
          <GlobalPreloader />
          {children}
        </div>
      </ClientErrorBoundary>
    </StyledComponentsRegistry>
  );

  return (
    <ClerkSafeBoundary fallback={content}>
      <ClerkProviderWithFallback {...enhancedClerkProps}>
        {content}
      </ClerkProviderWithFallback>
    </ClerkSafeBoundary>
  );
} 