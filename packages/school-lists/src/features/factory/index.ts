import { connectionProvider } from './helpers';
import { AdminSchoolSupplyListService } from '../administration';
import type { IAdminSchoolSupplyListService } from '../../types';
import {
  findVariantCandidates,
  listAttributeValuesForCategory,
  listSchoolSupplyLists,
  listSchoolListPartners,
} from '@findeg/db';
import type { SchoolSupplyListDatabase } from '@findeg/db';
import type { ISchoolDirectory } from '../../types';
import type { ISchoolSupplyListReader } from '../../types';
import type { ISchoolSupplyListService } from '../../types';
import { SchoolDirectory } from '../directory/index';
import { SchoolSupplyListReader } from '../reader/index';
import { SchoolSupplyListService } from '../lifecycle/index';

export interface SchoolSupplyListDependencies {
  db?: SchoolSupplyListDatabase;
  clock?: () => Date;
}

/** Lazy production connection, or an injected database for real Postgres tests. */
export function createSchoolSupplyListService({
  db,
  clock = () => new Date(),
}: SchoolSupplyListDependencies = {}): ISchoolSupplyListService {
  const getDb = connectionProvider(db);
  return new SchoolSupplyListService(getDb, clock);
}

/** The anonymous public-code read behind `/lists/[publicCode]`. */
export function createSchoolSupplyListReader({
  db,
}: Pick<SchoolSupplyListDependencies, 'db'> = {}): ISchoolSupplyListReader {
  const getDb = connectionProvider(db);
  return new SchoolSupplyListReader(getDb);
}

/** The Partner School directory behind `/schools`. */
export function createSchoolDirectory({
  db,
}: Pick<SchoolSupplyListDependencies, 'db'> = {}): ISchoolDirectory {
  const getDb = connectionProvider(db);
  return new SchoolDirectory(getDb);
}

export function createAdminSchoolSupplyListService(
  dependencies: SchoolSupplyListDependencies = {},
): IAdminSchoolSupplyListService {
  const getDb = connectionProvider(dependencies.db);
  return new AdminSchoolSupplyListService(
    createSchoolSupplyListService(dependencies),
    async (categoryId) => listAttributeValuesForCategory(await getDb(), categoryId),
    async (categoryId) => findVariantCandidates(await getDb(), { categoryId }),
    async (filters) => listSchoolSupplyLists(await getDb(), filters),
    async () => listSchoolListPartners(await getDb()),
  );
}
