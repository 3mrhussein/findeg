/**
 * Translation Types
 */

export type LanguageCode = "en" | "ar";

export interface StaticTranslations {
  [key: string]: string;
}

export interface DynamicTranslation {
  language: LanguageCode;
  [key: string]: any;
}
