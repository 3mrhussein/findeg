import { getWebRuntime } from '../../../../../../server/runtime';

export async function POST(request: Request) {
  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return Response.json(
      { status: 'invalid-input' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } },
    );
  }
  const value = input && typeof input === 'object' ? (input as Record<string, unknown>) : {};
  const result = await getWebRuntime().commerce.verifyGuestOrder(
    typeof value.reference === 'string' ? value.reference : '',
    typeof value.code === 'string' ? value.code : '',
  );
  return Response.json(result, {
    status: result.status === 'verified' ? 200 : 400,
    headers: { 'Cache-Control': 'no-store' },
  });
}
