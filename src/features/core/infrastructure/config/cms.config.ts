/**
 * CMS Configuration
 *
 * This file handles CMS connection configuration for static translations.
 */

/**
 * CMS Configuration interface
 */
export interface CmsConfig {
  apiUrl: string;
  apiKey: string;
}

/**
 * Get CMS configuration from environment
 *
 * @returns CMS configuration object
 */
export function getCmsConfig(): CmsConfig {
  return {
    apiUrl: process.env.CMS_API_URL || "",
    apiKey: process.env.CMS_API_KEY || "",
  };
}

/**
 * CMS configuration instance
 */
export const cmsConfig = getCmsConfig();
