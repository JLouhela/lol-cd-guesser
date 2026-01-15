// Data Dragon API Types
export interface ChampionSummary {
  id: string;
  name: string;
  image: {
    full: string;
  };
}

export interface ChampionListResponse {
  data: {
    [key: string]: ChampionSummary;
  };
  version: string;
}

export interface Spell {
  id: string;
  name: string;
  description: string;
  tooltip: string;
  cooldown: number[];
  cooldownBurn: string;
  maxrank: number;
  image: {
    full: string;
  };
}

export interface ChampionDetail {
  id: string;
  name: string;
  image: {
    full: string;
  };
  allytips: string[];
  enemytips: string[];
  spells: Spell[];
}

export interface ChampionDetailResponse {
  data: {
    [key: string]: ChampionDetail;
  };
}

// Quiz State Types
export type QuizPhase = 1 | 2 | 3;

export interface QuizState {
  // Data
  version: string;
  champions: ChampionSummary[];
  currentChampion: ChampionDetail | null;
  currentSpell: Spell | null;
  currentSpellIndex: number; // 0=Q, 1=W, 2=E, 3=R
  questionRank: number; // Rank being asked about (1-5 or 1-3 for ult)

  // Quiz Progress
  currentPhase: QuizPhase;
  phase1Answer: string | null;
  phase2Answer: number | null;
  phase3Answer: number | null;
  phase1Correct: boolean | null;
  phase2Correct: boolean | null;
  phase3Correct: boolean | null;

  // UI State
  isLoading: boolean;
  error: string | null;
  showVisualization: boolean;
}

export interface RangeOption {
  min: number;
  max: number;
  label: string;
}

export interface QuestionOptions {
  phase1Options: RangeOption[];
  phase2Options: number[];
  phase3Options: number[];
  correctRange: RangeOption;
  correctPhase2: number;
  correctPhase3: number;
}
