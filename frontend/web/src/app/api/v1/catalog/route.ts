import { getWebRuntime } from '../../../../server/runtime';

export async function GET(request: Request) {
  const locale = new URL(request.url).searchParams.get('locale');
  if (locale !== 'en' && locale !== 'ar')
    return Response.json({ errorCode: 'invalid-locale' }, { status: 400 });
  return Response.json(await getWebRuntime().browseCatalog(locale), {
    headers: { 'Cache-Control': 'no-store' },
  });
}
