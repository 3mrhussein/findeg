import React from 'react';
import env from '@findeg/env';
import type { IInvitationService } from '../../partner-membership';
import { DEFAULT_LOCALE } from '../../core';
import { PartnerInvitationEmail } from '../../notifications';
import type { OutboxHandler } from '../domain/types';
import type { EmailProvider } from './EmailProvider';

/**
 * Mints a fresh invitation token for every send attempt and stores only its digest beside the
 * earlier ones, so a retried or duplicated email still carries a working link (ADR-0008). The
 * payload holds only `{ invitationId }`. An invitation that is no longer pending, or whose
 * Business Partner is no longer open, ends the row as `expired` without sending.
 */
export function createPartnerInvitationHandler(
  emailProvider: EmailProvider,
  getInvitations: () => IInvitationService,
): OutboxHandler {
  return async (payload, { rowId, attempt }) => {
    const invitationId = Number(payload.invitationId);
    if (!Number.isInteger(invitationId)) {
      throw new Error(`Invalid partner invitation id ${String(payload.invitationId)}`);
    }
    const delivery = await getInvitations().issueDeliveryToken(invitationId);
    if (!delivery) return 'expired';

    const locale = DEFAULT_LOCALE;
    const isAr = locale === 'ar';
    const partnerName = isAr ? delivery.partner.nameAr : delivery.partner.nameEn;
    const base = env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
    await emailProvider.send({
      to: delivery.email,
      subject: isAr ? `دعوة للانضمام إلى ${partnerName}` : `You're invited to join ${partnerName}`,
      react: React.createElement(PartnerInvitationEmail, {
        partnerName,
        inviteLink: `${base}/${locale}/partner/invitations/${delivery.token}`,
        expiresAt: new Intl.DateTimeFormat(isAr ? 'ar-EG' : 'en-GB', {
          dateStyle: 'long',
        }).format(delivery.expiresAt),
        locale,
      }),
      idempotencyKey: `${rowId}:${attempt}`,
    });
    return 'delivered';
  };
}
