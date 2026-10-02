import type { SchoolSupplyListDatabase } from '@findeg/db/queries/school-supply-lists';
import type { ISchoolDirectory } from '../interfaces/ISchoolDirectory';
import type { ISchoolSupplyListReader } from '../interfaces/ISchoolSupplyListReader';
import type { ISchoolSupplyListService } from '../interfaces/ISchoolSupplyListService';
import { SchoolDirectory } from './SchoolDirectory';
import { SchoolSupplyListReader } from './SchoolSupplyListReader';
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

/** The anonymous public-code read behind `/lists/[publicCode]`. */
export function createSchoolSupplyListReader({
  db,
}: Pick<SchoolSupplyListDependencies, 'db'> = {}): ISchoolSupplyListReader {
  const getDb = db
    ? async () => db
    : async () => (await import('@findeg/db/connection')).db as SchoolSupplyListDatabase;
  return new SchoolSupplyListReader(getDb);
}

/** The Partner School directory behind `/schools`. */
export function createSchoolDirectory({
  db,
}: Pick<SchoolSupplyListDependencies, 'db'> = {}): ISchoolDirectory {
  const getDb = db
    ? async () => db
    : async () => (await import('@findeg/db/connection')).db as SchoolSupplyListDatabase;
  return new SchoolDirectory(getDb);
}
