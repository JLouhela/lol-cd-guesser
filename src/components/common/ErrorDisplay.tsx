interface ErrorDisplayProps {
  error: string;
  onRetry?: () => void;
}

export function ErrorDisplay({ error, onRetry }: ErrorDisplayProps) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 to-purple-900">
      <div className="text-center bg-red-900 bg-opacity-50 p-8 rounded-lg max-w-md">
        <div className="text-red-400 text-5xl mb-4">⚠️</div>
        <h2 className="text-white text-2xl font-bold mb-2">Error</h2>
        <p className="text-red-200 mb-6">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
}
