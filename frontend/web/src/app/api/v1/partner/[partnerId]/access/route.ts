import { accessGet, accessPost } from '../../../../../../server/partner-api';
type Context = { params: Promise<{ partnerId: string }> };
export async function GET(_request: Request, context: Context) {
  return accessGet('partner', (await context.params).partnerId);
}
export async function POST(request: Request, context: Context) {
  return accessPost(request, 'partner', (await context.params).partnerId);
}
