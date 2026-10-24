// PROTOTYPE: local capture only; this file belongs to the disposable experiment.
import { appendFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { render } from '@react-email/components';
import type { EmailProvider, OutgoingEmail } from './EmailProvider';

export class PrototypeEmailProvider implements EmailProvider {
  async send({ to, subject, react, idempotencyKey }: OutgoingEmail): Promise<void> {
    const directory = process.env.FINDEG_PROTOTYPE_CAPTURE_DIR;
    if (!directory) throw new Error('Prototype capture directory is required');
    const fail = await readFile(join(directory, 'email-fail'), 'utf8').then(
      () => true,
      () => false,
    );
    if (fail) throw new Error('PROTOTYPE deliberate email delivery failure');
    await appendFile(
      join(directory, 'emails.jsonl'),
      JSON.stringify({
        at: new Date().toISOString(),
        to,
        subject,
        idempotencyKey,
        html: await render(react),
      }) + '\n',
    );
  }
}
