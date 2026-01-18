import type { ChampionListResponse, ChampionDetailResponse } from '../types';

const BASE_URL = 'https://ddragon.leagueoflegends.com';
const TIMEOUT_MS = 5000; // 5 second timeout (reduced for faster failures)
const MAX_RETRIES = 0; // No retries to fail fast
const RETRY_DELAY_MS = 500; // Reduced retry delay

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch with timeout support to prevent browser freezing
 * Accepts an external abort signal for cancellation
 */
async function fetchWithTimeout(
  url: string,
  timeoutMs: number = TIMEOUT_MS,
  externalSignal?: AbortSignal
): Promise<Response> {
  const controller = new AbortController();
  let isTimeout = false;

  const timeoutId = setTimeout(() => {
    isTimeout = true;
    controller.abort();
  }, timeoutMs);

  // If external signal aborts, abort our controller too
  const abortHandler = () => {
    clearTimeout(timeoutId); // Clear timeout when externally aborted
    controller.abort();
  };
  externalSignal?.addEventListener('abort', abortHandler);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      cache: 'no-store' // Force fresh fetch, bypass cache
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      // Rate limiting typically returns 429
      if (response.status === 429) {
        throw new Error(`Rate limited by API (429)`);
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      // Check if this was a timeout or external abort
      if (isTimeout) {
        throw new Error(`Request timeout after ${timeoutMs}ms`);
      }
      // External abort - rethrow the AbortError so it can be caught upstream
      throw error;
    }
    throw error;
  } finally {
    externalSignal?.removeEventListener('abort', abortHandler);
  }
}

/**
 * Fetch with automatic retries and exponential backoff
 */
async function fetchWithRetry(url: string, retries: number = MAX_RETRIES, externalSignal?: AbortSignal): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      if (attempt > 0) {
        const backoffDelay = RETRY_DELAY_MS * Math.pow(2, attempt - 1);
        await sleep(backoffDelay);
      }

      const response = await fetchWithTimeout(url, TIMEOUT_MS, externalSignal);
      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on AbortError (external cancellation) or timeout
      if (lastError.name === 'AbortError' || lastError.message.includes('timeout')) {
        throw lastError;
      }

      // Continue to next retry attempt
    }
  }

  throw lastError || new Error('Request failed after retries');
}

export class DataDragonService {
  private version: string | null = null;

  async getLatestVersion(signal?: AbortSignal): Promise<string> {
    if (this.version) {
      return this.version;
    }

    try {
      const response = await fetchWithRetry(`${BASE_URL}/api/versions.json`, MAX_RETRIES, signal);
      const versions: string[] = await response.json();
      this.version = versions[0]; // Latest version is first
      return this.version;
    } catch (error) {
      // Rethrow AbortErrors as-is so they can be handled properly upstream
      if (error instanceof Error && error.name === 'AbortError') {
        throw error;
      }
      console.error('Failed to fetch version:', error);
      throw new Error('Failed to fetch latest version');
    }
  }

  async getChampionList(signal?: AbortSignal): Promise<ChampionListResponse> {
    const version = await this.getLatestVersion(signal);

    try {
      const response = await fetchWithTimeout(
        `${BASE_URL}/cdn/${version}/data/en_US/champion.json`,
        TIMEOUT_MS,
        signal
      );
      const data: ChampionListResponse = await response.json();
      return data;
    } catch (error) {
      // Rethrow AbortErrors as-is so they can be handled properly upstream
      if (error instanceof Error && error.name === 'AbortError') {
        throw error;
      }
      console.error('[DataDragon] Failed to fetch champion list:', error);
      throw new Error('Failed to fetch champion list');
    }
  }

  async getChampionDetail(championId: string, signal?: AbortSignal): Promise<ChampionDetailResponse> {
    console.log(`[DataDragon] getChampionDetail called for ${championId}`);
    console.log('[DataDragon] Getting latest version...');
    const version = await this.getLatestVersion(signal);
    console.log(`[DataDragon] Version: ${version}`);

    try {
      const url = `${BASE_URL}/cdn/${version}/data/en_US/champion/${championId}.json`;
      console.log(`[DataDragon] Fetching from: ${url}`);
      const response = await fetchWithTimeout(
        url,
        TIMEOUT_MS,
        signal
      );
      console.log('[DataDragon] Fetch completed, parsing JSON...');
      const data: ChampionDetailResponse = await response.json();
      console.log('[DataDragon] JSON parsed successfully');
      return data;
    } catch (error) {
      // Rethrow AbortErrors as-is so they can be handled properly upstream
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('[DataDragon] Aborted');
        throw error;
      }
      console.error(`[DataDragon] Failed to fetch champion detail for ${championId}:`, error);
      throw new Error(`Failed to fetch champion detail for ${championId}`);
    }
  }

  getChampionIconUrl(imageFilename: string): string {
    if (!this.version) {
      throw new Error('Version not loaded');
    }
    return `${BASE_URL}/cdn/${this.version}/img/champion/${imageFilename}`;
  }

  getSpellIconUrl(spellImageFull: string): string {
    if (!this.version) {
      throw new Error('Version not loaded');
    }
    return `${BASE_URL}/cdn/${this.version}/img/spell/${spellImageFull}`;
  }

  getPassiveIconUrl(passiveImageFull: string): string {
    if (!this.version) {
      throw new Error('Version not loaded');
    }
    return `${BASE_URL}/cdn/${this.version}/img/passive/${passiveImageFull}`;
  }
}

export const dataDragonService = new DataDragonService();
