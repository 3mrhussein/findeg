import { getWebRuntime } from '../../../../../../server/runtime';
import { guestCartOwner, withGuestCookie } from '../../../../../../server/guest-cart';

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
  const zoneId = input && typeof input === 'object' && 'zoneId' in input ? input.zoneId : undefined;
  const result = await getWebRuntime().commerce.quoteCheckout(
    owner.digest,
    typeof zoneId === 'number' ? zoneId : NaN,
  );
  return withGuestCookie(
    Response.json(result, { status: result.status === 'invalid-input' ? 400 : 200 }),
    owner.setCookie,
  );
}
