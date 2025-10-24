import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';

/**
 * Read file contents as string
 */
export async function readFile(filePath: string): Promise<string> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return content;
  } catch (error) {
    throw new Error(`Failed to read file ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Write content to file
 */
export async function writeFile(filePath: string, content: string): Promise<void> {
  try {
    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fsSync.existsSync(dir)) {
      await fs.mkdir(dir, { recursive: true });
    }
    
    await fs.writeFile(filePath, content, 'utf-8');
  } catch (error) {
    throw new Error(`Failed to write file ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * List all files in a directory
 */
export async function listFilesInDirectory(dirPath: string): Promise<string[]> {
  try {
    const files = await fs.readdir(dirPath);
    return files.filter(file => {
      const fullPath = path.join(dirPath, file);
      return fsSync.statSync(fullPath).isFile();
    });
  } catch (error) {
    throw new Error(`Failed to list files in ${dirPath}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Check if file exists
 */
export function fileExists(filePath: string): boolean {
  return fsSync.existsSync(filePath);
}

/**
 * Get file extension
 */
export function getFileExtension(filePath: string): string {
  return path.extname(filePath);
}

/**
 * Get file name without extension
 */
export function getFileNameWithoutExtension(filePath: string): string {
  return path.parse(filePath).name;
}

/**
 * Read JSON file and parse it
 */
export async function readJsonFile<T>(filePath: string): Promise<T> {
  const content = await readFile(filePath);
  try {
    return JSON.parse(content) as T;
  } catch (error) {
    throw new Error(`Failed to parse JSON from ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Write object to JSON file
 */
export async function writeJsonFile(filePath: string, data: any): Promise<void> {
  const content = JSON.stringify(data, null, 2);
  await writeFile(filePath, content);
}

/**
 * Create directory if it doesn't exist
 */
export async function ensureDirectoryExists(dirPath: string): Promise<void> {
  if (!fsSync.existsSync(dirPath)) {
    await fs.mkdir(dirPath, { recursive: true });
  }
}