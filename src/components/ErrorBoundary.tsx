'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    
    // You could also log to an error reporting service here
    // reportErrorToService(error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-canvas">
          <div className="text-center p-8 max-w-md">
            <div className="text-brand text-6xl mb-6">😕</div>
            <h1 className="text-2xl font-bold text-fg mb-4">Something went wrong</h1>
            <p className="text-fg-muted mb-6">
              We're sorry, but an error occurred while rendering this page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-brand text-brand-fg rounded-md hover:bg-brand-hover transition-colors"
            >
              Refresh the page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 