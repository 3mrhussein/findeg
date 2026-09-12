import { getWebRuntime } from '../../../../../server/runtime';
import { partnerResponse } from '../../../../../server/partner-api';
import { errorResponse, sameOrigin, sessionToken } from '../../../../../server/session';
export async function POST(request: Request) {
  if (!sameOrigin(request)) return errorResponse('origin-denied', 403);
  const input = await request.json().catch(() => null);
  if (
    !input ||
    typeof input.code !== 'string' ||
    typeof input.nameEn !== 'string' ||
    typeof input.nameAr !== 'string'
  )
    return errorResponse('invalid-input', 400);
  return partnerResponse(
    await getWebRuntime().partners.createPartner(await sessionToken(), {
      code: input.code,
      nameEn: input.nameEn,
      nameAr: input.nameAr,
    }),
    201,
  );
}
