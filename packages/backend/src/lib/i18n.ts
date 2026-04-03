/**
 * i18n Utility Functions
 * 
 * Provides internationalization helper functions for backend and frontend packages.
 * Supports English and Arabic locales.
 */

import { readFile } from 'fs/promises';
import { join } from 'path';

type Locale = 'en' | 'ar';

type Messages = Record<string, any>;

/**
 * Load translation messages for a specific app and locale
 * 
 * @param app - Application name ('dashboard' or 'storefront')
 * @param locale - Locale code ('en' or 'ar')
 * @returns Translation messages object
 */
export async function getMessages(
  app: 'dashboard' | 'storefront',
  locale: Locale
): Promise<Messages> {
  try {
    const messagesPath = join(
      process.cwd(),
      'packages',
      'backend',
      'src',
      'features',
      'core',
      'infrastructure',
      'cms',
      'messages',
      `${app}.${locale}.json`
    );
    
    const content = await readFile(messagesPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Failed to load messages for ${app}.${locale}:`, error);
    return {};
  }
}

/**
 * Format currency value with proper locale formatting
 * 
 * @param amount - Numeric amount to format
 * @param locale - Locale code ('en' or 'ar')
 * @param currency - Currency code (default: 'EGP' for Egyptian Pound)
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  locale: Locale = 'en',
  currency: string = 'EGP'
): string {
  try {
    return new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    // Fallback formatting
    return `${currency} ${amount.toFixed(2)}`;
  }
}

/**
 * Format date with proper locale formatting
 * 
 * @param date - Date to format (Date object, timestamp, or ISO string)
 * @param locale - Locale code ('en' or 'ar')
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | number | string,
  locale: Locale = 'en',
  options?: Intl.DateTimeFormatOptions
): string {
  try {
    const dateObj = typeof date === 'string' || typeof date === 'number' 
      ? new Date(date) 
      : date;

    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options,
    };

    return new Intl.DateTimeFormat(
      locale === 'ar' ? 'ar-EG' : 'en-US',
      defaultOptions
    ).format(dateObj);
  } catch (error) {
    return String(date);
  }
}

/**
 * Format date and time with proper locale formatting
 * 
 * @param date - Date to format
 * @param locale - Locale code ('en' or 'ar')
 * @returns Formatted date and time string
 */
export function formatDateTime(
  date: Date | number | string,
  locale: Locale = 'en'
): string {
  return formatDate(date, locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format relative time (e.g., "2 days ago", "in 3 hours")
 * 
 * @param date - Date to compare against now
 * @param locale - Locale code ('en' or 'ar')
 * @returns Relative time string
 */
export function formatRelativeTime(
  date: Date | number | string,
  locale: Locale = 'en'
): string {
  try {
    const dateObj = typeof date === 'string' || typeof date === 'number'
      ? new Date(date)
      : date;

    const now = new Date();
    const diffMs = dateObj.getTime() - now.getTime();
    const diffSec = Math.round(diffMs / 1000);
    const diffMin = Math.round(diffSec / 60);
    const diffHour = Math.round(diffMin / 60);
    const diffDay = Math.round(diffHour / 24);

    const rtf = new Intl.RelativeTimeFormat(
      locale === 'ar' ? 'ar-EG' : 'en-US',
      { numeric: 'auto' }
    );

    if (Math.abs(diffDay) >= 1) {
      return rtf.format(diffDay, 'day');
    } else if (Math.abs(diffHour) >= 1) {
      return rtf.format(diffHour, 'hour');
    } else if (Math.abs(diffMin) >= 1) {
      return rtf.format(diffMin, 'minute');
    } else {
      return rtf.format(diffSec, 'second');
    }
  } catch (error) {
    return String(date);
  }
}

/**
 * Format number with proper locale formatting
 * 
 * @param value - Number to format
 * @param locale - Locale code ('en' or 'ar')
 * @param options - Intl.NumberFormat options
 * @returns Formatted number string
 */
export function formatNumber(
  value: number,
  locale: Locale = 'en',
  options?: Intl.NumberFormatOptions
): string {
  try {
    return new Intl.NumberFormat(
      locale === 'ar' ? 'ar-EG' : 'en-US',
      options
    ).format(value);
  } catch (error) {
    return String(value);
  }
}
