import { getWebRuntime } from '../../../../../server/runtime';
import { guestCartOwner, withGuestCookie } from '../../../../../server/guest-cart';

export async function POST(request: Request) {
  const owner = guestCartOwner(request);
  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return withGuestCookie(
      Response.json({ status: 'invalid-input' }, { status: 400 }),
      owner.setCookie,
    );
  }
  const result = await getWebRuntime().commerce.acceptCheckout(owner.digest, input);
  const status = result.status === 'accepted' ? 201 : result.status === 'invalid-input' ? 400 : 409;
  return withGuestCookie(Response.json(result, { status }), owner.setCookie);
}
