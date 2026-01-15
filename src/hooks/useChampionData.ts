import { useState, useEffect } from 'react';
import { dataDragonService } from '../services/dataDragon';
import type { ChampionSummary, ChampionDetail } from '../types';

interface UseChampionDataReturn {
  version: string | null;
  champions: ChampionSummary[];
  isLoading: boolean;
  error: string | null;
  loadChampionDetail: (championId: string) => Promise<ChampionDetail | null>;
}

export function useChampionData(): UseChampionDataReturn {
  const [version, setVersion] = useState<string | null>(null);
  const [champions, setChampions] = useState<ChampionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadChampions();
  }, []);

  async function loadChampions() {
    try {
      setIsLoading(true);
      setError(null);

      const championListResponse = await dataDragonService.getChampionList();
      const championArray = Object.values(championListResponse.data);

      setVersion(championListResponse.version);
      setChampions(championArray);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load champions');
    } finally {
      setIsLoading(false);
    }
  }

  async function loadChampionDetail(championId: string): Promise<ChampionDetail | null> {
    try {
      const detailResponse = await dataDragonService.getChampionDetail(championId);
      const championDetail = Object.values(detailResponse.data)[0];
      return championDetail;
    } catch (err) {
      console.error('Failed to load champion detail:', err);
      return null;
    }
  }

  return {
    version,
    champions,
    isLoading,
    error,
    loadChampionDetail,
  };
}
