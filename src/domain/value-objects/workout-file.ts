/**
 * WorkoutFile Value Object
 * Represents a workout file - pure data container
 */

export class WorkoutFile {
  constructor(
    private readonly _fileName: string,
    private readonly _content: string,
    private readonly _mimeType: string
  ) {}

  // Getters only - no business logic
  public get fileName(): string {
    return this._fileName;
  }

  public get content(): string {
    return this._content;
  }

  public get mimeType(): string {
    return this._mimeType;
  }
}
