import 'server-only';
import { createHash, randomBytes } from 'node:crypto';
import { getWebRuntime } from './runtime';
import { sameOrigin, sessionToken } from './session';

export async function listSelectionRequest(
  request: Request,
  code: string,
  action: 'read' | 'replace' | 'quote' | 'checkout',
) {
  if (action !== 'read' && !sameOrigin(request))
    return Response.json({ status: 'origin-denied' }, { status: 403 });
  const runtime = getWebRuntime();
  const session = await runtime.currentSession(await sessionToken(), 'storefront');
  const cookieName = 'findeg_list_selection';
  const existing = request.headers
    .get('cookie')
    ?.split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${cookieName}=`))
    ?.slice(cookieName.length + 1);
  const token =
    existing && /^[a-f0-9]{64}$/.test(existing) ? existing : randomBytes(32).toString('hex');
  const owner = createHash('sha256')
    .update(
      session.status === 'authenticated'
        ? `customer-list:${session.session.userId}`
        : `guest-list:${token}`,
    )
    .digest('hex');
  const input = action === 'read' ? undefined : await request.json().catch(() => null);
  const commerce = runtime.listCommerce;
  const result =
    action === 'read'
      ? await commerce.read(owner, code)
      : action === 'replace'
        ? await commerce.replace(owner, code, input)
        : action === 'quote'
          ? await commerce.quoteCheckout(
              owner,
              code,
              input && typeof input === 'object' && Object.keys(input).length === 1
                ? input.zoneId
                : undefined,
            )
          : await commerce.acceptCheckout(owner, code, input);
  const status =
    result.status === 'accepted'
      ? 201
      : ['found', 'quoted'].includes(result.status)
        ? 200
        : result.status === 'not-found'
          ? 404
          : result.status === 'invalid-input'
            ? 400
            : 409;
  const response = Response.json(result, { status, headers: { 'Cache-Control': 'no-store' } });
  if (session.status !== 'authenticated')
    response.headers.set(
      'Set-Cookie',
      `${cookieName}=${token}; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=2592000`,
    );
  return response;
}
