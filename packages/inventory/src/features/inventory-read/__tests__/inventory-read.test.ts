import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InventoryService } from '../index';

const { inventoryQueries } = vi.hoisted(() => ({ inventoryQueries: { getAllBalances: vi.fn() } }));
vi.mock('@findeg/db/queries', () => ({ inventoryQueries }));

describe('InventoryService', () => {
  let service: InventoryService;
  beforeEach(() => {
    vi.clearAllMocks();
    service = new InventoryService();
  });

  it('sums available stock across warehouses', async () => {
    inventoryQueries.getAllBalances.mockResolvedValue([{ available: 2 }, { available: 3 }]);
    expect(await service.getTotalAvailableStock(1)).toBe(5);
    expect(inventoryQueries.getAllBalances).toHaveBeenCalledWith(1);
  });

  it('passes warehouse balances through and reports stock presence', async () => {
    inventoryQueries.getAllBalances.mockResolvedValue([{ available: 0 }]);
    expect(await service.getWarehouseBalances(1)).toEqual([{ available: 0 }]);
    expect(await service.isInStock(1)).toBe(false);
    inventoryQueries.getAllBalances.mockResolvedValue([{ available: 1 }]);
    expect(await service.isInStock(1)).toBe(true);
  });
});
