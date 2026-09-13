import { getWebRuntime } from '../../../../../../server/runtime';
import { errorResponse, sameOrigin, sessionToken } from '../../../../../../server/session';
import { partnerId, partnerResponse } from '../../../../../../server/partner-api';

type Context = { params: Promise<{ partnerId: string }> };

export async function POST(request: Request, context: Context) {
  if (!sameOrigin(request)) return errorResponse('origin-denied', 403);
  const selected = partnerId((await context.params).partnerId);
  const input = await request.json().catch(() => null);
  if (!selected || !input || typeof input !== 'object' || typeof input.action !== 'string')
    return errorResponse('invalid-input', 400);
  const runtime = getWebRuntime();
  const token = await sessionToken();
  const lists = runtime.schoolSupplyLists;
  if (input.action === 'create' && input.input)
    return partnerResponse(await lists.createDraft(token, selected, input.input), 201);
  if (
    input.action === 'replace' &&
    Number.isSafeInteger(input.listId) &&
    Array.isArray(input.items)
  )
    return partnerResponse(await lists.replaceDraft(token, selected, input.listId, input.items));
  if (
    input.action === 'publish' &&
    Number.isSafeInteger(input.listId) &&
    (input.replacesListId === undefined || Number.isSafeInteger(input.replacesListId))
  )
    return partnerResponse(
      await lists.publish(token, selected, input.listId, input.replacesListId),
    );
  if (input.action === 'clone' && Number.isSafeInteger(input.listId))
    return partnerResponse(await lists.clone(token, selected, input.listId), 201);
  return errorResponse('invalid-input', 400);
}
