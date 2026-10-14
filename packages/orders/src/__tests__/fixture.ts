/**
 * A scripted stand-in for the injected Drizzle client. Each awaited read (`select`, `execute`)
 * consumes the next scripted answer, in order; each awaited write resolves without consuming one.
 * Every builder call is recorded so tests can assert what the Order code asked the database to do.
 * A write that calls `.returning()` consumes the next answer as its returned rows.
 * Test-only helper: the file name is excluded from executable test discovery.
 */
export interface RecordedCall {
  method: string;
  args: unknown[];
}

export interface FakeDatabase {
  db: FakeClient;
  calls: RecordedCall[];
  callsTo(method: string): RecordedCall[];
  pendingReads(): number;
}

export interface FakeClient {
  select(...args: unknown[]): unknown;
  insert(...args: unknown[]): unknown;
  update(...args: unknown[]): unknown;
  execute(...args: unknown[]): unknown;
  transaction<T>(run: (tx: FakeClient) => Promise<T>, options?: unknown): Promise<T>;
}

/** A query builder: any method chains; awaiting it reads the next answer (reads) or nothing. */
function builder(answers: unknown[], calls: RecordedCall[], reads: boolean): unknown {
  const node: unknown = new Proxy(function builderNode() {}, {
    get(_target, property) {
      if (property === 'then') {
        return (resolve: (value: unknown) => unknown, reject: (reason: unknown) => unknown) => {
          try {
            resolve(reads ? (answers.shift() ?? []) : undefined);
          } catch (error) {
            reject(error);
          }
        };
      }
      return (...args: unknown[]) => {
        calls.push({ method: String(property), args });
        // A write that returns rows answers like a read: the next scripted answer is its result.
        if (property === 'returning') return builder(answers, calls, true);
        return node;
      };
    },
  });
  return node;
}

export function fakeDatabase(...reads: unknown[]): FakeDatabase {
  const answers = [...reads];
  const calls: RecordedCall[] = [];
  const db: FakeClient = {
    select: (...args) => (calls.push({ method: 'select', args }), builder(answers, calls, true)),
    insert: (...args) => (calls.push({ method: 'insert', args }), builder(answers, calls, false)),
    update: (...args) => (calls.push({ method: 'update', args }), builder(answers, calls, false)),
    execute: (...args) => (calls.push({ method: 'execute', args }), builder(answers, calls, true)),
    transaction: (run) => run(db),
  };
  return {
    db,
    calls,
    callsTo: (method) => calls.filter((call) => call.method === method),
    pendingReads: () => answers.length,
  };
}

/** A stored Order row with every column the Order code reads, overridable per test. */
export function storedOrder(overrides: Record<string, unknown> = {}) {
  return {
    id: 9,
    orderReference: 'FE-000009',
    userId: null,
    guestEmail: 'guest@example.com',
    status: 'pending',
    paymentStatus: 'unpaid',
    subtotal: '100.00',
    shippingCost: '50.00',
    discountTotal: '0.00',
    totalAmount: '150.00',
    currency: 'EGP',
    paymentMethod: 'cod',
    shippingAddressSnapshot: { fullName: 'Nour Hassan', city: 'Cairo' },
    trackingNumber: null,
    adminNotes: null,
    createdAt: new Date('2026-10-01T10:00:00Z'),
    updatedAt: new Date('2026-10-01T10:00:00Z'),
    ...overrides,
  };
}

/** A stored order item row for the Order with the given id. */
export function storedItem(orderId = 9, overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    orderId,
    productId: 3,
    variantId: null,
    quantity: 2,
    unitPrice: '50.00',
    discountAmount: '0.00',
    lineTotal: '100.00',
    productNameSnapshot: 'Notebook',
    productSkuSnapshot: 'NB-1',
    variantSkuSnapshot: null,
    variantSnapshot: null,
    ...overrides,
  };
}
