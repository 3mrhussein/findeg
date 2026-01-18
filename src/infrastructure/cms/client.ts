/**
 * CMS Client
 *
 * This client handles communication with the CMS for static content and translations.
 */

import { cmsConfig } from "../config/cms.config";

export class CmsClient {
  private apiUrl: string;
  private apiKey: string;

  constructor() {
    this.apiUrl = cmsConfig.apiUrl;
    this.apiKey = cmsConfig.apiKey;
  }

  /**
   * Fetch translations from CMS
   */
  async getTranslations(language: string): Promise<Record<string, string>> {
    if (!this.apiUrl) {
      console.warn("CMS_API_URL is not set. Using mock translations.");
      return {};
    }

    try {
      const response = await fetch(
        `${this.apiUrl}/translations?lang=${language}`,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`CMS API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to fetch from CMS:", error);
      throw error;
    }
  }
}

export const cmsClient = new CmsClient();
