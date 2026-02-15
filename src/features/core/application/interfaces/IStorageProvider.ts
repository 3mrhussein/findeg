/**
 * interface IStorageProvider
 *
 * Abstract port for file storage operations.
 */
export interface IStorageProvider {
  /**
   * Uploads a file buffer to the storage system.
   *
   * @param buffer - The raw file content to upload.
   * @param fileName - The desired name for the file in storage.
   * @param folder - The target folder or bucket path.
   * @returns The public URL of the uploaded asset.
   */
  upload(buffer: Buffer, fileName: string, folder: string): Promise<string>;

  /**
   * Deletes a file from the storage system.
   *
   * @param url - The public URL of the file to remove.
   */
  delete(url: string): Promise<void>;

  /**
   * Lists all files within a specified storage folder.
   *
   * @param folder - The path to scan.
   * @returns A list of objects containing the public URL and name of each file.
   */
  listFiles(folder: string): Promise<{ url: string; name: string }[]>;
}
