import { useEffect, useState } from 'react';
import type { Spell } from '../../types';

interface CooldownVisualizationProps {
  spell: Spell;
}

export function CooldownVisualization({ spell }: CooldownVisualizationProps) {
  const [rank1Time, setRank1Time] = useState(0);
  const [maxRankTime, setMaxRankTime] = useState(0);

  const rank1Cooldown = spell.cooldown[0];
  const maxRank = spell.maxrank;
  const maxRankCooldown = spell.cooldown[maxRank - 1];
  const maxCooldown = Math.max(rank1Cooldown, maxRankCooldown);

  useEffect(() => {
    // Reset timers when spell changes
    setRank1Time(0);
    setMaxRankTime(0);

    // Calculate time scale factor
    // For very long cooldowns, speed up the animation
    // Max 20 seconds real-time, scale down if longer
    const scaleFactor = maxCooldown > 20 ? 20 / maxCooldown : 1;
    const interval = 100; // Update every 100ms

    const timer = setInterval(() => {
      setRank1Time((prev) => {
        const next = prev + (interval / 1000) / scaleFactor;
        return next >= rank1Cooldown ? rank1Cooldown : next;
      });
      setMaxRankTime((prev) => {
        const next = prev + (interval / 1000) / scaleFactor;
        return next >= maxRankCooldown ? maxRankCooldown : next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [spell, rank1Cooldown, maxRankCooldown, maxCooldown]);

  const scaleFactor = maxCooldown > 20 ? 20 / maxCooldown : 1;
  const isScaled = maxCooldown > 20;

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold text-white mb-2 text-center">Cooldown Comparison</h3>
      {isScaled && (
        <p className="text-gray-400 text-sm text-center mb-4">
          (Animation scaled to {(scaleFactor * 100).toFixed(0)}% speed for visibility)
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Rank 1 */}
        <div className="text-center">
          <h4 className="text-lg font-semibold text-yellow-400 mb-4">Rank 1</h4>
          <div className="relative w-48 h-48 mx-auto">
            <svg className="transform -rotate-90" width="192" height="192">
              <circle
                cx="96"
                cy="96"
                r="80"
                stroke="#374151"
                strokeWidth="12"
                fill="none"
              />
              <circle
                cx="96"
                cy="96"
                r="80"
                stroke="#EF4444"
                strokeWidth="12"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 80}`}
                strokeDashoffset={`${
                  2 * Math.PI * 80 * (1 - rank1Time / maxCooldown)
                }`}
                className="transition-all duration-100"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl font-bold text-white">
                {rank1Time.toFixed(1)}s
              </span>
            </div>
          </div>
          <p className="text-gray-400 mt-4">
            Full cooldown: <span className="text-white font-bold">{rank1Cooldown}s</span>
          </p>
        </div>

        {/* Max Rank */}
        <div className="text-center">
          <h4 className="text-lg font-semibold text-yellow-400 mb-4">Rank {maxRank}</h4>
          <div className="relative w-48 h-48 mx-auto">
            <svg className="transform -rotate-90" width="192" height="192">
              <circle
                cx="96"
                cy="96"
                r="80"
                stroke="#374151"
                strokeWidth="12"
                fill="none"
              />
              <circle
                cx="96"
                cy="96"
                r="80"
                stroke="#10B981"
                strokeWidth="12"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 80}`}
                strokeDashoffset={`${
                  2 * Math.PI * 80 * (1 - maxRankTime / maxCooldown)
                }`}
                className="transition-all duration-100"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl font-bold text-white">
                {maxRankTime.toFixed(1)}s
              </span>
            </div>
          </div>
          <p className="text-gray-400 mt-4">
            Full cooldown: <span className="text-white font-bold">{maxRankCooldown}s</span>
          </p>
        </div>
      </div>

      {rank1Cooldown !== maxRankCooldown && (
        <div className="mt-6 text-center">
          <p className="text-green-400 font-semibold">
            Cooldown reduced by {rank1Cooldown - maxRankCooldown}s at max rank!
          </p>
          <p className="text-gray-400 text-sm">
            ({Math.round(((rank1Cooldown - maxRankCooldown) / rank1Cooldown) * 100)}% reduction)
          </p>
        </div>
      )}

      {rank1Cooldown === maxRankCooldown && (
        <div className="mt-6 text-center">
          <p className="text-yellow-400 font-semibold">Cooldown doesn't change with rank</p>
        </div>
      )}
    </div>
  );
}
