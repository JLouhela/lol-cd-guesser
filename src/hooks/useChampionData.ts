import { useState, useEffect, useRef, useCallback } from 'react';
import { dataDragonService } from '../services/dataDragon';
import type { ChampionSummary, ChampionDetail } from '../types';

interface UseChampionDataReturn {
  version: string | null;
  champions: ChampionSummary[];
  isLoading: boolean;
  error: string | null;
  retry: () => void;
  loadChampionDetail: (championId: string, signal?: AbortSignal) => Promise<ChampionDetail | null>;
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
  // Track if component is mounted
  const isMountedRef = useRef(true);
  // Track the current abort controller to prevent duplicate concurrent loads
  const currentAbortController = useRef<AbortController | null>(null);

  useEffect(() => {
    const abortController = new AbortController();
    isMountedRef.current = true;

    // Set a failsafe timeout to ALWAYS unblock the UI
    const failsafeTimeout = setTimeout(() => {
      if (isMountedRef.current) {
        setIsLoading(false);
        setError('Loading timed out. Please refresh the page.');
        console.error('[useChampionData] Failsafe timeout triggered after 10 seconds');
      }
    }, 10000); // 10 second absolute maximum

    loadChampions(abortController.signal).finally(() => {
      clearTimeout(failsafeTimeout);
    });

    // Cleanup on unmount
    return () => {
      isMountedRef.current = false;
      clearTimeout(failsafeTimeout);
      abortController.abort();
      // Clear pending requests to prevent memory leaks
      pendingRequests.current.clear();
      currentAbortController.current = null;
    };
  }, []);

  async function loadChampions(signal?: AbortSignal) {
    // If there's already a load in progress with a different signal, don't start another
    if (currentAbortController.current && !currentAbortController.current.signal.aborted) {
      console.warn('[useChampionData] Skipping load - already in progress');
      return;
    }

    const startTime = performance.now();
    console.log(`[useChampionData] Load started at ${startTime}`);

    try {
      if (!isMountedRef.current) return;

      // Track this load
      if (signal) {
        currentAbortController.current = { signal } as AbortController;
      }

      setIsLoading(true);
      setError(null);

      console.log('[useChampionData] Calling getChampionList...');
      const fetchStart = performance.now();
      const championListResponse = await dataDragonService.getChampionList(signal);
      const fetchEnd = performance.now();
      console.log(`[useChampionData] getChampionList took ${fetchEnd - fetchStart}ms`);

      // Check if component is still mounted and not aborted
      if (!isMountedRef.current || signal?.aborted) {
        console.log('[useChampionData] Aborted or unmounted after fetch');
        return;
      }

      console.log('[useChampionData] Extracting champion array...');
      const extractStart = performance.now();
      const championArray = Object.values(championListResponse.data);
      const extractEnd = performance.now();
      console.log(`[useChampionData] Object.values took ${extractEnd - extractStart}ms, got ${championArray.length} champions`);

      console.log('[useChampionData] Setting state...');
      setVersion(championListResponse.version);
      setChampions(championArray);

      const totalTime = performance.now() - startTime;
      console.log(`[useChampionData] Total load time: ${totalTime}ms`);
    } catch (err) {
      // Ignore abort errors
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('[useChampionData] AbortError caught');
        return;
      }

      if (!isMountedRef.current) return;

      const errorMessage = err instanceof Error ? err.message : 'Failed to load champions';
      setError(errorMessage);
      console.error('[useChampionData] Error loading champions:', err);
    } finally {
      currentAbortController.current = null;
      // Always set loading to false if component is still mounted
      if (isMountedRef.current) {
        setIsLoading(false);
        console.log('[useChampionData] Load completed, isLoading set to false');
      }
    }
  }

  function retry() {
    loadChampions();
  }

  const loadChampionDetail = useCallback(async (championId: string, signal?: AbortSignal): Promise<ChampionDetail | null> => {
    // Check cache first
    const cached = championDetailCache.current.get(championId);
    if (cached) {
      return cached;
    }

    // Check if there's already a request in flight for this champion
    const pending = pendingRequests.current.get(championId);
    if (pending) {
      return pending;
    }

    // Not in cache, fetch from API
    const fetchPromise = (async () => {
      try {
        const detailResponse = await dataDragonService.getChampionDetail(championId, signal);

        // Check if aborted after fetch
        if (signal?.aborted) {
          return null;
        }

        const championDetail = Object.values(detailResponse.data)[0];

        // Store in cache
        championDetailCache.current.set(championId, championDetail);

        return championDetail;
      } catch (err) {
        // Ignore abort errors
        if (err instanceof Error && err.name === 'AbortError') {
          return null;
        }
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
