import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SchoolDirectory } from '../index';

const mocks = vi.hoisted(() => ({
  searchPartnerSchools: vi.fn(),
  getPartnerSchoolByCode: vi.fn(),
  getPartnerSchoolFilterOptions: vi.fn(),
}));

vi.mock('@findeg/db', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@findeg/db')>()),
  ...mocks,
}));

const directory = () => new SchoolDirectory(() => Promise.resolve().then(() => ({}) as never));

beforeEach(() => vi.clearAllMocks());

describe('SchoolDirectory', () => {
  it('translates a 1-based page into limit and offset', async () => {
    mocks.searchPartnerSchools.mockResolvedValue({ items: [], totalCount: 0 });
    await directory().searchSchools({ query: 'nile', page: 3, pageSize: 10 });
    expect(mocks.searchPartnerSchools).toHaveBeenCalledWith(expect.anything(), {
      query: 'nile',
      limit: 10,
      offset: 20,
    });
  });

  it('never produces a negative offset for page zero', async () => {
    mocks.searchPartnerSchools.mockResolvedValue({ items: [], totalCount: 0 });
    await directory().searchSchools({ page: 0, pageSize: 10 });
    expect(mocks.searchPartnerSchools).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ offset: 0 }),
    );
  });

  it('returns a school profile by its Business Partner code', async () => {
    mocks.getPartnerSchoolByCode.mockResolvedValue({ code: 'SCH-1' });
    expect(await directory().getByCode('SCH-1')).toEqual({ code: 'SCH-1' });
  });

  it('merges and sorts governorate options with the Domain list', async () => {
    mocks.getPartnerSchoolFilterOptions.mockResolvedValue({
      governorates: ['Zz-Extra'],
      schoolTypes: ['Private'],
      academicSystems: ['IGCSE'],
    });
    const options = await directory().getFilterOptions();
    expect(options.governorates).toEqual([...options.governorates].sort());
    expect(options.governorates).toContain('Zz-Extra');
    expect(new Set(options.governorates).size).toBe(options.governorates.length);
    expect(options.schoolTypes).toEqual(['Private']);
  });
});
