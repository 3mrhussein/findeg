import type { PartnerDatabase } from '@findeg/db/queries/partners';
import type { IPartnerService } from '../interfaces/IPartnerService';
import { PartnerService } from './PartnerService';

export interface PartnerServices {
  partners: IPartnerService;
}

export interface PartnerMembershipDependencies {
  /** Defaults to the application's shared connection. */
  db?: PartnerDatabase;
}

export function createPartnerMembershipServices(
  dependencies: PartnerMembershipDependencies = {},
): PartnerServices {
  const { db } = dependencies;
  // `@findeg/db/connection` opens the pool and validates env on import, so it is
  // only loaded on first use when no database is injected.
  const getDb = db
    ? async () => db
    : async () => (await import('@findeg/db/connection')).db as PartnerDatabase;
  return { partners: new PartnerService(getDb) };
}
