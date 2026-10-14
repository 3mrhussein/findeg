// Temporary compatibility entry; each context owns its response messages.
import { API_SUCCESS_MESSAGES as catalogMessages } from '@findeg/catalog';
import { ORDER_SUCCESS_MESSAGES } from '../../../checkout/contracts';

export { DOMAIN_DEFAULTS } from '@findeg/catalog';
export const API_SUCCESS_MESSAGES = { ...catalogMessages, ...ORDER_SUCCESS_MESSAGES } as const;
