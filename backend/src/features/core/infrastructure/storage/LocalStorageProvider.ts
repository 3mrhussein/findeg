import fs from "fs";

import path from "path";
import { v4 as uuidv4 } from "uuid";
import type { IStorageProvider } from "@findeg/backend/features/core/application/interfaces/IStorageProvider";

/**
 * Local Storage Provider
 * Saves files to the local filesystem (public/uploads directory).
 * Useful for development or simple deployments.
 *
 * Note: Intended for server-side use only (requires filesystem access).
 */
export class LocalStorageProvider implements IStorageProvider {
  private uploadDir: string;
  private baseUrl: string;

  /**
   *
   */
  constructor(uploadDir: string = "./public/uploads", baseUrl: string = "/uploads") {
    this.uploadDir = uploadDir;
    this.baseUrl = baseUrl;
    // Ensure upload directory exists
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  /**
   *
   */
  async upload(file: Buffer, filename: string, folder: string = ""): Promise<string> {
    const ext = path.extname(filename);
    const uniqueName = `${uuidv4()}${ext}`;
    const targetDir = path.join(this.uploadDir, folder);

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const filePath = path.join(targetDir, uniqueName);

    // Write file to disk
    await fs.promises.writeFile(filePath, file);

    // Return public URL
    const urlPath = path.join(folder, uniqueName).replace(/\\/g, "/"); // Ensure forward slashes for URL
    return `${this.baseUrl}/${urlPath}`;
  }

  /**
   *
   */
  async delete(url: string): Promise<void> {
    try {
      // Extract relative path from URL
      // URL: /uploads/products/image.jpg -> Path: ./public/uploads/products/image.jpg
      const relativePath = url.replace(this.baseUrl, "");
      const filePath = path.join(this.uploadDir, relativePath);

      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
    } catch (error) {
      console.error(`Failed to delete file at ${url}:`, error);
      // Don't throw, just log. Deletion failure shouldn't block main flow.
    }
  }

  /**
   *
   */
  getUrl(key: string): string {
    return `${this.baseUrl}/${key}`;
  }

  /**
   *
   */
  async listFiles(folder: string = ""): Promise<{ url: string; name: string }[]> {
    const targetDir = path.join(this.uploadDir, folder);

    if (!fs.existsSync(targetDir)) {
      return [];
    }

    const files = await fs.promises.readdir(targetDir);

    const fileStats = await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(targetDir, file);
        const stat = await fs.promises.stat(filePath);
        return { name: file, isFile: stat.isFile() };
      }),
    );

    return fileStats
      .filter((f) => f.isFile && !f.name.startsWith(".")) // Exclude hidden files
      .map((f) => {
        const urlPath = path.join(folder, f.name).replace(/\\/g, "/");
        return {
          name: f.name,
          url: `${this.baseUrl}/${urlPath}`,
        };
      });
  }
}
