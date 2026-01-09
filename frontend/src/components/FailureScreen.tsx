import React from 'react';

interface FailureScreenProps {
  isOpen: boolean;
  message?: string;
  onClose: () => void;
}

const FailureScreen: React.FC<FailureScreenProps> = ({
  isOpen,
  message = 'Something went wrong with your order.',
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay blur background */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal card */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-neutral-900 border border-gray-800 rounded-lg p-8">
          {/* X Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
              <svg
                className="w-10 h-10 text-red-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
          </div>

          {/* Message */}
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-white">Order Failed</h2>
            <p className="text-gray-400">{message}</p>

            {/* Suggestion */}
            <div className="bg-neutral-800 border border-gray-700 rounded-lg p-4 mt-6">
              <p className="text-sm text-gray-400">
                Please try again or contact support if the problem persists.
              </p>
            </div>
          </div>

          {/* Button */}
          <button
            onClick={onClose}
            className="w-full mt-8 px-5 py-2.5 rounded-lg bg-white text-black hover:bg-black hover:text-white font-semibold transition-colors cursor-pointer"
          >
            Back to Cart
          </button>
        </div>
      </div>
    </>
  );
};

export default FailureScreen;
