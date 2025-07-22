/**
 * AuthToken Domain Entity
 * Represents authentication token in the domain - pure data container
 */

export class AuthToken {
  constructor(
    private readonly _accessToken: string,
    private readonly _tokenType: string,
    private readonly _expiresAt: Date,
    private readonly _refreshToken?: string
  ) {}

  // Getters only - no business logic
  public get accessToken(): string {
    return this._accessToken;
  }

  public get tokenType(): string {
    return this._tokenType;
  }

  public get expiresAt(): Date {
    return this._expiresAt;
  }

  public get expiresAtTimestamp(): number {
    return this._expiresAt.getTime();
  }

  public get refreshToken(): string | undefined {
    return this._refreshToken;
  }
}
