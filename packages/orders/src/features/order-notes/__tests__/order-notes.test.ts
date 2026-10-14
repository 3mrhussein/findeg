import { describe, expect, it } from 'vitest';
import { PERMISSION_CODES } from '@findeg/db/types';
import { createOrders } from '../../../helpers';
import { OrderNotFoundError } from '../../order-errors';
import { fakeDatabase } from '../../../__tests__/fixture';

const writer = {
  kind: 'staff' as const,
  userId: 5,
  permissionCodes: [PERMISSION_CODES.ADMIN_ORDERS_WRITE],
};
const instant = new Date('2026-10-14T08:00:00Z');
const stored = (overrides: Record<string, unknown> = {}) => ({
  id: 1,
  orderId: 9,
  authorId: 5,
  authorName: 'Amina Ali',
  note: 'Called the customer',
  createdAt: instant,
  ...overrides,
});

describe('Order notes', () => {
  it('appends a note with the actor name, writes an audit entry and returns the note', async () => {
    const fake = fakeDatabase([{ id: 9 }], [stored({ note: 'Called the customer' })]);
    const note = await createOrders({ db: fake.db as never, now: () => instant }).addNote(
      { ...writer, userName: 'Amina Ali' },
      '9',
      '  Called the customer  ',
    );
    expect(note).toEqual({
      id: 1,
      orderId: 9,
      authorId: 5,
      authorName: 'Amina Ali',
      note: 'Called the customer',
      createdAt: instant,
    });
    expect(fake.callsTo('select')).toHaveLength(1);
    expect(fake.callsTo('values')[0].args[0]).toEqual(
      expect.objectContaining({
        orderId: 9,
        authorId: 5,
        authorName: 'Amina Ali',
        note: 'Called the customer',
        createdAt: instant,
      }),
    );
    expect(fake.callsTo('values')[1].args[0]).toEqual(
      expect.objectContaining({
        adminUserId: 5,
        entityType: 'order',
        entityId: '9',
        action: 'add_note',
        newValues: { noteId: 1, note: 'Called the customer' },
      }),
    );
    expect(fake.pendingReads()).toBe(0);
  });

  it('names the author from the account when the actor carries no name', async () => {
    const fake = fakeDatabase(
      [{ id: 9 }],
      [{ firstName: 'Omar', lastName: 'Hassan', email: 'omar@example.com' }],
      [stored({ authorName: 'Omar Hassan' })],
    );
    const note = await createOrders({ db: fake.db as never, now: () => instant }).addNote(
      writer,
      9,
      'Refund requested',
    );
    expect(note.authorName).toBe('Omar Hassan');
  });

  it('falls back to the account email when the user has no name', async () => {
    const fake = fakeDatabase(
      [{ id: 9 }],
      [{ firstName: null, lastName: null, email: 'omar@example.com' }],
      [stored({ authorName: 'omar@example.com' })],
    );
    await createOrders({ db: fake.db as never, now: () => instant }).addNote(writer, 9, 'Check');
    expect(fake.callsTo('values')[0].args[0]).toEqual(
      expect.objectContaining({ authorName: 'omar@example.com' }),
    );
  });

  it('falls back to Staff when the account no longer exists', async () => {
    const fake = fakeDatabase([{ id: 9 }], [], [stored({ authorName: 'Staff' })]);
    await createOrders({ db: fake.db as never, now: () => instant }).addNote(writer, 9, 'Check');
    expect(fake.callsTo('values')[0].args[0]).toEqual(
      expect.objectContaining({ authorName: 'Staff' }),
    );
  });

  it('refuses a note from an actor without order-write access', async () => {
    const fake = fakeDatabase();
    await expect(
      createOrders({ db: fake.db as never }).addNote(
        { kind: 'staff', userId: 5, permissionCodes: [] },
        9,
        'Check',
      ),
    ).rejects.toMatchObject({ name: 'NotAuthorizedError' });
    expect(fake.calls).toHaveLength(0);
  });

  it('rejects an empty note before reading the database', async () => {
    const fake = fakeDatabase();
    await expect(
      createOrders({ db: fake.db as never }).addNote(writer, 9, '   '),
    ).rejects.toMatchObject({ name: 'ZodError' });
    expect(fake.calls).toHaveLength(0);
  });

  it('refuses a note on an unknown Order', async () => {
    const fake = fakeDatabase([]);
    await expect(
      createOrders({ db: fake.db as never }).addNote(writer, 9, 'Check'),
    ).rejects.toBeInstanceOf(OrderNotFoundError);
    expect(fake.callsTo('insert')).toHaveLength(0);
  });

  it('lists the notes of an Order as the database orders them and accepts a numeric string id', async () => {
    const fake = fakeDatabase([stored(), stored({ id: 2, note: 'Earlier' })]);
    const notes = await createOrders({ db: fake.db as never }).listNotes('9');
    expect(notes.map((n) => n.id)).toEqual([1, 2]);
    expect(fake.callsTo('orderBy')).toHaveLength(1);
  });

  it('rejects a list request for an invalid Order id', async () => {
    await expect(createOrders().listNotes(0)).rejects.toMatchObject({ name: 'ZodError' });
  });
});
