'use client';

import { motion } from 'framer-motion';
import { AlertCircle, Loader2 } from 'lucide-react';
import React, { Component, memo, ReactNode } from 'react';

// ============================================================================
// LOADING FALLBACK — squelette sobre, aligné CODENLIGNE
// ============================================================================

const LoadingFallbackComponent = () => {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-white p-4"
      role="status"
      aria-live="polite"
      aria-label="Chargement en cours"
    >
      <div className="text-center max-w-md">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2
            className="h-8 w-8 text-primary animate-spin"
            strokeWidth={2}
            aria-hidden="true"
          />
          <p className="text-base text-ink-soft">Chargement en cours…</p>
        </motion.div>
      </div>
    </div>
  );
};

export const LoadingFallback = memo(LoadingFallbackComponent, () => true);

// ============================================================================
// ERROR BOUNDARY
// ============================================================================

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error :', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-surface-alt p-4">
          <div className="bg-white border border-border rounded-xl p-8 max-w-md w-full shadow-card">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle
                className="w-8 h-8 text-primary shrink-0"
                aria-hidden="true"
              />
              <h2 className="text-xl font-bold text-ink">
                Une erreur est survenue
              </h2>
            </div>

            <p className="text-ink-soft mb-4 text-base">
              Nous nous excusons pour ce désagrément. Une erreur inattendue s&apos;est produite.
              Vous pouvez réessayer ; si le problème persiste, contactez l&apos;assistance.
            </p>

            {process.env.NODE_ENV === 'development' && (
              <div className="bg-surface-alt border border-border rounded-md p-4 mb-4 max-h-48 overflow-y-auto">
                <p className="text-sm font-mono text-ink break-all">
                  {this.state.error.message}
                </p>
                {this.state.error.stack && (
                  <pre className="text-xs mt-2 text-ink-muted whitespace-pre-wrap">
                    {this.state.error.stack}
                  </pre>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={this.handleReset}
              className="btn-primary w-full"
            >
              Réessayer
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}