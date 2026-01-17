import { useState, useEffect } from 'react';

export function LoadingSpinner() {
  const [showSlowWarning, setShowSlowWarning] = useState(false);

  useEffect(() => {
    // Show warning if loading takes more than 5 seconds
    const timer = setTimeout(() => {
      setShowSlowWarning(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 to-purple-900">
      <div className="text-center max-w-md px-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-400 mx-auto"></div>
        <p className="mt-4 text-white text-lg">Loading champions...</p>
        {showSlowWarning && (
          <div className="mt-6 p-4 bg-yellow-900 border-2 border-yellow-600 rounded-lg">
            <p className="text-yellow-200 text-sm">
              This is taking longer than usual. The API might be slow or rate limiting requests.
              Please wait or refresh the page to try again.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
