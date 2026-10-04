import { randomUUID } from 'node:crypto';
import { after } from 'next/server';
import { createLogger } from '@findeg/backend/features/core/logger';
import {
  createPartnerMembershipServices,
  type EnqueueInvitation,
} from '@findeg/backend/features/partner-membership';
import {
  drainOutbox,
  enqueue,
  PARTNER_INVITATION_KIND,
  partnerInvitationId,
} from '@findeg/backend/features/outbox';

/**
 * Writes the Partner Invitation email row on the invitation's own transaction (ADR-0008). The
 * payload holds only the invitation id; the handler mints its own token per send attempt, so the
 * seam's `secret.token` is ignored. A resend is a new fact, so every enqueue gets its own row id.
 */
const enqueueInvitationEmail: EnqueueInvitation = (tx, { invitationId }) =>
  enqueue(tx, partnerInvitationId(invitationId, randomUUID()), PARTNER_INVITATION_KIND, {
    invitationId,
  });

/** Invitation services whose invite and resend deliver the email through the Outbox. */
export const createInvitationServices = () =>
  createPartnerMembershipServices({ enqueue: enqueueInvitationEmail }).invitations;

/** Delivers due rows once the action's response is sent; the minute sweeper is the backstop. */
export function drainOutboxAfterResponse() {
  after(() =>
    drainOutbox().catch((err) => {
      createLogger().error('Outbox drain failed', {
        feature: 'partner-membership',
        error: err instanceof Error ? err.message : String(err),
      });
    }),
  );
}
