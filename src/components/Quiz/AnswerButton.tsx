interface AnswerButtonProps {
  label: string;
  onClick: () => void;
  isSelected: boolean;
  isCorrect: boolean | null;
  isAnswered: boolean;
}

export function AnswerButton({
  label,
  onClick,
  isSelected,
  isCorrect,
  isAnswered,
}: AnswerButtonProps) {
  let className =
    'min-h-[44px] px-6 py-3 rounded-lg font-bold text-lg transition-all transform hover:scale-105 ';

  if (isAnswered) {
    if (isCorrect) {
      className += 'bg-green-600 text-white shadow-lg shadow-green-500/50';
    } else if (isSelected && !isCorrect) {
      className += 'bg-red-600 text-white shadow-lg shadow-red-500/50 animate-shake';
    } else {
      className += 'bg-gray-700 text-gray-400';
    }
  } else {
    className += 'bg-blue-600 hover:bg-blue-500 text-white shadow-md';
  }

  return (
    <button onClick={onClick} disabled={isAnswered} className={className}>
      {label}
    </button>
  );
}
