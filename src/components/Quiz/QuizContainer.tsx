import { useEffect, useState, useRef } from 'react';
import { useChampionData } from '../../hooks/useChampionData';
import { useQuizLogic } from '../../hooks/useQuizLogic';
import { selectRandomChampion } from '../../utils/randomization';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ChampionDisplay } from './ChampionDisplay';
import { SpellDisplay } from './SpellDisplay';
import { SpellDescription } from './SpellDescription';
import { QuestionPhase } from './QuestionPhase';
import { CooldownVisualization } from './CooldownVisualization';
import { NextButton } from './NextButton';

export function QuizContainer() {
  const { champions, isLoading, error, retry, loadChampionDetail } = useChampionData();
  const {
    currentChampion,
    currentSpell,
    currentSpellIndex,
    questionRank,
    currentPhase,
    phase1Answer,
    phase2Answer,
    phase3Answer,
    showVisualization,
    questionOptions,
    startNewQuestion,
    answerPhase1,
    answerPhase2,
    answerPhase3,
  } = useQuizLogic();

  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [questionLoadError, setQuestionLoadError] = useState<string | null>(null);
  const loadQuestionAbortController = useRef<AbortController | null>(null);
  const loadTimeoutRef = useRef<number | null>(null);

  // Load first question when champions are available
  useEffect(() => {
    if (champions.length > 0 && !currentChampion && !isLoadingQuestion) {
      loadNewQuestion();
    }

    // Cleanup on unmount
    return () => {
      if (loadTimeoutRef.current !== null) {
        clearTimeout(loadTimeoutRef.current);
      }
      if (loadQuestionAbortController.current) {
        loadQuestionAbortController.current.abort();
      }
    };
  }, [champions.length]);

  async function loadNewQuestion() {
    if (isLoadingQuestion) {
      return;
    }

    // Cancel any existing question load
    if (loadQuestionAbortController.current) {
      loadQuestionAbortController.current.abort();
    }

    // Clear any existing timeout
    if (loadTimeoutRef.current !== null) {
      clearTimeout(loadTimeoutRef.current);
    }

    // Create new abort controller for this load
    loadQuestionAbortController.current = new AbortController();
    const signal = loadQuestionAbortController.current.signal;

    setIsLoadingQuestion(true);
    setQuestionLoadError(null);

    // Set a timeout to prevent indefinite loading
    loadTimeoutRef.current = window.setTimeout(() => {
      console.error('[QuizContainer] Question load timed out after 15 seconds');
      if (loadQuestionAbortController.current) {
        loadQuestionAbortController.current.abort();
      }
      setIsLoadingQuestion(false);
      setQuestionLoadError('Loading took too long. Please try again.');
    }, 15000);

    try {
      const randomChampion = selectRandomChampion(champions);
      const championDetail = await loadChampionDetail(randomChampion.id, signal);

      // Clear timeout on success
      if (loadTimeoutRef.current !== null) {
        clearTimeout(loadTimeoutRef.current);
        loadTimeoutRef.current = null;
      }

      // Check if aborted
      if (signal.aborted) {
        return;
      }

      if (championDetail && championDetail.spells.length > 0) {
        startNewQuestion(championDetail);
      } else {
        setQuestionLoadError('Failed to load champion details. Please try again.');
      }
    } catch (err) {
      // Clear timeout on error
      if (loadTimeoutRef.current !== null) {
        clearTimeout(loadTimeoutRef.current);
        loadTimeoutRef.current = null;
      }

      // Ignore abort errors
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }

      console.error('[QuizContainer] Error loading question:', err);
      setQuestionLoadError('Failed to load question. Please try again.');
    } finally {
      if (!signal.aborted) {
        setIsLoadingQuestion(false);
      }
    }
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center px-4">
        <div className="bg-red-900 border-2 border-red-500 rounded-lg p-8 max-w-md w-full shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-4">Failed to Load Champions</h2>
          <p className="text-red-200 mb-6">{error}</p>
          <button
            onClick={retry}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 shadow-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show error if question failed to load
  if (questionLoadError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center px-4">
        <div className="bg-red-900 border-2 border-red-500 rounded-lg p-8 max-w-md w-full shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-4">Failed to Load Question</h2>
          <p className="text-red-200 mb-6">{questionLoadError}</p>
          <button
            onClick={() => {
              setQuestionLoadError(null);
              loadNewQuestion();
            }}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 shadow-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!currentChampion || !currentSpell || !questionOptions) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            League of Legends
          </h1>
          <p className="text-3xl md:text-4xl font-extrabold text-yellow-400 drop-shadow-lg">
            Cooldown Quiz
          </p>
        </div>

        {/* Champion Display */}
        <ChampionDisplay champion={currentChampion} />

        {/* Spell Display */}
        <SpellDisplay spell={currentSpell} spellIndex={currentSpellIndex} />

        {/* Spell Description */}
        <SpellDescription spell={currentSpell} champion={currentChampion} />

        {/* Question Phases */}
        <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
          <QuestionPhase
            phase={currentPhase}
            questionRank={questionRank}
            maxRank={currentSpell.maxrank}
            phase1Options={questionOptions.phase1Options}
            phase2Options={questionOptions.phase2Options}
            phase3Options={questionOptions.phase3Options}
            correctRange={questionOptions.correctRange}
            correctPhase2={questionOptions.correctPhase2}
            correctPhase3={questionOptions.correctPhase3}
            phase1Answer={phase1Answer}
            phase2Answer={phase2Answer}
            phase3Answer={phase3Answer}
            onAnswerPhase1={answerPhase1}
            onAnswerPhase2={answerPhase2}
            onAnswerPhase3={answerPhase3}
          />
        </div>

        {/* Cooldown Visualization */}
        {showVisualization && (
          <div className="animate-slideIn">
            <CooldownVisualization spell={currentSpell} />
          </div>
        )}

        {/* Next Question Button */}
        {showVisualization && (
          <div className="flex justify-center animate-slideIn">
            <NextButton onClick={loadNewQuestion} />
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-gray-400 text-sm mt-8 pb-4">
          <p>
            League of Legends Cooldown Quiz is not endorsed by Riot Games and does not reflect
            the views or opinions of Riot Games or anyone officially involved in producing or
            managing Riot Games properties.
          </p>
          <p className="mt-2">
            Riot Games and all associated properties are trademarks or registered trademarks of
            Riot Games, Inc.
          </p>
        </div>
      </div>
    </div>
  );
}
