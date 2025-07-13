/**
 * User Domain Entity
 * Represents a TrainingPeaks user in the domain
 */

export class User {
  private constructor(
    private readonly _id: string,
    private readonly _name: string,
    private readonly _avatar?: string,
    private readonly _preferences?: Record<string, any>
  ) {
    this.validateId();
    this.validateName();
  }

  public static create(
    id: string,
    name: string,
    avatar?: string,
    preferences?: Record<string, any>
  ): User {
    return new User(id, name, avatar, preferences);
  }

  public get id(): string {
    return this._id;
  }

  public get name(): string {
    return this._name;
  }

  public get avatar(): string | undefined {
    return this._avatar;
  }

  public get preferences(): Record<string, any> | undefined {
    return this._preferences;
  }

  public equals(other: User): boolean {
    return this._id === other._id;
  }

  private validateId(): void {
    if (!this._id || this._id.trim().length === 0) {
      throw new Error('User ID cannot be empty');
    }
  }

  private validateName(): void {
    if (!this._name || this._name.trim().length === 0) {
      throw new Error('User name cannot be empty');
    }
  }
}
