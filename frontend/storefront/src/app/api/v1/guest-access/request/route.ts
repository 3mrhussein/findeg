import { after } from 'next/server';
import { createGuestAccessService } from '@findeg/backend/features/guest-access';
import { drainOutbox } from '@findeg/backend/features/outbox';

/**
 * Answers `{ success: true }` for every well-formed lookup, matching order or not, so the response
 * never reveals whether an Order exists (ADR-0008).
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const result = await createGuestAccessService().requestAccess(body);

  if (!result.success) {
    return Response.json(
      { success: false, error: { message: 'Invalid request' } },
      { status: 400 },
    );
  }

  // Always drain, match or not, so the work done doesn't depend on whether an Order matched.
  after(() =>
    drainOutbox().catch((err) => {
      console.error('[guest-access] outbox drain failed:', err);
    }),
  );

  return Response.json({ success: true });
}
