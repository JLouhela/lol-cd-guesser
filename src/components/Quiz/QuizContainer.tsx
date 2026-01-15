import { useEffect } from 'react';
import { useChampionData } from '../../hooks/useChampionData';
import { useQuizLogic } from '../../hooks/useQuizLogic';
import { selectRandomChampion } from '../../utils/randomization';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorDisplay } from '../common/ErrorDisplay';
import { ChampionDisplay } from './ChampionDisplay';
import { SpellDisplay } from './SpellDisplay';
import { SpellDescription } from './SpellDescription';
import { QuestionPhase } from './QuestionPhase';
import { CooldownVisualization } from './CooldownVisualization';
import { NextButton } from './NextButton';

export function QuizContainer() {
  const { champions, isLoading, error, loadChampionDetail } = useChampionData();
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

  // Load first question when champions are available
  useEffect(() => {
    if (champions.length > 0 && !currentChampion) {
      loadNewQuestion();
    }
  }, [champions, currentChampion]);

  async function loadNewQuestion() {
    const randomChampion = selectRandomChampion(champions);
    const championDetail = await loadChampionDetail(randomChampion.id);

    if (championDetail && championDetail.spells.length > 0) {
      startNewQuestion(championDetail);
    }
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorDisplay error={error} />;
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
          <p className="text-xl text-yellow-400">Cooldown Quiz</p>
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
