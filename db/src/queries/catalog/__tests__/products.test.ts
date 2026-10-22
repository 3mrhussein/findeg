import { expect, it, vi } from 'vitest';

const query = vi.hoisted(() => ({ select: vi.fn(), from: vi.fn(), limit: vi.fn() }));
vi.mock('../../../connection', () => ({ db: { select: query.select } }));

import { getLowStockProducts } from '../products';
import { products } from '../../../schema';

it('preserves the legacy product query after removing its unused threshold argument', async () => {
  const rows = [{ id: 12 }];
  query.select.mockReturnValue({ from: query.from });
  query.from.mockReturnValue({ limit: query.limit });
  query.limit.mockResolvedValue(rows);

  expect(await getLowStockProducts()).toBe(rows);
  expect(query.select).toHaveBeenCalledExactlyOnceWith();
  expect(query.from).toHaveBeenCalledExactlyOnceWith(products);
  expect(query.limit).toHaveBeenCalledExactlyOnceWith(5);
});
