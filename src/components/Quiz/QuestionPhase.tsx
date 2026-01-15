import type { QuizPhase, RangeOption } from '../../types';
import { AnswerButton } from './AnswerButton';

interface QuestionPhaseProps {
  phase: QuizPhase;
  questionRank: number;
  maxRank: number;
  phase1Options?: RangeOption[];
  phase2Options?: number[];
  phase3Options?: number[];
  correctRange?: RangeOption;
  correctPhase2?: number;
  correctPhase3?: number;
  phase1Answer: string | null;
  phase2Answer: number | null;
  phase3Answer: number | null;
  onAnswerPhase1: (range: string) => void;
  onAnswerPhase2: (cooldown: number) => void;
  onAnswerPhase3: (cooldown: number) => void;
}

export function QuestionPhase({
  phase,
  maxRank,
  phase1Options = [],
  phase2Options = [],
  phase3Options = [],
  correctRange,
  correctPhase2,
  correctPhase3,
  phase1Answer,
  phase2Answer,
  phase3Answer,
  onAnswerPhase1,
  onAnswerPhase2,
  onAnswerPhase3,
}: QuestionPhaseProps) {
  return (
    <div className="space-y-6">
      {/* Phase 1 */}
      <div
        className={`transition-all duration-500 ${
          phase >= 1 ? 'opacity-100' : 'opacity-50'
        }`}
      >
        <h3 className="text-xl font-bold text-white mb-4">
          Phase 1: What is the cooldown range at Rank 1?
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {phase1Options.map((option) => (
            <AnswerButton
              key={option.label}
              label={option.label}
              onClick={() => onAnswerPhase1(option.label)}
              isSelected={phase1Answer === option.label}
              isCorrect={correctRange ? option.label === correctRange.label : null}
              isAnswered={phase1Answer !== null}
            />
          ))}
        </div>
      </div>

      {/* Phase 2 */}
      {phase >= 2 && (
        <div
          className={`transition-all duration-500 animate-slideIn ${
            phase >= 2 ? 'opacity-100' : 'opacity-50'
          }`}
        >
          <h3 className="text-xl font-bold text-white mb-4">
            Phase 2: What is the exact cooldown within the {correctRange?.label} range?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {phase2Options.map((option) => (
              <AnswerButton
                key={option}
                label={`${option}s`}
                onClick={() => onAnswerPhase2(option)}
                isSelected={phase2Answer === option}
                isCorrect={option === correctPhase2}
                isAnswered={phase2Answer !== null}
              />
            ))}
          </div>
        </div>
      )}

      {/* Phase 3 */}
      {phase >= 3 && (
        <div
          className={`transition-all duration-500 animate-slideIn ${
            phase >= 3 ? 'opacity-100' : 'opacity-50'
          }`}
        >
          <h3 className="text-xl font-bold text-white mb-4">
            Phase 3: What is the cooldown at Rank {maxRank}?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {phase3Options.map((option) => (
              <AnswerButton
                key={option}
                label={`${option}s`}
                onClick={() => onAnswerPhase3(option)}
                isSelected={phase3Answer === option}
                isCorrect={option === correctPhase3}
                isAnswered={phase3Answer !== null}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
