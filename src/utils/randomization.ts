import type { ChampionSummary, ChampionDetail, Spell } from '../types';

/**
 * Select a random champion from the list
 */
export function selectRandomChampion(champions: ChampionSummary[]): ChampionSummary {
  const randomIndex = Math.floor(Math.random() * champions.length);
  return champions[randomIndex];
}

/**
 * Select a random spell from a champion
 * Ultimates (R) have a 10% chance, other spells share the remaining 90%
 */
export function selectRandomSpell(champion: ChampionDetail): {
  spell: Spell;
  spellIndex: number;
} {
  const rand = Math.random();
  let spellIndex: number;

  // Ultimate (R) has 10% chance
  if (rand < 0.10) {
    spellIndex = 3; // R ability
  } else {
    // Q, W, E share the remaining 90% equally (30% each)
    const basicSpellIndex = Math.floor((rand - 0.10) / 0.30);
    spellIndex = Math.min(basicSpellIndex, 2); // Ensure it's 0, 1, or 2
  }

  // Fallback to ensure we don't exceed available spells
  if (spellIndex >= champion.spells.length) {
    spellIndex = Math.floor(Math.random() * champion.spells.length);
  }

  return {
    spell: champion.spells[spellIndex],
    spellIndex,
  };
}

/**
 * Select a random rank for the question
 * Always returns 1 to focus on Rank 1 vs Max Rank comparison
 */
export function selectRandomRank(_spell: Spell): number {
  return 1;
}

/**
 * Get the keybind letter for a spell index
 */
export function getSpellKeybind(spellIndex: number): string {
  const keybinds = ['Q', 'W', 'E', 'R'];
  return keybinds[spellIndex] || '?';
}
