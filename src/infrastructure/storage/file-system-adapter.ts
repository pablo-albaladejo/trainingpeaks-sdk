/**
 * File System Storage Adapter
 * Implements persistent storage using JSON files
 */

import { StoragePort } from '@/application/ports/storage';
import type { AuthToken, User } from '@/domain';
import { isTokenExpired } from '@/infrastructure/services/auth-business-logic';
import { promises as fs } from 'fs';
import { join } from 'path';

interface StoredData {
  token: AuthToken | null;
  user: User | null;
  lastUpdated: string;
}

export class FileSystemStorageAdapter implements StoragePort {
  private readonly storagePath: string;
  private readonly dataFileName = 'auth-session.json';

  constructor(storagePath?: string) {
    // Default to user's home directory + .trainingpeaks-sdk
    this.storagePath =
      storagePath ||
      join(
        process.env.HOME || process.env.USERPROFILE || '.',
        '.trainingpeaks-sdk'
      );
  }

  private get dataFilePath(): string {
    return join(this.storagePath, this.dataFileName);
  }

  private async ensureStorageDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.storagePath, { recursive: true });
    } catch (error) {
      throw new Error(
        `Failed to create storage directory ${this.storagePath}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  private async readStoredData(): Promise<StoredData> {
    try {
      const data = await fs.readFile(this.dataFilePath, 'utf-8');
      const parsed = JSON.parse(data) as StoredData;

      // Convert date strings back to Date objects
      if (parsed.token?.expiresAt) {
        parsed.token.expiresAt = new Date(parsed.token.expiresAt);
      }

      return parsed;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        // File doesn't exist, return empty data
        return {
          token: null,
          user: null,
          lastUpdated: new Date().toISOString(),
        };
      }
      throw new Error(
        `Failed to read stored data from ${this.dataFilePath}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  private async writeStoredData(data: StoredData): Promise<void> {
    try {
      await this.ensureStorageDirectory();

      // Convert dates to ISO strings for JSON serialization
      const serializableData = {
        ...data,
        lastUpdated: new Date().toISOString(),
        token: data.token
          ? {
              ...data.token,
              expiresAt: data.token.expiresAt.toISOString(),
            }
          : null,
      };

      await fs.writeFile(
        this.dataFilePath,
        JSON.stringify(serializableData, null, 2)
      );
    } catch (error) {
      throw new Error(
        `Failed to write data to ${this.dataFilePath}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  public async storeToken(token: AuthToken): Promise<void> {
    const data = await this.readStoredData();
    data.token = token;
    await this.writeStoredData(data);
  }

  public async getToken(): Promise<AuthToken | null> {
    const data = await this.readStoredData();

    // Check if token is expired
    if (data.token && isTokenExpired(data.token.expiresAt)) {
      // Clear expired token
      data.token = null;
      await this.writeStoredData(data);
      return null;
    }

    return data.token;
  }

  public async storeUser(user: User): Promise<void> {
    const data = await this.readStoredData();
    data.user = user;
    await this.writeStoredData(data);
  }

  public async getUser(): Promise<User | null> {
    const data = await this.readStoredData();
    return data.user;
  }

  public async getUserId(): Promise<string | null> {
    const data = await this.readStoredData();
    return data.user?.id || null;
  }

  public async clear(): Promise<void> {
    try {
      await fs.unlink(this.dataFilePath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        // File doesn't exist, nothing to clear
        return;
      }
      throw new Error(
        `Failed to clear stored data: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  public async hasValidAuth(): Promise<boolean> {
    const token = await this.getToken();
    return token !== null && !isTokenExpired(token.expiresAt);
  }

  /**
   * Get the storage path for debugging
   */
  public getStoragePath(): string {
    return this.storagePath;
  }

  /**
   * Check if storage file exists
   */
  public async exists(): Promise<boolean> {
    try {
      await fs.access(this.dataFilePath);
      return true;
    } catch {
      return false;
    }
  }
}
