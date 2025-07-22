/**
 * Credentials Value Object
 * Represents user authentication credentials - pure data container
 */

export class Credentials {
  constructor(
    private readonly _username: string,
    private readonly _password: string
  ) {}

  // Getters only - no business logic
  public get username(): string {
    return this._username;
  }

  public get password(): string {
    return this._password;
  }
}
