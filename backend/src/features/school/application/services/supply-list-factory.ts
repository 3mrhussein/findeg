import type { SchoolSupplyListDatabase } from '@findeg/db/queries/school-supply-lists';
import type { ISchoolSupplyListService } from '../interfaces/ISchoolSupplyListService';
import { SchoolSupplyListService } from './SchoolSupplyListService';

export interface SchoolSupplyListDependencies {
  db?: SchoolSupplyListDatabase;
  clock?: () => Date;
}

/** Lazy production connection, or an injected database for real Postgres tests. */
export function createSchoolSupplyListService({
  db,
  clock = () => new Date(),
}: SchoolSupplyListDependencies = {}): ISchoolSupplyListService {
  const getDb = db
    ? async () => db
    : async () => (await import('@findeg/db/connection')).db as SchoolSupplyListDatabase;
  return new SchoolSupplyListService(getDb, clock);
}
