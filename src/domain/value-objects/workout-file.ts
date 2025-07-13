/**
 * WorkoutFile Value Object
 * Represents a workout file with validation
 */

export class WorkoutFile {
  private static readonly ALLOWED_EXTENSIONS = ['.tcx', '.gpx', '.fit', '.xml'];
  private static readonly MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

  private constructor(
    private readonly _fileName: string,
    private readonly _content: string,
    private readonly _mimeType: string
  ) {
    this.validateFileName();
    this.validateContent();
    this.validateMimeType();
    this.validateFileSize();
    this.validateFileExtension();
  }

  public static create(
    fileName: string,
    content: string,
    mimeType: string
  ): WorkoutFile {
    return new WorkoutFile(fileName, content, mimeType);
  }

  public static fromBuffer(
    fileName: string,
    buffer: Buffer,
    mimeType: string
  ): WorkoutFile {
    return new WorkoutFile(fileName, buffer.toString('utf8'), mimeType);
  }

  public get fileName(): string {
    return this._fileName;
  }

  public get content(): string {
    return this._content;
  }

  public get mimeType(): string {
    return this._mimeType;
  }

  public get extension(): string {
    const lastDotIndex = this._fileName.lastIndexOf('.');
    if (lastDotIndex === -1) return '';
    return this._fileName.substring(lastDotIndex).toLowerCase();
  }

  public get baseName(): string {
    const lastDotIndex = this._fileName.lastIndexOf('.');
    if (lastDotIndex === -1) return this._fileName;
    return this._fileName.substring(0, lastDotIndex);
  }

  public get size(): number {
    return Buffer.byteLength(this._content, 'utf8');
  }

  public isTcxFile(): boolean {
    return this.extension === '.tcx';
  }

  public isGpxFile(): boolean {
    return this.extension === '.gpx';
  }

  public isFitFile(): boolean {
    return this.extension === '.fit';
  }

  public equals(other: WorkoutFile): boolean {
    return (
      this._fileName === other._fileName &&
      this._content === other._content &&
      this._mimeType === other._mimeType
    );
  }

  private validateFileName(): void {
    if (!this._fileName || this._fileName.trim().length === 0) {
      throw new Error('File name cannot be empty');
    }
    if (this._fileName.length > 255) {
      throw new Error('File name cannot exceed 255 characters');
    }
  }

  private validateContent(): void {
    if (!this._content) {
      throw new Error('File content cannot be empty');
    }
  }

  private validateMimeType(): void {
    if (!this._mimeType || this._mimeType.trim().length === 0) {
      throw new Error('MIME type cannot be empty');
    }
  }

  private validateFileSize(): void {
    const size = this.size;
    if (size > WorkoutFile.MAX_FILE_SIZE) {
      throw new Error(
        `File size (${size} bytes) exceeds maximum limit of ${WorkoutFile.MAX_FILE_SIZE} bytes`
      );
    }
  }

  private validateFileExtension(): void {
    const extension = this.extension;
    if (!WorkoutFile.ALLOWED_EXTENSIONS.includes(extension)) {
      throw new Error(
        `Unsupported file extension: ${extension}. Allowed extensions: ${WorkoutFile.ALLOWED_EXTENSIONS.join(
          ', '
        )}`
      );
    }
  }
}
