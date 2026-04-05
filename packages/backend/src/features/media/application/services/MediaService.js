export const MANAGED_MEDIA_FOLDERS = ["", "products", "brands"];
/**
 * Media Service
 *
 * Handles file uploads and management.
 * Wraps the Storage Provider to abstract storage logic.
 */
export class MediaService {
    /**
     * Creates an instance of MediaService.
     *
     * @param storageProvider - The physical storage adapter (e.g., Local, S3).
     */
    constructor(storageProvider) {
        this.storageProvider = storageProvider;
    }
    /**
     * Uploads an individual image file after validating that it is actually an image and passes size limits.
     *
     * @param file - The raw file object from the client.
     * @param folder - Target directory name within storage.
     * @returns The public URL of the uploaded image.
     * @throws Error if file type is invalid or size exceeds 5MB.
     */
    async uploadImage(file, folder = "general") {
        if (!file.type.startsWith("image/")) {
            throw new Error("Invalid file type. Only images are allowed.");
        }
        const MAX_SIZE = 5 * 1024 * 1024; // 5MB
        if (file.size > MAX_SIZE) {
            throw new Error("File too large. Maximum size is 5MB.");
        }
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        return this.storageProvider.upload(buffer, file.name, folder);
    }
    /**
     * Concurrently uploads multiple images.
     *
     * @param files - Array of image files.
     * @param folder - Destination folder.
     * @returns Array of public URLs.
     */
    async uploadImages(files, folder = "general") {
        return Promise.all(files.map((file) => this.uploadImage(file, folder)));
    }
    /**
     * Removes a file from persistent storage using its URL.
     *
     * @param url - The full URL or relative path of the file to delete.
     */
    async deleteFile(url) {
        return this.storageProvider.delete(url);
    }
    /**
     * Lists all files currently stored in a given folder.
     *
     * @param folder - Subdirectory to scan.
     * @returns List of objects with file URLs and names.
     */
    async getFiles(folder = "") {
        return this.storageProvider.listFiles(folder);
    }
    /**
     * Retrieves a flattened media library for admin management.
     *
     * @param folders - Folder scopes to include.
     */
    async getLibraryAssets(folders = MANAGED_MEDIA_FOLDERS) {
        const grouped = await Promise.all(folders.map(async (folder) => {
            const files = await this.getFiles(folder);
            return files.map((file) => ({
                url: file.url,
                name: file.name,
                folder: folder || "general",
            }));
        }));
        return grouped
            .flat()
            .sort((a, b) => a.folder.localeCompare(b.folder) || a.name.localeCompare(b.name));
    }
}
