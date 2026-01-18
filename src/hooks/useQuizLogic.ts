import { useState, useCallback } from 'react';
import type { ChampionDetail, Spell, QuizPhase, QuestionOptions } from '../types';
import { generateQuestionOptions } from '../utils/cooldownHelpers';
import { selectRandomSpell, selectRandomRank } from '../utils/randomization';

interface UseQuizLogicReturn {
  currentChampion: ChampionDetail | null;
  currentSpell: Spell | null;
  currentSpellIndex: number;
  questionRank: number;
  currentPhase: QuizPhase;
  phase1Answer: string | null;
  phase2Answer: number | null;
  phase3Answer: number | null;
  phase1Correct: boolean | null;
  phase2Correct: boolean | null;
  phase3Correct: boolean | null;
  showVisualization: boolean;
  questionOptions: QuestionOptions | null;
  startNewQuestion: (champion: ChampionDetail) => void;
  answerPhase1: (selectedRange: string) => void;
  answerPhase2: (selectedCooldown: number) => void;
  answerPhase3: (selectedCooldown: number) => void;
  nextQuestion: () => void;
}

export function useQuizLogic(): UseQuizLogicReturn {
  const [currentChampion, setCurrentChampion] = useState<ChampionDetail | null>(null);
  const [currentSpell, setCurrentSpell] = useState<Spell | null>(null);
  const [currentSpellIndex, setCurrentSpellIndex] = useState(0);
  const [questionRank, setQuestionRank] = useState(1);
  const [currentPhase, setCurrentPhase] = useState<QuizPhase>(1);
  const [questionOptions, setQuestionOptions] = useState<QuestionOptions | null>(null);

  const [phase1Answer, setPhase1Answer] = useState<string | null>(null);
  const [phase2Answer, setPhase2Answer] = useState<number | null>(null);
  const [phase3Answer, setPhase3Answer] = useState<number | null>(null);

  const [phase1Correct, setPhase1Correct] = useState<boolean | null>(null);
  const [phase2Correct, setPhase2Correct] = useState<boolean | null>(null);
  const [phase3Correct, setPhase3Correct] = useState<boolean | null>(null);

  const [showVisualization, setShowVisualization] = useState(false);

  const startNewQuestion = useCallback((champion: ChampionDetail) => {
    console.log('[useQuizLogic] startNewQuestion called with champion:', champion.name);
    console.log('[useQuizLogic] Selecting random spell...');
    const { spell, spellIndex } = selectRandomSpell(champion);
    console.log('[useQuizLogic] Selected spell:', spell.name, 'at index', spellIndex);

    console.log('[useQuizLogic] Selecting random rank...');
    const rank = selectRandomRank(spell);
    console.log('[useQuizLogic] Selected rank:', rank);

    console.log('[useQuizLogic] Generating question options...');
    const options = generateQuestionOptions(spell, rank);
    console.log('[useQuizLogic] Generated options:', options);

    console.log('[useQuizLogic] Setting all state...');
    setCurrentChampion(champion);
    setCurrentSpell(spell);
    setCurrentSpellIndex(spellIndex);
    setQuestionRank(rank);
    setQuestionOptions(options);
    setCurrentPhase(1);
    setPhase1Answer(null);
    setPhase2Answer(null);
    setPhase3Answer(null);
    setPhase1Correct(null);
    setPhase2Correct(null);
    setPhase3Correct(null);
    setShowVisualization(false);
    console.log('[useQuizLogic] All state set, startNewQuestion complete');
  }, []);

  const answerPhase1 = useCallback(
    (selectedRange: string) => {
      if (!questionOptions || phase1Answer !== null) return;

      setPhase1Answer(selectedRange);
      const correct = selectedRange === questionOptions.correctRange.label;
      setPhase1Correct(correct);

      // Auto-advance to phase 2 after a short delay
      setTimeout(() => {
        setCurrentPhase(2);
      }, 1000);
    },
    [questionOptions, phase1Answer]
  );

  const answerPhase2 = useCallback(
    (selectedCooldown: number) => {
      if (!questionOptions || phase2Answer !== null) return;

      setPhase2Answer(selectedCooldown);
      const correct = selectedCooldown === questionOptions.correctPhase2;
      setPhase2Correct(correct);

      // Auto-advance to phase 3 after a short delay
      setTimeout(() => {
        setCurrentPhase(3);
      }, 1000);
    },
    [questionOptions, phase2Answer]
  );

  const answerPhase3 = useCallback(
    (selectedCooldown: number) => {
      if (!questionOptions || phase3Answer !== null) return;

      setPhase3Answer(selectedCooldown);
      const correct = selectedCooldown === questionOptions.correctPhase3;
      setPhase3Correct(correct);

      // Show visualization after answering phase 3
      setTimeout(() => {
        setShowVisualization(true);
      }, 500);
    },
    [questionOptions, phase3Answer]
  );

  const nextQuestion = useCallback(() => {
    // Reset is handled by calling startNewQuestion with a new champion
    setShowVisualization(false);
  }, []);

  return {
    currentChampion,
    currentSpell,
    currentSpellIndex,
    questionRank,
    currentPhase,
    phase1Answer,
    phase2Answer,
    phase3Answer,
    phase1Correct,
    phase2Correct,
    phase3Correct,
    showVisualization,
    questionOptions,
    startNewQuestion,
    answerPhase1,
    answerPhase2,
    answerPhase3,
    nextQuestion,
  };
}
