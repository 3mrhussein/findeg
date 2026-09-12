import { getWebRuntime } from '../../../../../server/runtime';
import { guestCartOwner, withGuestCookie } from '../../../../../server/guest-cart';

export async function GET(request: Request) {
  const owner = guestCartOwner(request);
  return withGuestCookie(Response.json(await getWebRuntime().commerce.readCart(owner.digest)), owner.setCookie);
}

export async function PUT(request: Request) {
  const owner = guestCartOwner(request);
  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return withGuestCookie(Response.json({ status: 'invalid-input' }, { status: 400 }), owner.setCookie);
  }
  const result = await getWebRuntime().commerce.replaceCart(owner.digest, input);
  return withGuestCookie(Response.json(result, { status: result.status === 'invalid-input' ? 400 : 200 }), owner.setCookie);
}
