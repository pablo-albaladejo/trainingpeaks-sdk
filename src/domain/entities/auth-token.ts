/**
 * AuthToken Domain Entity
 * Represents authentication token in the domain
 */

export class AuthToken {
  private constructor(
    private readonly _accessToken: string,
    private readonly _tokenType: string,
    private readonly _expiresAt: Date,
    private readonly _refreshToken?: string
  ) {
    this.validateAccessToken();
    this.validateTokenType();
    this.validateExpiresAt();
  }

  public static create(
    accessToken: string,
    tokenType: string,
    expiresAt: Date,
    refreshToken?: string
  ): AuthToken {
    return new AuthToken(accessToken, tokenType, expiresAt, refreshToken);
  }

  public static fromTimestamp(
    accessToken: string,
    tokenType: string,
    expiresAtTimestamp: number,
    refreshToken?: string
  ): AuthToken {
    return new AuthToken(
      accessToken,
      tokenType,
      new Date(expiresAtTimestamp),
      refreshToken
    );
  }

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

  public isExpired(): boolean {
    return new Date() >= this._expiresAt;
  }

  public isValidFor(durationMs: number): boolean {
    const requiredTime = new Date(Date.now() + durationMs);
    return requiredTime <= this._expiresAt;
  }

  public timeUntilExpiry(): number {
    return Math.max(0, this._expiresAt.getTime() - Date.now());
  }

  public getAuthorizationHeader(): string {
    return `${this._tokenType} ${this._accessToken}`;
  }

  public equals(other: AuthToken): boolean {
    return this._accessToken === other._accessToken;
  }

  private validateAccessToken(): void {
    if (!this._accessToken || this._accessToken.trim().length === 0) {
      throw new Error('Access token cannot be empty');
    }
  }

  private validateTokenType(): void {
    if (!this._tokenType || this._tokenType.trim().length === 0) {
      throw new Error('Token type cannot be empty');
    }
  }

  private validateExpiresAt(): void {
    if (!this._expiresAt || isNaN(this._expiresAt.getTime())) {
      throw new Error('Expires at must be a valid date');
    }
  }
}
