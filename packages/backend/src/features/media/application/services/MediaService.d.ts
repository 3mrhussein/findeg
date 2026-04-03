import type { IStorageProvider } from "@/features/core/application/interfaces/IStorageProvider";
import type { MediaAsset } from "@/features/media/domain/entities/MediaAsset";
export declare const MANAGED_MEDIA_FOLDERS: readonly ["", "products", "brands"];
/**
 * Media Service
 *
 * Handles file uploads and management.
 * Wraps the Storage Provider to abstract storage logic.
 */
export declare class MediaService {
    private storageProvider;
    /**
     * Creates an instance of MediaService.
     *
     * @param storageProvider - The physical storage adapter (e.g., Local, S3).
     */
    constructor(storageProvider: IStorageProvider);
    /**
     * Uploads an individual image file after validating that it is actually an image and passes size limits.
     *
     * @param file - The raw file object from the client.
     * @param folder - Target directory name within storage.
     * @returns The public URL of the uploaded image.
     * @throws Error if file type is invalid or size exceeds 5MB.
     */
    uploadImage(file: File, folder?: string): Promise<string>;
    /**
     * Concurrently uploads multiple images.
     *
     * @param files - Array of image files.
     * @param folder - Destination folder.
     * @returns Array of public URLs.
     */
    uploadImages(files: File[], folder?: string): Promise<string[]>;
    /**
     * Removes a file from persistent storage using its URL.
     *
     * @param url - The full URL or relative path of the file to delete.
     */
    deleteFile(url: string): Promise<void>;
    /**
     * Lists all files currently stored in a given folder.
     *
     * @param folder - Subdirectory to scan.
     * @returns List of objects with file URLs and names.
     */
    getFiles(folder?: string): Promise<{
        url: string;
        name: string;
    }[]>;
    /**
     * Retrieves a flattened media library for admin management.
     *
     * @param folders - Folder scopes to include.
     */
    getLibraryAssets(folders?: readonly string[]): Promise<MediaAsset[]>;
}
