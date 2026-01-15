import type { RangeOption, QuestionOptions, Spell } from '../types';

/**
 * Determine appropriate range size based on cooldown magnitude
 */
export function getRangeSize(cooldown: number): number {
  if (cooldown <= 6) return 2; // Small CDs: 2s ranges (e.g., 2-4s, 5-6s)
  if (cooldown <= 15) return 3; // Medium CDs: 3s ranges (e.g., 7-9s, 10-12s)
  if (cooldown <= 40) return 5; // Large CDs: 5s ranges (e.g., 20-25s)
  if (cooldown <= 80) return 10; // Very large: 10s ranges (e.g., 60-70s)
  return 20; // Ultimate CDs: 20s ranges (e.g., 100-120s)
}

/**
 * Generate a range option with proper label
 */
function createRangeOption(min: number, max: number): RangeOption {
  return {
    min,
    max,
    label: `${min}-${max}s`,
  };
}

/**
 * Generate 3 non-overlapping ranges where one contains the correct answer
 */
export function generateRangeOptions(actualCooldown: number): RangeOption[] {
  const rangeSize = getRangeSize(actualCooldown);

  // Find the range that contains the actual cooldown
  const correctMin = Math.floor(actualCooldown / rangeSize) * rangeSize;
  const correctMax = correctMin + rangeSize;
  const correctRange = createRangeOption(correctMin, correctMax);

  // Generate two distractor ranges
  const ranges: RangeOption[] = [correctRange];

  // Add a lower range if possible
  if (correctMin >= rangeSize) {
    ranges.push(createRangeOption(correctMin - rangeSize, correctMax - rangeSize));
  }

  // Add a higher range
  ranges.push(createRangeOption(correctMin + rangeSize, correctMax + rangeSize));

  // If we need more ranges, add another one
  if (ranges.length < 3) {
    if (correctMin >= rangeSize * 2) {
      ranges.push(createRangeOption(correctMin - rangeSize * 2, correctMax - rangeSize * 2));
    } else {
      ranges.push(createRangeOption(correctMin + rangeSize * 2, correctMax + rangeSize * 2));
    }
  }

  // Shuffle and return 3 ranges
  return shuffleArray(ranges.slice(0, 3));
}

/**
 * Generate 3 exact cooldown options within the selected range
 */
export function generateExactOptions(
  correctCooldown: number,
  rangeMin: number,
  rangeMax: number
): number[] {
  const options = new Set<number>();
  options.add(correctCooldown);

  // Generate distractor values within the range
  while (options.size < 3) {
    const randomValue = Math.floor(Math.random() * (rangeMax - rangeMin + 1)) + rangeMin;
    if (randomValue !== correctCooldown) {
      options.add(randomValue);
    }
  }

  return shuffleArray(Array.from(options));
}

/**
 * Generate 3 options for the max rank cooldown question
 */
export function generateMaxRankOptions(spell: Spell): number[] {
  const maxRank = spell.maxrank;
  const rank1Cooldown = spell.cooldown[0];
  const maxRankCooldown = spell.cooldown[maxRank - 1];

  const options = new Set<number>();
  options.add(maxRankCooldown);

  // Always include Rank 1 cooldown if different
  if (rank1Cooldown !== maxRankCooldown) {
    options.add(rank1Cooldown);
  }

  // Add distractor values
  const rangeSize = getRangeSize(maxRankCooldown);
  while (options.size < 3) {
    const offset = Math.floor(Math.random() * rangeSize * 2) - rangeSize;
    const distractor = maxRankCooldown + offset;
    if (distractor > 0 && distractor !== maxRankCooldown && distractor !== rank1Cooldown) {
      options.add(distractor);
    }
  }

  return shuffleArray(Array.from(options));
}

/**
 * Generate all question options for a spell at a specific rank
 */
export function generateQuestionOptions(spell: Spell, questionRank: number): QuestionOptions {
  const correctCooldown = spell.cooldown[questionRank - 1];
  const maxRank = spell.maxrank;
  const maxRankCooldown = spell.cooldown[maxRank - 1];

  // Phase 1: Range options
  const phase1Options = generateRangeOptions(correctCooldown);
  const correctRange = phase1Options.find(
    (range) => correctCooldown >= range.min && correctCooldown <= range.max
  )!;

  // Phase 2: Exact options within the range
  const phase2Options = generateExactOptions(correctCooldown, correctRange.min, correctRange.max);

  // Phase 3: Max rank options
  const phase3Options = generateMaxRankOptions(spell);

  return {
    phase1Options,
    phase2Options,
    phase3Options,
    correctRange,
    correctPhase2: correctCooldown,
    correctPhase3: maxRankCooldown,
  };
}

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
