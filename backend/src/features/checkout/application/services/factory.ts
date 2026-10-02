import { CheckoutService, type CheckoutServiceOptions } from './CheckoutService';
import type { ICheckoutService } from '../interfaces/ICheckoutService';

export function createCheckoutService(options?: CheckoutServiceOptions): ICheckoutService {
  return new CheckoutService(options);
}
