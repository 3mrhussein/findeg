import React from 'react';
import { guestAccessQueries } from '@findeg/db/queries';
import { DEFAULT_LOCALE } from '../../core/domain/value-objects';
import GuestAccessCodeEmail from '../../notifications/infrastructure/templates/GuestAccessCodeEmail';
import { hashCode, mintCode } from '../../guest-access/domain/codes';
import type { OutboxHandler } from '../domain/types';
import type { EmailProvider } from './EmailProvider';

/**
 * Mints a fresh code for every send attempt and stores only its hash next to the earlier ones, so a
 * retried or duplicated email still carries a working code (ADR-0008). The request being consumed,
 * expired or out of attempts ends the row as `expired` without sending.
 */
export function createGuestAccessHandler(emailProvider: EmailProvider): OutboxHandler {
  return async (payload, { rowId, attempt }) => {
    const requestId = String(payload.accessRequestId);
    const request = await guestAccessQueries.findLiveRequest(requestId);
    if (!request) return 'expired';
    if (!request.guestEmail) throw new Error(`Order ${request.orderReference} has no guest email`);

    const code = mintCode();
    await guestAccessQueries.addCodeHash(request.id, hashCode(request.id, code));

    const locale = DEFAULT_LOCALE;
    await emailProvider.send({
      to: request.guestEmail,
      subject: locale === 'ar' ? 'رمز الوصول إلى طلبك' : 'Your order access code',
      react: React.createElement(GuestAccessCodeEmail, {
        orderReference: request.orderReference,
        code,
        expiresInMinutes: guestAccessQueries.GUEST_ACCESS_TTL_MINUTES,
        locale,
      }),
      idempotencyKey: `${rowId}:${attempt}`,
    });
    return 'delivered';
  };
}
