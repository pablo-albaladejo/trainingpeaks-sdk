/**
 * Credentials Value Object
 * Represents user authentication credentials
 */

export class Credentials {
  private constructor(
    private readonly _username: string,
    private readonly _password: string
  ) {
    this.validateUsername();
    this.validatePassword();
  }

  public static create(username: string, password: string): Credentials {
    return new Credentials(username, password);
  }

  public get username(): string {
    return this._username;
  }

  public get password(): string {
    return this._password;
  }

  public equals(other: Credentials): boolean {
    return (
      this._username === other._username && this._password === other._password
    );
  }

  private validateUsername(): void {
    if (!this._username || this._username.trim().length === 0) {
      throw new Error('Username cannot be empty');
    }

    if (this._username.length < 3) {
      throw new Error('Username must be at least 3 characters long');
    }
  }

  private validatePassword(): void {
    if (!this._password || this._password.trim().length === 0) {
      throw new Error('Password cannot be empty');
    }

    if (this._password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }
  }
}
