import * as constants from './constants';

export type Locale = (typeof constants.LOCALES)[number];

/** Text shown in each supported locale. */
export interface LocalizedText {
  en: string;
  ar?: string;
}
