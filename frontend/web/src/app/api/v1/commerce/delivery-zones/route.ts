import { getWebRuntime } from '../../../../../server/runtime';
import { guestCartOwner, withGuestCookie } from '../../../../../server/guest-cart';

export async function GET(request: Request) {
  const owner = guestCartOwner(request);
  return withGuestCookie(Response.json(await getWebRuntime().commerce.deliveryZones()), owner.setCookie);
}
