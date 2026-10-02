import type { ActionState } from './roles';

/** `en` or `ar`: anything else falls back to `en`, so a crafted locale never reaches a path. */
export const normalizeLocale = (locale: string) => (locale === 'ar' ? 'ar' : 'en');

/**
 * Builds the error state for a service error. `messages` is keyed by the service's error union,
 * so adding an error code there fails type-checking until it has a message.
 */
export const failure = <E extends string>(messages: Record<E, string>, error: E): ActionState => ({
  status: 'error',
  message: messages[error],
});
