import type {
  ISchoolSupplyListService,
  SupplyListResult,
  SupplyListStaffActor,
} from '../../../school';

export interface SpecificationOption {
  attributeKey: string;
  values: string[];
}

export interface SpecificationVariantCandidate {
  variantId: number;
  categoryId: number | null;
  attributes: Record<string, string>;
}

export interface IAdminSchoolSupplyListService extends ISchoolSupplyListService {
  listSpecificationOptions(
    actor: SupplyListStaffActor,
    categoryId: number,
  ): Promise<SupplyListResult<SpecificationOption[]>>;
  listVariantCandidates(
    actor: SupplyListStaffActor,
    categoryId: number,
  ): Promise<SupplyListResult<SpecificationVariantCandidate[]>>;
}
