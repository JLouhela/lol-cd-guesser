import type { ChampionListResponse, ChampionDetailResponse } from '../types';

const BASE_URL = 'https://ddragon.leagueoflegends.com';

export class DataDragonService {
  private version: string | null = null;

  async getLatestVersion(): Promise<string> {
    if (this.version) {
      return this.version;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/versions.json`);
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

    try {
      const response = await fetch(
        `${BASE_URL}/cdn/${version}/data/en_US/champion.json`
      );
      const data: ChampionListResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch champion list:', error);
      throw new Error('Failed to fetch champion list');
    }
  }

  async getChampionDetail(championId: string): Promise<ChampionDetailResponse> {
    const version = await this.getLatestVersion();

    try {
      const response = await fetch(
        `${BASE_URL}/cdn/${version}/data/en_US/champion/${championId}.json`
      );
      const data: ChampionDetailResponse = await response.json();
      return data;
    } catch (error) {
      console.error(`Failed to fetch champion detail for ${championId}:`, error);
      throw new Error(`Failed to fetch champion detail for ${championId}`);
    }
  }

  getChampionIconUrl(championId: string): string {
    if (!this.version) {
      throw new Error('Version not loaded');
    }
    return `${BASE_URL}/cdn/${this.version}/img/champion/${championId}.png`;
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
