import { useState, useEffect, useRef, useCallback } from 'react';
import { dataDragonService } from '../services/dataDragon';
import type { ChampionSummary, ChampionDetail } from '../types';

interface UseChampionDataReturn {
  version: string | null;
  champions: ChampionSummary[];
  isLoading: boolean;
  error: string | null;
  retry: () => void;
  loadChampionDetail: (championId: string) => Promise<ChampionDetail | null>;
}

export function useChampionData(): UseChampionDataReturn {
  const [version, setVersion] = useState<string | null>(null);
  const [champions, setChampions] = useState<ChampionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use useRef for cache to prevent re-renders
  const championDetailCache = useRef<Map<string, ChampionDetail>>(new Map());
  // Track in-flight requests to prevent duplicate fetches
  const pendingRequests = useRef<Map<string, Promise<ChampionDetail | null>>>(new Map());

  useEffect(() => {
    loadChampions();
  }, []);

  async function loadChampions() {
    console.log('[useChampionData] loadChampions started');
    try {
      setIsLoading(true);
      setError(null);
      console.log('[useChampionData] Calling getChampionList...');

      const championListResponse = await dataDragonService.getChampionList();
      console.log('[useChampionData] Got response, extracting champion array...');
      const championArray = Object.values(championListResponse.data);
      console.log(`[useChampionData] Extracted ${championArray.length} champions`);

      setVersion(championListResponse.version);
      setChampions(championArray);
      console.log('[useChampionData] State updated successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load champions';
      setError(errorMessage);
      console.error('[useChampionData] Error loading champions:', err);
    } finally {
      setIsLoading(false);
      console.log('[useChampionData] loadChampions completed');
    }
  }

  function retry() {
    loadChampions();
  }

  const loadChampionDetail = useCallback(async (championId: string): Promise<ChampionDetail | null> => {
    // Check cache first
    const cached = championDetailCache.current.get(championId);
    if (cached) {
      console.log(`Using cached champion detail for ${championId}`);
      return cached;
    }

    // Check if there's already a request in flight for this champion
    const pending = pendingRequests.current.get(championId);
    if (pending) {
      console.log(`Waiting for in-flight request for ${championId}`);
      return pending;
    }

    // Not in cache, fetch from API
    const fetchPromise = (async () => {
      try {
        console.log(`Fetching champion detail for ${championId}`);
        const detailResponse = await dataDragonService.getChampionDetail(championId);
        const championDetail = Object.values(detailResponse.data)[0];

        // Store in cache
        championDetailCache.current.set(championId, championDetail);

        return championDetail;
      } catch (err) {
        console.error('Failed to load champion detail:', err);
        return null;
      } finally {
        // Remove from pending requests
        pendingRequests.current.delete(championId);
      }
    })();

    // Track this request as pending
    pendingRequests.current.set(championId, fetchPromise);

    return fetchPromise;
  }, []);

  return {
    version,
    champions,
    isLoading,
    error,
    retry,
    loadChampionDetail,
  };
}
