import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to error reporting service (e.g., Sentry)
    // Sentry.captureException(error, { extra: errorInfo });
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  private handleGoHome = () => {
    window.location.href = '/vendor';
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, errorInfo } = this.state;

      return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-pink-900/20" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.1),transparent_50%)]" />

          {/* Animated background orbs */}
          <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 w-full max-w-2xl"
          >
            {/* Glass Card */}
            <div className="glass-solid rounded-2xl p-8 md:p-12 border border-white/10 shadow-2xl backdrop-blur-xl">
              <div className="text-center space-y-6">
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30"
                >
                  <AlertTriangle className="w-10 h-10 text-red-400" />
                </motion.div>

                {/* Title */}
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent mb-2">
                    Oops! Something went wrong
                  </h1>
                  <p className="text-white/60 text-lg">
                    We encountered an unexpected error. Don't worry, we're on it!
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="glass rounded-xl p-4 border border-red-500/20 bg-red-500/10">
                    <div className="flex items-start space-x-3">
                      <Bug className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                      <div className="text-left flex-1">
                        <p className="text-sm font-semibold text-red-400 mb-1">
                          Error Details
                        </p>
                        <p className="text-xs text-white/70 font-mono break-all">
                          {error.toString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    onClick={this.handleReset}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl font-medium transition-all shadow-lg shadow-purple-500/30 flex items-center justify-center space-x-2 group"
                  >
                    <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                    <span>Try Again</span>
                  </button>

                  <button
                    onClick={this.handleReload}
                    className="flex-1 px-6 py-3 glass hover:bg-white/10 rounded-xl font-medium transition-all flex items-center justify-center space-x-2 border border-white/10"
                  >
                    <RefreshCw className="w-5 h-5" />
                    <span>Reload Page</span>
                  </button>

                  <button
                    onClick={this.handleGoHome}
                    className="sm:flex-none px-6 py-3 glass hover:bg-white/10 rounded-xl font-medium transition-all flex items-center justify-center space-x-2 border border-white/10"
                  >
                    <Home className="w-5 h-5" />
                    <span>Go Home</span>
                  </button>
                </div>

                {/* Additional Info */}
                <div className="pt-6 border-t border-white/10">
                  <p className="text-sm text-white/50">
                    If this problem persists, please contact support with the error details above.
                  </p>
                </div>

                {/* Development Info - Only show in development */}
                {process.env.NODE_ENV === 'development' && errorInfo && (
                  <details className="text-left">
                    <summary className="cursor-pointer text-sm text-white/60 hover:text-white/80 transition-colors">
                      Show technical details (Dev Only)
                    </summary>
                    <div className="mt-3 p-4 glass rounded-lg border border-white/10">
                      <pre className="text-xs text-white/70 font-mono overflow-auto max-h-64">
                        {errorInfo.componentStack}
                      </pre>
                    </div>
                  </details>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}
