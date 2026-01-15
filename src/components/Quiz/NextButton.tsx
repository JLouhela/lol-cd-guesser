interface NextButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export function NextButton({ onClick, disabled = false }: NextButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full sm:w-auto px-8 py-4 rounded-lg font-bold text-lg transition-all transform ${
        disabled
          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
          : 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-gray-900 hover:scale-105 shadow-lg shadow-yellow-500/50'
      }`}
    >
      Next Question
    </button>
  );
}
