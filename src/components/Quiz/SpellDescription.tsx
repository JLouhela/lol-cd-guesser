import { useState } from 'react';
import type { ChampionDetail, Spell } from '../../types';

interface SpellDescriptionProps {
  spell: Spell;
  champion: ChampionDetail;
}

export function SpellDescription({ spell, champion }: SpellDescriptionProps) {
  const [showTips, setShowTips] = useState(false);

  // Clean and sanitize HTML content (only allow br tags)
  const sanitizeHtml = (html: string) => {
    return html.replace(/<br\s*\/?>/gi, '<br />');
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-yellow-400 mb-2">Description</h4>
        <p
          className="text-gray-300 text-sm leading-relaxed"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(spell.description) }}
        />
      </div>

      <button
        onClick={() => setShowTips(!showTips)}
        className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-between"
      >
        <span>{showTips ? 'Hide Tips' : 'Show Tips'}</span>
        <span className="text-xl">{showTips ? '▼' : '▶'}</span>
      </button>

      {showTips && (
        <div className="space-y-4 animate-fadeIn">
          {champion.allytips.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-green-400 mb-2 flex items-center gap-2">
                <span>💡</span> Ally Tips
              </h4>
              <ul className="text-gray-300 text-sm space-y-1 list-disc list-inside">
                {champion.allytips.slice(0, 3).map((tip, index) => (
                  <li
                    key={index}
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(tip) }}
                  />
                ))}
              </ul>
            </div>
          )}

          {champion.enemytips.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-red-400 mb-2 flex items-center gap-2">
                <span>⚔️</span> Enemy Tips
              </h4>
              <ul className="text-gray-300 text-sm space-y-1 list-disc list-inside">
                {champion.enemytips.slice(0, 3).map((tip, index) => (
                  <li
                    key={index}
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(tip) }}
                  />
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
