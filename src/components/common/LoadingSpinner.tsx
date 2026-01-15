export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 to-purple-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-400 mx-auto"></div>
        <p className="mt-4 text-white text-lg">Loading champions...</p>
      </div>
    </div>
  );
}
