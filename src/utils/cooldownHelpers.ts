import type { RangeOption, QuestionOptions, Spell } from '../types';

/**
 * Determine appropriate range size based on cooldown magnitude
 */
export function getRangeSize(cooldown: number): number {
  if (cooldown <= 6) return 2; // Small CDs: 2s ranges (e.g., 2-4s, 5-6s)
  if (cooldown <= 15) return 3; // Medium CDs: 3s ranges (e.g., 7-9s, 10-12s)
  if (cooldown <= 40) return 5; // Large CDs: 5s ranges (e.g., 20-25s)
  if (cooldown <= 80) return 10; // Very large: 10s ranges (e.g., 60-70s)
  return 30; // Ultimate CDs: 30s ranges with 10s gaps (e.g., 100-120, 130-150, 160-180)
}

/**
 * Generate a range option with proper label
 * Ranges are exclusive at the max to prevent overlap (e.g., 8-9.99 displayed as "8-9")
 */
function createRangeOption(min: number, max: number, isInclusive: boolean = false): RangeOption {
  return {
    min,
    max: isInclusive ? max : max - 0.01, // Make max exclusive unless specified
    label: `${min}-${max - 1}s`,
  };
}

/**
 * Generate 3 non-overlapping ranges where one contains the correct answer
 */
export function generateRangeOptions(actualCooldown: number): RangeOption[] {
  const rangeSize = getRangeSize(actualCooldown);
  const isUltimate = actualCooldown > 80;

  if (isUltimate) {
    // For ultimates, use special logic with rounded ranges and gaps
    // Round to nearest 10 for range boundaries
    const roundedCd = Math.round(actualCooldown / 10) * 10;

    // Create 30s-wide ranges with 10s gaps: 100-120, 130-150, 160-180
    const correctMin = Math.floor(roundedCd / 30) * 30;
    const correctMax = correctMin + 20; // 20s wide range
    const correctRange = createRangeOption(correctMin, correctMax + 1);

    const ranges: RangeOption[] = [correctRange];

    // Add lower range with 10s gap (e.g., if correct is 100-120, lower is 70-90)
    if (correctMin >= 30) {
      ranges.push(createRangeOption(correctMin - 30, correctMin - 10 + 1));
    }

    // Add higher range with 10s gap (e.g., if correct is 100-120, higher is 130-150)
    ranges.push(createRangeOption(correctMax + 10, correctMax + 30 + 1));

    // If we need more ranges, add another one
    if (ranges.length < 3) {
      if (correctMin >= 60) {
        ranges.push(createRangeOption(correctMin - 60, correctMin - 40 + 1));
      } else {
        ranges.push(createRangeOption(correctMax + 40, correctMax + 60 + 1));
      }
    }

    return shuffleArray(ranges.slice(0, 3));
  }

  // Standard logic for non-ultimate abilities
  const correctMin = Math.floor(actualCooldown / rangeSize) * rangeSize;
  const correctMax = correctMin + rangeSize;
  const correctRange = createRangeOption(correctMin, correctMax);

  const ranges: RangeOption[] = [correctRange];

  // Add a lower range if possible (e.g., if correct is 6-8, lower is 3-5)
  if (correctMin >= rangeSize) {
    ranges.push(createRangeOption(correctMin - rangeSize, correctMin));
  }

  // Add a higher range (e.g., if correct is 6-8, higher is 9-11)
  ranges.push(createRangeOption(correctMax, correctMax + rangeSize));

  // If we need more ranges, add another one
  if (ranges.length < 3) {
    if (correctMin >= rangeSize * 2) {
      ranges.push(createRangeOption(correctMin - rangeSize * 2, correctMin - rangeSize));
    } else {
      ranges.push(createRangeOption(correctMax + rangeSize, correctMax + rangeSize * 2));
    }
  }

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

  // Check if the correct cooldown has decimals
  const hasDecimals = correctCooldown % 1 !== 0;

  // Generate distractor values within the range
  while (options.size < 3) {
    let randomValue: number;

    if (hasDecimals) {
      // Generate values with .5 decimals (common in LoL: 6.5, 7.5, 8.5, etc.)
      const wholeNumber = Math.floor(Math.random() * (rangeMax - rangeMin)) + rangeMin;
      randomValue = wholeNumber + 0.5;
    } else {
      // Generate whole numbers
      randomValue = Math.floor(Math.random() * (rangeMax - rangeMin + 1)) + rangeMin;
    }

    if (randomValue !== correctCooldown && randomValue >= rangeMin && randomValue <= rangeMax) {
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
