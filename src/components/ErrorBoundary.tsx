'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
          <h2 className="text-xl font-display text-cream mb-4">문제가 발생했습니다</h2>
          <p className="text-cream-muted mb-6">{this.state.error?.message}</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="btn btn-primary"
          >
            다시 시도
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
