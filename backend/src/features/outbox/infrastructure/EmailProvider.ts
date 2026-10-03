import type { ReactElement } from 'react';
import { Resend } from 'resend';
import env from '@findeg/env';

export interface OutgoingEmail {
  to: string;
  subject: string;
  react: ReactElement;
  /** Provider-side dedup key so at-least-once delivery does not send twice. */
  idempotencyKey: string;
}

/** Sends one email, throwing on any failure so the outbox retries it. */
export interface EmailProvider {
  send(email: OutgoingEmail): Promise<void>;
}

export class ResendEmailProvider implements EmailProvider {
  async send({ to, subject, react, idempotencyKey }: OutgoingEmail): Promise<void> {
    if (!env.RESEND_API_KEY) throw new Error('RESEND_API_KEY is not configured');
    const resend = new Resend(env.RESEND_API_KEY);
    const { error } = await resend.emails.send(
      { from: `${env.EMAIL_FROM_NAME} <${env.EMAIL_FROM}>`, to, subject, react },
      { idempotencyKey },
    );
    if (error) throw new Error(`Resend rejected the email: ${error.name}: ${error.message}`);
  }
}
