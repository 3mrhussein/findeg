import { getWebRuntime } from '../../../../../../server/runtime';
import { partnerId, partnerResponse } from '../../../../../../server/partner-api';
import { errorResponse, sessionToken } from '../../../../../../server/session';
export async function GET(request: Request, context: { params: Promise<{ partnerId: string }> }) {
  const id = partnerId((await context.params).partnerId);
  if (!id) return errorResponse('invalid-input', 400);
  return partnerResponse(
    await getWebRuntime().partnerReports.read(
      await sessionToken(),
      id,
      new URL(request.url).searchParams.get('period') ?? '',
    ),
  );
}
