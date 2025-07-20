/**
 * File System Adapter
 * Implements file system operations
 */

import { FileSystemPort } from '@/application/ports/workout';
import { promises as fs } from 'fs';
import { join } from 'path';

export class FileSystemAdapter implements FileSystemPort {
  public async readFile(filePath: string): Promise<Buffer> {
    try {
      return await fs.readFile(filePath);
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

  public async writeFile(filePath: string, data: Buffer): Promise<void> {
    try {
      // Ensure directory exists
      const dir = join(filePath, '..');
      await fs.mkdir(dir, { recursive: true });

      // Write file
      await fs.writeFile(filePath, data);
    } catch (error) {
      throw new Error(
        `Failed to write file ${filePath}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  public async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      throw new Error(
        `Failed to delete file ${filePath}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  public async exists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  public async createDirectory(dirPath: string): Promise<void> {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      throw new Error(
        `Failed to create directory ${dirPath}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  public async listFiles(dirPath: string): Promise<string[]> {
    try {
      const files = await fs.readdir(dirPath);
      return files;
    } catch (error) {
      throw new Error(
        `Failed to list files in ${dirPath}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  public async getFileStats(filePath: string): Promise<{
    size: number;
    created: Date;
    modified: Date;
  }> {
    try {
      const stats = await fs.stat(filePath);
      return {
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
      };
    } catch (error) {
      throw new Error(
        `Failed to get file stats for ${filePath}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  public async moveFile(sourcePath: string, destPath: string): Promise<void> {
    try {
      await fs.rename(sourcePath, destPath);
    } catch (error) {
      throw new Error(
        `Failed to move file from ${sourcePath} to ${destPath}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  public async copyFile(sourcePath: string, destPath: string): Promise<void> {
    try {
      await fs.copyFile(sourcePath, destPath);
    } catch (error) {
      throw new Error(
        `Failed to copy file from ${sourcePath} to ${destPath}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }
}
