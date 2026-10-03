import { eq } from 'drizzle-orm';
import { listOffers, type ListOffer } from '../../schema';
import type { SchoolSupplyListExecutor, SchoolSupplyListTransaction } from './index';

export interface ListOfferTerms {
  basisPoints: number;
  startsAt: Date;
  endsAt: Date | null;
}

/** Reads a list's offer; pass `lock: 'share'` inside Order Acceptance so it cannot change under the Quote. */
export async function getListOffer(
  executor: SchoolSupplyListExecutor,
  listId: number,
  { lock }: { lock?: 'share' } = {},
): Promise<ListOffer | undefined> {
  const query = executor.select().from(listOffers).where(eq(listOffers.listId, listId));
  const [row] = lock === 'share' ? await query.for('share') : await query;
  return row;
}

export async function upsertListOffer(
  tx: SchoolSupplyListTransaction,
  listId: number,
  terms: ListOfferTerms,
  now: Date,
): Promise<ListOffer> {
  const [row] = await tx
    .insert(listOffers)
    .values({ listId, ...terms, updatedAt: now })
    .onConflictDoUpdate({ target: listOffers.listId, set: { ...terms, updatedAt: now } })
    .returning();
  return row;
}

export async function deleteListOffer(tx: SchoolSupplyListTransaction, listId: number) {
  await tx.delete(listOffers).where(eq(listOffers.listId, listId));
}

/** A replacement list starts with the offer of the list it replaces. */
export async function copyListOffer(
  tx: SchoolSupplyListTransaction,
  fromListId: number,
  toListId: number,
  now: Date,
) {
  const source = await getListOffer(tx, fromListId);
  if (!source) return;
  await upsertListOffer(
    tx,
    toListId,
    { basisPoints: source.basisPoints, startsAt: source.startsAt, endsAt: source.endsAt },
    now,
  );
}
