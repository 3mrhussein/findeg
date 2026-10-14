import { DomainError } from '../common';
import type { OrderErrorCode } from './types';

/** An Order, or a request to make or change one, that breaks an Order rule. */
export class OrderError extends DomainError<OrderErrorCode> {}
