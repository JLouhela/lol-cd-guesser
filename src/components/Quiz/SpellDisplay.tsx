import { dataDragonService } from '../../services/dataDragon';
import type { Spell } from '../../types';
import { getSpellKeybind } from '../../utils/randomization';

interface SpellDisplayProps {
  spell: Spell;
  spellIndex: number;
}

export function SpellDisplay({ spell, spellIndex }: SpellDisplayProps) {
  const spellIconUrl = dataDragonService.getSpellIconUrl(spell.image.full);
  const keybind = getSpellKeybind(spellIndex);

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <div className="flex items-center gap-4 mb-4">
        <div className="relative">
          <img
            src={spellIconUrl}
            alt={spell.name}
            className="w-20 h-20 rounded-lg border-2 border-yellow-400 shadow-md"
          />
          <div className="absolute -top-2 -right-2 bg-yellow-400 text-gray-900 font-bold w-8 h-8 rounded-full flex items-center justify-center text-lg shadow-md">
            {keybind}
          </div>
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">{spell.name}</h3>
          <p className="text-gray-400 text-sm">Ability {keybind}</p>
        </div>
      </div>
      <div className="mt-4 flex justify-center">
        <img
          src={spellIconUrl}
          alt={spell.name}
          className="w-48 h-48 rounded-lg shadow-2xl border-4 border-gray-700"
          style={{ imageRendering: 'crisp-edges' }}
        />
      </div>
    </div>
  );
}
