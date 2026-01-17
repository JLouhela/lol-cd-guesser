import type { ChampionListResponse, ChampionDetailResponse } from '../types';

const BASE_URL = 'https://ddragon.leagueoflegends.com';
const TIMEOUT_MS = 8000; // 8 second timeout
const MAX_RETRIES = 1; // Reduced to 1 retry
const RETRY_DELAY_MS = 1000; // 1 second between retries

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch with timeout support to prevent browser freezing
 */
async function fetchWithTimeout(url: string, timeoutMs: number = TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });
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
      throw new Error(`Request timeout after ${timeoutMs}ms`);
    }
    throw error;
  }
}

/**
 * Fetch with automatic retries and exponential backoff
 */
async function fetchWithRetry(url: string, retries: number = MAX_RETRIES): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      if (attempt > 0) {
        const backoffDelay = RETRY_DELAY_MS * Math.pow(2, attempt - 1);
        console.log(`Retry attempt ${attempt}/${retries} for ${url} after ${backoffDelay}ms delay`);
        await sleep(backoffDelay);
      }

      const response = await fetchWithTimeout(url);
      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.warn(`Attempt ${attempt + 1}/${retries + 1} failed for ${url}:`, lastError.message);

      // Don't retry on timeout - it's unlikely to succeed
      if (lastError.message.includes('timeout')) {
        throw lastError;
      }

      // Continue to next retry attempt
    }
  }

  throw lastError || new Error('Request failed after retries');
}

export class DataDragonService {
  private version: string | null = null;

  async getLatestVersion(): Promise<string> {
    if (this.version) {
      return this.version;
    }

    try {
      const response = await fetchWithRetry(`${BASE_URL}/api/versions.json`);
      const versions: string[] = await response.json();
      this.version = versions[0]; // Latest version is first
      return this.version;
    } catch (error) {
      console.error('Failed to fetch version:', error);
      throw new Error('Failed to fetch latest version');
    }
  }

  async getChampionList(): Promise<ChampionListResponse> {
    const version = await this.getLatestVersion();
    console.log('[DataDragon] Fetching champion list...');

    try {
      const response = await fetchWithTimeout(
        `${BASE_URL}/cdn/${version}/data/en_US/champion.json`
      );
      console.log('[DataDragon] Champion list response received, parsing JSON...');
      const data: ChampionListResponse = await response.json();
      console.log('[DataDragon] Champion list parsed successfully');
      return data;
    } catch (error) {
      console.error('[DataDragon] Failed to fetch champion list:', error);
      throw new Error('Failed to fetch champion list');
    }
  }

  async getChampionDetail(championId: string): Promise<ChampionDetailResponse> {
    const version = await this.getLatestVersion();
    console.log(`[DataDragon] Fetching champion detail for ${championId}...`);

    try {
      const response = await fetchWithTimeout(
        `${BASE_URL}/cdn/${version}/data/en_US/champion/${championId}.json`
      );
      console.log(`[DataDragon] Champion detail response received for ${championId}, parsing JSON...`);
      const data: ChampionDetailResponse = await response.json();
      console.log(`[DataDragon] Champion detail parsed successfully for ${championId}`);
      return data;
    } catch (error) {
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
