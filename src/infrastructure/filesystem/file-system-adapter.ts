/**
 * File System Adapter
 * Implements file system operations
 */

import { promises as fs } from 'fs';
import { join } from 'path';
import { FileSystemPort } from '@/application/ports/workout';

export class FileSystemAdapter implements FileSystemPort {
  public async readFile(filePath: string): Promise<string> {
    try {
      return await fs.readFile(filePath, 'utf8');
    } catch (error) {
      throw new Error(
        `Failed to read file ${filePath}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  public async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  public async writeFile(filePath: string, content: string): Promise<void> {
    try {
      // Ensure directory exists
      const dir = join(filePath, '..');
      await fs.mkdir(dir, { recursive: true });

      // Write file
      await fs.writeFile(filePath, content, 'utf8');
    } catch (error) {
      throw new Error(
        `Failed to write file ${filePath}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }
}
