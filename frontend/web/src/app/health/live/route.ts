import { getWebRuntime } from '../../../server/runtime';
export const dynamic = 'force-dynamic';
export function GET() {
  return Response.json(getWebRuntime().health());
}
