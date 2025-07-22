/**
 * User Domain Entity
 * Represents a TrainingPeaks user in the domain - pure data container
 */

export class User {
  constructor(
    private readonly _id: string,
    private readonly _name: string,
    private readonly _avatar?: string,
    private readonly _preferences?: Record<string, unknown>
  ) {}

  // Getters only - no business logic
  public get id(): string {
    return this._id;
  }

  public get name(): string {
    return this._name;
  }

  public get avatar(): string | undefined {
    return this._avatar;
  }

  public get preferences(): Record<string, unknown> | undefined {
    return this._preferences;
  }
}
