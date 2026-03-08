import { Order } from "@/features/order/domain/entities/Order";

/**
 * Minimal DTOs for emails related to types not yet fully modeled in the domain.
 */
export interface EmailSchoolList {
  id: string;
  schoolName: string;
  grade: string;
  academicYear: string;
  listName: string; // The localized title
}

export interface AccessRequest {
  id: string;
  requesterName: string;
  requesterEmail: string;
  schoolName: string;
  requestDate: string;
}

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
    customer: { email: string; firstName?: string; name?: string },
  ): Promise<void>;

  /**
   * Sent when an admin updates the status of an order (e.g., shipped, delivered).
   */
  sendOrderStatusUpdate(order: Order, newStatus: string): Promise<void>;

  /**
   * Sent when a user requests a password reset.
   */
  sendPasswordReset(
    user: { email: string; firstName?: string; name?: string },
    resetToken: string,
  ): Promise<void>;

  /**
   * Sent when a school administrator approves a parent's access to a private list.
   */
  sendSchoolListAccessApproved(
    user: { email: string; firstName?: string; name?: string },
    list: EmailSchoolList,
  ): Promise<void>;

  /**
   * Sent to a school administrator when a parent requests access to a private list.
   */
  sendSchoolListAccessRequest(
    schoolAdmin: { email: string; firstName?: string; name?: string },
    request: AccessRequest,
  ): Promise<void>;

  /**
   * Sent to a newly invited admin user with a link to set their password.
   */
  sendAdminInvitation(
    admin: { email: string; firstName?: string; name?: string },
    inviteToken: string,
  ): Promise<void>;
}
