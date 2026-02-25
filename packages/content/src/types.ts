/** Locale is a string representing the locale directory name (e.g., "en", "nl") */
export type Locale = string;

export interface PageData {
  title?: string;
  description?: string;
  [key: string]: unknown;
}
