import type {
  ISchoolSupplyListService,
  SupplyListResult,
  SupplyListStaffActor,
} from '../../../school';
import type {
  SchoolSupplyListIndexFilters,
  SchoolSupplyListIndexRow,
} from '@findeg/db/queries/school-supply-lists';

export type { SchoolSupplyListIndexFilters, SchoolSupplyListIndexRow };

export interface SpecificationOption {
  attributeKey: string;
  values: string[];
}

export interface SpecificationVariantCandidate {
  variantId: number;
  categoryId: number | null;
  attributes: Record<string, string>;
}

export interface SchoolListPartnerOption {
  id: number;
  nameEn: string;
  nameAr: string;
  status: import('@findeg/domain').BusinessPartnerStatus;
}

export interface IAdminSchoolSupplyListService extends ISchoolSupplyListService {
  listPartnerOptions(
    actor: SupplyListStaffActor,
  ): Promise<SupplyListResult<SchoolListPartnerOption[]>>;
  listAll(
    actor: SupplyListStaffActor,
    filters?: SchoolSupplyListIndexFilters,
  ): Promise<SupplyListResult<SchoolSupplyListIndexRow[]>>;
  listSpecificationOptions(
    actor: SupplyListStaffActor,
    categoryId: number,
  ): Promise<SupplyListResult<SpecificationOption[]>>;
  listVariantCandidates(
    actor: SupplyListStaffActor,
    categoryId: number,
  ): Promise<SupplyListResult<SpecificationVariantCandidate[]>>;
}
