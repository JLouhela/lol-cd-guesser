import { dataDragonService } from '../../services/dataDragon';
import type { ChampionDetail } from '../../types';

interface ChampionDisplayProps {
  champion: ChampionDetail;
}

export function ChampionDisplay({ champion }: ChampionDisplayProps) {
  const iconUrl = dataDragonService.getChampionIconUrl(champion.image.full);

  return (
    <div className="flex items-center gap-4 bg-gradient-to-r from-blue-800 to-purple-800 p-4 rounded-lg shadow-lg">
      <img
        src={iconUrl}
        alt={champion.name}
        className="w-16 h-16 rounded-full border-4 border-yellow-400 shadow-md"
        onError={(e) => {
          console.error('Failed to load champion icon:', iconUrl);
          e.currentTarget.style.display = 'none';
        }}
      />
      <div>
        <h2 className="text-2xl font-bold text-white">{champion.name}</h2>
      </div>
    </div>
  );
}
