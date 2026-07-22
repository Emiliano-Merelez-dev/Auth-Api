import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class BlacklistService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async addToBlacklist(token: string, ttl: number): Promise<void> {
    // ttl está en milisegundos. Redis lo guarda hasta que expire el token
    await this.cacheManager.set(token, 'blacklisted', ttl);
  }

  async isBlacklisted(token: string): Promise<boolean> {
    const value = await this.cacheManager.get(token);
    return !!value; // Retorna true si existe, false si no
  }
}
