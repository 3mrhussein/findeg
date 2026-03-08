import { Resend } from "resend";
import { render } from "@react-email/components";
import React from "react";
import { Order } from "@/features/order/domain/entities/Order";
import {
  AccessRequest,
  EmailSchoolList,
  IEmailService,
} from "../application/services/IEmailService";

// Import Templates
import OrderConfirmationEmail from "./templates/OrderConfirmationEmail";
import OrderStatusUpdateEmail from "./templates/OrderStatusUpdateEmail";
import PasswordResetEmail from "./templates/PasswordResetEmail";
import SchoolListAccessApprovedEmail from "./templates/SchoolListAccessApprovedEmail";
import SchoolListAccessRequestEmail from "./templates/SchoolListAccessRequestEmail";
import AdminInvitationEmail from "./templates/AdminInvitationEmail";
// Helper to format prices
/**
 *
 */
const formatCurrency = (amount: number, currency: string | undefined, locale: string) => {
  return new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-EG", {
    style: "currency",
    currency: currency || "EGP",
  }).format(amount);
};

/**
 *
 */
export class ResendEmailService implements IEmailService {
  private resend: Resend;
  private defaultFrom: string;

  /**
   *
   */
  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY || "re_fallback_key");
    this.defaultFrom =
      process.env.EMAIL_FROM_NAME && process.env.EMAIL_FROM
        ? `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`
        : "FindEg <noreply@findeg.com>";
  }

  /**
   *
   */
  private async sendEmail(
    to: string,
    subject: string,
    template: React.ReactElement,
  ): Promise<void> {
    try {
      if (!process.env.RESEND_API_KEY) {
        console.warn("Emails not sent: RESEND_API_KEY is not configured.");
        return;
      }

      await this.resend.emails.send({
        from: this.defaultFrom,
        to,
        subject,
        react: template,
      });
    } catch (error) {
      // Fire-and-forget: we don't want email failures to break business flows
      console.error("[EmailService] Failed to send email:", error);
    }
  }

  /**
   *
   */
  private resolveLocale(customerLocale?: string | null): string {
    return customerLocale === "ar" ? "ar" : "en";
  }

  /**
   *
   */
  async sendOrderConfirmation(
    order: Order,
    customer: { email: string; firstName?: string; name?: string; locale?: string | null },
  ): Promise<void> {
    const locale = this.resolveLocale(customer.locale);
    const subject = locale === "ar" ? `تأكيد طلبك #${order.id}` : `Order Confirmation #${order.id}`;

    const items = (order.items || []).map((item) => ({
      name: item.productNameSnapshot || "",
      quantity: item.quantity,
      price: formatCurrency(item.totalPrice || 0, order.currency, locale),
    }));

    const addressParts = [
      order.shippingAddressSnapshot?.street,
      order.shippingAddressSnapshot?.area,
      order.shippingAddressSnapshot?.city,
    ].filter(Boolean);
    const address = addressParts.join(", ");

    const template = React.createElement(OrderConfirmationEmail, {
      orderId: order.id.toString(),
      customerName: customer.firstName || customer.name || "Customer",
      items,
      total: formatCurrency(order.totalAmount || 0, order.currency, locale),
      deliveryAddress: address,
      locale,
    });

    await this.sendEmail(customer.email, subject, template);
  }

  /**
   *
   */
  async sendOrderStatusUpdate(order: Order, newStatus: string): Promise<void> {
    if (!order.customerEmail) return;

    const locale = this.resolveLocale(
      "customerLocale" in order ? (order as any).customerLocale : "en",
    );
    const subject =
      locale === "ar" ? `تحديث حالة طلبك #${order.id}` : `Update on your order #${order.id}`;

    const template = React.createElement(OrderStatusUpdateEmail, {
      orderId: order.id,
      customerName: order.customerName || "Customer",
      newStatus,
      trackingNumber: order.trackingNumber || undefined,
      locale,
    });

    await this.sendEmail(order.customerEmail, subject, template);
  }

  /**
   *
   */
  async sendPasswordReset(
    user: { email: string; firstName?: string; name?: string; locale?: string | null },
    resetToken: string,
  ): Promise<void> {
    const locale = this.resolveLocale(user.locale);
    const subject = locale === "ar" ? "إعادة تعيين كلمة المرور" : "Reset your password";
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://findeg.com";
    const resetLink = `${baseUrl}/${locale}/reset-password?token=${resetToken}`;

    const template = React.createElement(PasswordResetEmail, {
      customerName: user.firstName || user.name || "User",
      resetLink,
      locale,
    });

    await this.sendEmail(user.email, subject, template);
  }

  /**
   *
   */
  async sendSchoolListAccessApproved(
    user: { email: string; firstName?: string; name?: string; locale?: string | null },
    list: EmailSchoolList,
  ): Promise<void> {
    const locale = this.resolveLocale(user.locale);
    const subject = locale === "ar" ? "تمت الموافقة على وصولك" : "Access Approved";

    const template = React.createElement(SchoolListAccessApprovedEmail, {
      customerName: user.firstName || user.name || "Parent",
      listName: list.listName,
      schoolName: list.schoolName,
      listId: list.id,
      locale,
    });

    await this.sendEmail(user.email, subject, template);
  }

  /**
   *
   */
  async sendSchoolListAccessRequest(
    schoolAdmin: { email: string; firstName?: string; name?: string; locale?: string | null },
    request: AccessRequest,
  ): Promise<void> {
    const locale = this.resolveLocale(schoolAdmin.locale);
    const subject = locale === "ar" ? "طلب وصول جديد إلى القائمة" : "New List Access Request";

    const template = React.createElement(SchoolListAccessRequestEmail, {
      adminName: schoolAdmin.firstName || schoolAdmin.name || "Admin",
      requesterName: request.requesterName,
      requesterEmail: request.requesterEmail,
      schoolName: request.schoolName,
      requestId: request.id,
      locale,
    });

    await this.sendEmail(schoolAdmin.email, subject, template);
  }

  /**
   *
   */
  async sendAdminInvitation(
    admin: { email: string; firstName?: string; name?: string; locale?: string | null },
    inviteToken: string,
  ): Promise<void> {
    const locale = this.resolveLocale(admin.locale);
    const subject = locale === "ar" ? "دعوة لإدارة فايند إي جي" : "Invitation to manage FindEg";
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://findeg.com";
    const inviteLink = `${baseUrl}/admin/accept-invite?token=${inviteToken}`;

    const template = React.createElement(AdminInvitationEmail, {
      adminName: admin.firstName || admin.name || "Admin",
      inviteLink,
      locale,
    });

    await this.sendEmail(admin.email, subject, template);
  }
}
