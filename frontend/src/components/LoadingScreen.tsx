import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
      `}</style>
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-16 h-16">
          <svg
            className="w-16 h-16 animate-spin-slow"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              className="stroke-gray-700"
              opacity="0.3"
            />
            <circle
              cx="12"
              cy="12"
              r="10"
              className="stroke-white"
              strokeDasharray="15.7"
              strokeDashoffset="0"
            />
          </svg>
        </div>
        <p className="text-gray-400 text-sm">Loading books...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
