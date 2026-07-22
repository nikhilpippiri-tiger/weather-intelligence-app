import React from 'react';
import { AlertTriangle, RefreshCw, Search } from 'lucide-react';

interface ErrorAlertProps {
  message: string;
  onRetry?: () => void;
  onSearchFallback?: (cityName: string) => void;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  message,
  onRetry,
  onSearchFallback,
}) => {
  return (
    <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 sm:p-8 text-rose-900 shadow-sm max-w-2xl mx-auto my-8">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
        <div className="p-3.5 rounded-xl bg-rose-100 text-rose-600 border border-rose-200 shrink-0">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-3 flex-1">
          <h3 className="text-xl font-bold text-rose-900 tracking-tight">Weather Data Error</h3>
          <p className="text-sm text-rose-700 leading-relaxed">{message}</p>

          <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3">
            {onRetry && (
              <button
                onClick={onRetry}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center gap-2 shadow-xs active:scale-95"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
            )}

            {onSearchFallback && (
              <button
                onClick={() => onSearchFallback('London')}
                className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold transition flex items-center gap-2 active:scale-95 shadow-2xs"
              >
                <Search className="w-4 h-4 text-blue-600" />
                Load Default (London)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
