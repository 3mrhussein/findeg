import { listSelectionRequest } from '../../../../../../../server/list-selection';
export async function POST(request: Request, context: { params: Promise<{ code: string }> }) {
  return listSelectionRequest(request, (await context.params).code, 'checkout');
}
