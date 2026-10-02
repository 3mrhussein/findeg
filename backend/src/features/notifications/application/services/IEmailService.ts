import type { Order } from '@findeg/backend/features/order';

/**
 * Transactional Email Service
 * Handles all outbound system emails (receipts, resets, invites, etc.).
 */
export interface IEmailService {
  /**
   * Sent when a customer successfully completes checkout.
   */
  sendOrderConfirmation(
    order: Order,
    customer: { email: string; firstName?: string; lastName?: string },
  ): Promise<void>;

  /**
   * Sent when an admin updates the status of an order (e.g., shipped, delivered).
   */
  sendOrderStatusUpdate(order: Order, newStatus: string): Promise<void>;

  /**
   * Sent when a user requests a password reset.
   */
  sendPasswordReset(
    user: { email: string; firstName?: string; lastName?: string },
    resetToken: string,
  ): Promise<void>;

  /**
   * Sent to a newly invited admin user with a link to set their password.
   */
  sendAdminInvitation(
    admin: { email: string; firstName?: string; lastName?: string },
    inviteToken: string,
  ): Promise<void>;
}
