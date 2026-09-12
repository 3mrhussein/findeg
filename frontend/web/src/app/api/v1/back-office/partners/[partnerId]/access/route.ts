import { accessGet, accessPost } from '../../../../../../../server/partner-api';
type Context = { params: Promise<{ partnerId: string }> };
export async function GET(_request: Request, context: Context) {
  return accessGet('back-office', (await context.params).partnerId);
}
export async function POST(request: Request, context: Context) {
  return accessPost(request, 'back-office', (await context.params).partnerId);
}
