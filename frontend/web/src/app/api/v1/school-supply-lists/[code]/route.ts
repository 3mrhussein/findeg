import { getWebRuntime } from '../../../../../server/runtime';

type Context = { params: Promise<{ code: string }> };

export async function GET(_request: Request, context: Context) {
  const result = await getWebRuntime().schoolSupplyLists.readUnlisted((await context.params).code);
  return result.status === 'found'
    ? Response.json(result, { headers: { 'Cache-Control': 'no-store' } })
    : Response.json(result, { status: 404 });
}
