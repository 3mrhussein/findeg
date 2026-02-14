import { IStorageProvider } from "@/application/services/interfaces/IStorageProvider";

/**
 * Media Service
 * Handles file uploads and management.
 * Wraps the Storage Provider to abstract storage logic.
 */
export class MediaService {
  /**
   * Creates an instance of MediaService
   *
   * @param storageProvider - Storage provider implementation (local, S3, R2, etc.)
   */
  constructor(private storageProvider: IStorageProvider) {}

  /**
   * Upload an image file.
   * Validates file type and size before uploading.
   */
  async uploadImage(file: File, folder: string = "general"): Promise<string> {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      throw new Error("Invalid file type. Only images are allowed.");
    }

    // Validate file size (MAX 5MB)
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      throw new Error("File too large. Maximum size is 5MB.");
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload via provider
    return this.storageProvider.upload(buffer, file.name, folder);
  }

  /**
   * Upload multiple images.
   */
  async uploadImages(files: File[], folder: string = "general"): Promise<string[]> {
    return Promise.all(files.map((file) => this.uploadImage(file, folder)));
  }

  /**
   * Delete a file.
   */
  async deleteFile(url: string): Promise<void> {
    return this.storageProvider.delete(url);
  }

  /**
   * List files in a folder.
   */
  async getFiles(folder: string = ""): Promise<{ url: string; name: string }[]> {
    return this.storageProvider.listFiles(folder);
  }
}
