import { desc, eq } from 'drizzle-orm';
import { auditLog, orderNotes, orders, users } from '@findeg/db/schema';
import type { OrderContext, OrderDatabase, OrderNote, Orders } from '../../types';
import { OrderNotFoundError } from '../order-errors';
import { noteText, orderId } from '../validation';
import { assertCanWriteOrders, type OrderStaffActor } from '../write-permission';

type NoteRow = typeof orderNotes.$inferSelect;

function toOrderNote(row: NoteRow): OrderNote {
  return {
    id: row.id,
    orderId: row.orderId,
    authorId: row.authorId,
    authorName: row.authorName,
    note: row.note,
    createdAt: row.createdAt,
  };
}

/** Newest-first Internal Notes of one Order. Shared by the Order detail read and listNotes. */
export async function selectOrderNotes(db: OrderDatabase, id: number): Promise<OrderNote[]> {
  const rows = await db
    .select()
    .from(orderNotes)
    .where(eq(orderNotes.orderId, id))
    .orderBy(desc(orderNotes.createdAt), desc(orderNotes.id));
  return rows.map(toOrderNote);
}

/** The name shown on a note: the account's name, else its email, else Staff. */
async function authorNameFor(db: OrderDatabase, userId: number): Promise<string> {
  const user = (
    await db
      .select({ firstName: users.firstName, lastName: users.lastName, email: users.email })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)
  ).at(0);
  if (!user) return 'Staff';
  return [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email;
}

/** Staff Internal Notes on an Order: append-only, audited, read newest first. */
export function createOrderNotes({
  database,
  now,
}: OrderContext): Pick<Orders, 'addNote' | 'listNotes'> {
  return {
    async addNote(actor: OrderStaffActor, id: number | string, note: string): Promise<OrderNote> {
      assertCanWriteOrders(actor);
      const key = orderId.parse(id);
      const cleanNote = noteText.parse(note);
      const db = await database();
      const order = (
        await db.select({ id: orders.id }).from(orders).where(eq(orders.id, key)).limit(1)
      ).at(0);
      if (!order) throw new OrderNotFoundError(key);

      const authorName = actor.userName || (await authorNameFor(db, actor.userId));

      return db.transaction(async (tx) => {
        const changedAt = now();
        const [inserted] = await tx
          .insert(orderNotes)
          .values({
            orderId: key,
            authorId: actor.userId,
            authorName,
            note: cleanNote,
            createdAt: changedAt,
          })
          .returning();

        await tx.insert(auditLog).values({
          adminUserId: actor.userId,
          entityType: 'order',
          entityId: String(key),
          action: 'add_note',
          oldValues: {},
          newValues: { noteId: inserted.id, note: cleanNote },
          createdAt: changedAt,
        });

        return toOrderNote(inserted);
      });
    },

    async listNotes(id: number | string): Promise<OrderNote[]> {
      const key = orderId.parse(id);
      return selectOrderNotes(await database(), key);
    },
  };
}
