/**
 * Transactional Email Service
 * Handles all outbound system emails (receipts, resets, invites, etc.).
 */
export interface IEmailService {
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
