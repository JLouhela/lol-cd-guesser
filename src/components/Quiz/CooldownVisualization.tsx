import { useEffect, useState } from 'react';
import type { Spell } from '../../types';

interface CooldownVisualizationProps {
  spell: Spell;
}

export function CooldownVisualization({ spell }: CooldownVisualizationProps) {
  const [animationProgress, setAnimationProgress] = useState(0);

  const rank1Cooldown = spell.cooldown[0];
  const maxRank = spell.maxrank;
  const maxRankCooldown = spell.cooldown[maxRank - 1];

  useEffect(() => {
    const duration = 3000; // 3 seconds
    const interval = 50; // Update every 50ms
    const steps = duration / interval;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      setAnimationProgress(currentStep / steps);

      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [spell]);

  const maxCooldown = Math.max(rank1Cooldown, maxRankCooldown);

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold text-white mb-6 text-center">Cooldown Comparison</h3>

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
                  2 * Math.PI * 80 * (1 - (animationProgress * rank1Cooldown) / maxCooldown)
                }`}
                className="transition-all duration-100"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl font-bold text-white">
                {Math.floor(animationProgress * rank1Cooldown)}s
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
                  2 * Math.PI * 80 * (1 - (animationProgress * maxRankCooldown) / maxCooldown)
                }`}
                className="transition-all duration-100"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl font-bold text-white">
                {Math.floor(animationProgress * maxRankCooldown)}s
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
