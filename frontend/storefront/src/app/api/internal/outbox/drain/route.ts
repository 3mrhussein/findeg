import { isAuthorizedSweeper, sweepOutbox } from '@findeg/backend/features/outbox';
import env from '@findeg/env';

// Called once a minute by the host's scheduler; see backend/src/features/outbox/README.md.
export async function POST(request: Request) {
  if (!isAuthorizedSweeper(request.headers.get('authorization'), env.OUTBOX_SWEEPER_SECRET)) {
    return Response.json({ success: false, error: { message: 'Unauthorized' } }, { status: 401 });
  }

  const result = await sweepOutbox();
  return Response.json({ success: true, data: result });
}
