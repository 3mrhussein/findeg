import { GOVERNORATES } from '@findeg/domain';
import {
  getPartnerSchoolByCode,
  getPartnerSchoolFilterOptions,
  searchPartnerSchools,
} from '@findeg/db';
import type { SchoolSupplyListDatabase } from '@findeg/db';
import type {
  ISchoolDirectory,
  SchoolFilterOptions,
  SchoolProfile,
  SchoolSearchParams,
  SchoolSearchResult,
} from '../../types';

/** Reads Partner Schools and their profiles; published lists are the only lists it exposes. */
export class SchoolDirectory implements ISchoolDirectory {
  constructor(private readonly getDb: () => Promise<SchoolSupplyListDatabase>) {}

  async searchSchools({
    page,
    pageSize,
    ...filter
  }: SchoolSearchParams): Promise<{ items: SchoolSearchResult[]; totalCount: number }> {
    const db = await this.getDb();
    return searchPartnerSchools(db, {
      ...filter,
      limit: pageSize,
      offset: (Math.max(page, 1) - 1) * pageSize,
    });
  }

  async getByCode(code: string): Promise<SchoolProfile | null> {
    return getPartnerSchoolByCode(await this.getDb(), code);
  }

  async getFilterOptions(): Promise<SchoolFilterOptions> {
    const options = await getPartnerSchoolFilterOptions(await this.getDb());
    return {
      ...options,
      governorates: [...new Set([...GOVERNORATES, ...options.governorates])].sort(),
    };
  }
}
