/**
 * Storage Provider Interface
 * Strategy pattern for file storage (Local vs S3/R2).
 */
export interface IStorageProvider {
  /**
   * Uploads a file and returns its public URL.
   * @param file - The file buffer or stream
   * @param filename - The original filename
   * @param folder - Optional folder prefix (e.g., "products", "brands")
   */
  upload(file: Buffer, filename: string, folder?: string): Promise<string>;

  /**
   * Deletes a file by its URL or key.
   * @param url - The public URL of the file
   */
  delete(url: string): Promise<void>;

  /**
   * Gets the public URL for a stored file.
   * @param key - The storage key/path
   */
  getUrl(key: string): string;

  /**
   * Lists files in a folder.
   * @param folder - Folder path relative to root
   */
  listFiles(folder?: string): Promise<{ url: string; name: string }[]>;
}
