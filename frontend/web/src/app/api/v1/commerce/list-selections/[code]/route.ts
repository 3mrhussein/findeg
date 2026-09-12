import { listSelectionRequest } from '../../../../../../server/list-selection';
type Context = { params: Promise<{ code: string }> };
export async function GET(request: Request, context: Context) {
  return listSelectionRequest(request, (await context.params).code, 'read');
}
export async function PUT(request: Request, context: Context) {
  return listSelectionRequest(request, (await context.params).code, 'replace');
}
