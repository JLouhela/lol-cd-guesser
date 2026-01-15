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
 */
export function selectRandomSpell(champion: ChampionDetail): {
  spell: Spell;
  spellIndex: number;
} {
  const spellIndex = Math.floor(Math.random() * champion.spells.length);
  return {
    spell: champion.spells[spellIndex],
    spellIndex,
  };
}

/**
 * Select a random rank for the question
 * For ultimate abilities (maxrank 3), returns 1-3
 * For basic abilities (maxrank 5), returns 1-5
 */
export function selectRandomRank(spell: Spell): number {
  const maxRank = spell.maxrank;
  return Math.floor(Math.random() * maxRank) + 1;
}

/**
 * Get the keybind letter for a spell index
 */
export function getSpellKeybind(spellIndex: number): string {
  const keybinds = ['Q', 'W', 'E', 'R'];
  return keybinds[spellIndex] || '?';
}
