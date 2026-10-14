// Temporary compatibility entry; each context owns its response messages.
import { API_SUCCESS_MESSAGES as catalogMessages } from '../../../catalog/contracts';
import { ORDER_SUCCESS_MESSAGES } from '@findeg/orders';

export { DOMAIN_DEFAULTS } from '../../../catalog/contracts';
export const API_SUCCESS_MESSAGES = { ...catalogMessages, ...ORDER_SUCCESS_MESSAGES } as const;
