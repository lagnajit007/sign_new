'use client';

import React from 'react';
import ClientErrorBoundary from '@/components/ClientErrorBoundary';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { ClerkProvider } from '@clerk/nextjs';

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

  const content = (
    <>
      <ThemeProvider attribute={['class', 'data-theme']} defaultTheme="light" enableSystem disableTransitionOnChange>
        <ClientErrorBoundary>
          <div className="min-h-screen bg-background text-foreground">{children}</div>
          <Toaster position="bottom-right" richColors closeButton />
        </ClientErrorBoundary>
      </ThemeProvider>
    </>
  );

  return (
    <ClerkSafeBoundary fallback={content}>
      {/* Imported statically: a dynamic import changed the tree between server and
          client (shifting every useId below it), and Clerk's own router navigation
          is client-side, so there's no need for full page reloads. */}
      <ClerkProvider {...clerkProps}>{content}</ClerkProvider>
    </ClerkSafeBoundary>
  );
} 