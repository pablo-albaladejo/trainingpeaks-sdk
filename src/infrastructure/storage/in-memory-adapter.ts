/**
 * In-Memory Storage Adapter
 * Implements storage using in-memory variables (not persistent across sessions)
 */

import { StoragePort } from '@/application/ports/storage';
import { AuthToken } from '@/domain/entities/auth-token';
import { User } from '@/domain/entities/user';
import { isTokenExpired } from '@/infrastructure/services/auth-business-logic';

export class InMemoryStorageAdapter implements StoragePort {
  private storedToken: AuthToken | null = null;
  private storedUser: User | null = null;

  public async storeToken(token: AuthToken): Promise<void> {
    this.storedToken = token;
  }

  public async getToken(): Promise<AuthToken | null> {
    // Check if token is expired
    if (this.storedToken && isTokenExpired(this.storedToken.expiresAt)) {
      this.storedToken = null;
    }

    return this.storedToken;
  }

  public async storeUser(user: User): Promise<void> {
    this.storedUser = user;
  }

  public async getUser(): Promise<User | null> {
    return this.storedUser;
  }

  public async getUserId(): Promise<string | null> {
    return this.storedUser?.id || null;
  }

  public async clear(): Promise<void> {
    this.storedToken = null;
    this.storedUser = null;
  }

  public async hasValidAuth(): Promise<boolean> {
    const token = await this.getToken();
    return token !== null && !isTokenExpired(token.expiresAt);
  }
}
