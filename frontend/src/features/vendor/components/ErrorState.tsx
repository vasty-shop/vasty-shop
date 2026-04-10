import React from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  RefreshCw,
  Home,
  WifiOff,
  ShieldAlert,
  ServerCrash,
  FileQuestion,
  XCircle,
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  error?: Error | string;
  onRetry?: () => void;
  onGoBack?: () => void;
  fullScreen?: boolean;
  type?: 'error' | 'network' | 'notfound' | 'forbidden' | 'server';
  retryLabel?: string;
  showDetails?: boolean;
}

const errorConfig: Record<
  NonNullable<ErrorStateProps['type']>,
  {
    icon: LucideIcon;
    color: string;
    defaultTitle: string;
    defaultMessage: string;
  }
> = {
  error: {
    icon: AlertCircle,
    color: 'from-red-500 to-orange-500',
    defaultTitle: 'Something went wrong',
    defaultMessage: 'An unexpected error occurred. Please try again.',
  },
  network: {
    icon: WifiOff,
    color: 'from-blue-500 to-cyan-500',
    defaultTitle: 'Connection Error',
    defaultMessage: 'Unable to connect to the server. Check your internet connection.',
  },
  notfound: {
    icon: FileQuestion,
    color: 'from-purple-500 to-pink-500',
    defaultTitle: 'Not Found',
    defaultMessage: 'The resource you are looking for could not be found.',
  },
  forbidden: {
    icon: ShieldAlert,
    color: 'from-yellow-500 to-orange-500',
    defaultTitle: 'Access Denied',
    defaultMessage: 'You do not have permission to access this resource.',
  },
  server: {
    icon: ServerCrash,
    color: 'from-red-500 to-pink-500',
    defaultTitle: 'Server Error',
    defaultMessage: 'The server encountered an error. Please try again later.',
  },
};

export const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  message,
  error,
  onRetry,
  onGoBack,
  fullScreen = false,
  type = 'error',
  retryLabel = 'Try Again',
  showDetails = false,
}) => {
  const config = errorConfig[type];
  const Icon = config.icon;

  const displayTitle = title || config.defaultTitle;
  const displayMessage = message || config.defaultMessage;

  const containerClasses = fullScreen
    ? 'min-h-screen flex items-center justify-center p-6'
    : 'min-h-[400px] flex items-center justify-center p-6';

  const errorString =
    typeof error === 'string' ? error : error?.message || error?.toString();

  return (
    <div className={containerClasses}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg"
      >
        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-xl">
          <div className="text-center space-y-6">
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-100 border border-red-200"
            >
              <Icon className="w-8 h-8 text-red-500" />
            </motion.div>

            {/* Title & Message */}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">
                {displayTitle}
              </h2>
              <p className="text-gray-600 text-base">{displayMessage}</p>
            </div>

            {/* Error Details */}
            {showDetails && errorString && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="rounded-xl p-4 border border-red-200 bg-red-50 overflow-hidden"
              >
                <div className="flex items-start space-x-2 text-left">
                  <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-red-600 mb-1">Error Details</p>
                    <p className="text-xs text-gray-700 font-mono break-all">{errorString}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="flex-1 px-6 py-3 bg-primary-lime hover:bg-primary-lime/90 text-white rounded-xl font-medium transition-all shadow-md flex items-center justify-center space-x-2 group"
                >
                  <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                  <span>{retryLabel}</span>
                </button>
              )}

              {onGoBack && (
                <button
                  onClick={onGoBack}
                  className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all flex items-center justify-center space-x-2 border border-gray-200"
                >
                  <Home className="w-5 h-5" />
                  <span>Go Back</span>
                </button>
              )}
            </div>

            {/* Help Text */}
            <p className="text-xs text-gray-500 pt-4 border-t border-gray-200">
              If this problem persists, please contact support for assistance.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Specialized Error States
export const NetworkError: React.FC<Omit<ErrorStateProps, 'type'>> = (props) => (
  <ErrorState {...props} type="network" />
);

export const NotFoundError: React.FC<Omit<ErrorStateProps, 'type'>> = (props) => (
  <ErrorState {...props} type="notfound" />
);

export const ForbiddenError: React.FC<Omit<ErrorStateProps, 'type'>> = (props) => (
  <ErrorState {...props} type="forbidden" />
);

export const ServerError: React.FC<Omit<ErrorStateProps, 'type'>> = (props) => (
  <ErrorState {...props} type="server" />
);
