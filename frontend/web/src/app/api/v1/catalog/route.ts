import { getWebRuntime } from '../../../../server/runtime';
import { errorResponse } from '../../../../server/session';

export async function GET(request: Request) {
  const locale = new URL(request.url).searchParams.get('locale');
  if (locale !== 'en' && locale !== 'ar') return errorResponse('invalid-locale', 400);
  return Response.json(await getWebRuntime().browseCatalog(locale), {
    headers: { 'Cache-Control': 'no-store' },
  });
}
