import { Resend } from 'resend';
import React from 'react';
import { IEmailService } from '../application/services/IEmailService';

// Import Templates
import PasswordResetEmail from './templates/PasswordResetEmail';
import AdminInvitationEmail from './templates/AdminInvitationEmail';
import env from '@findeg/env';
import { parse } from '../../core/domain/value-objects';

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
    this.resend = new Resend(env.RESEND_API_KEY || 're_fallback_key');
    this.defaultFrom = `${env.EMAIL_FROM_NAME} <${env.EMAIL_FROM}>`;
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
      if (!env.RESEND_API_KEY) {
        console.warn('Emails not sent: RESEND_API_KEY is not configured.');
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
      console.error('[EmailService] Failed to send email:', error);
    }
  }

  /**
   *
   */
  async sendPasswordReset(
    user: { email: string; firstName?: string; lastName?: string; locale?: string | null },
    resetToken: string,
  ): Promise<void> {
    const locale = parse(user.locale);
    const subject = locale === 'ar' ? 'إعادة تعيين كلمة المرور' : 'Reset your password';
    const baseUrl = env.NEXT_PUBLIC_APP_URL;
    const resetLink = `${baseUrl}/${locale}/reset-password?token=${resetToken}`;

    const template = React.createElement(PasswordResetEmail, {
      customerName: [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || 'User',
      resetLink,
      locale,
    });

    await this.sendEmail(user.email, subject, template);
  }

  /**
   *
   */
  async sendAdminInvitation(
    admin: { email: string; firstName?: string; lastName?: string; locale?: string | null },
    inviteToken: string,
  ): Promise<void> {
    const locale = parse(admin.locale);
    const subject = locale === 'ar' ? 'دعوة لإدارة فايند إي جي' : 'Invitation to manage FindEg';
    const baseUrl = env.NEXT_PUBLIC_APP_URL;
    const inviteLink = `${baseUrl}/admin/accept-invite?token=${inviteToken}`;

    const template = React.createElement(AdminInvitationEmail, {
      adminName: [admin.firstName, admin.lastName].filter(Boolean).join(' ').trim() || 'Admin',
      inviteLink,
      locale,
    });

    await this.sendEmail(admin.email, subject, template);
  }
}
