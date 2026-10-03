import { GuestAccessService } from './application/GuestAccessService';

export function createGuestAccessService(): GuestAccessService {
  return new GuestAccessService();
}

export type {
  GuestAccessService,
  RequestAccessResult,
  VerifyResult,
} from './application/GuestAccessService';
export { hashCode, mintCode } from './domain/codes';
export { GUEST_ORDER_COOKIE, GUEST_ORDER_TOKEN_SECONDS } from './domain/token';
export {
  GuestAccessRequestSchema,
  GuestAccessVerifySchema,
  type GuestAccessRequestInput,
  type GuestAccessVerifyInput,
  type GuestOrderView,
} from './schemas';
