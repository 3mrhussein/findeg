import type {
  ISchoolSupplyListService,
  SupplyListResult,
  SupplyListStaffActor,
} from '../../../school/application/interfaces/ISchoolSupplyListService';

export interface SpecificationOption {
  attributeKey: string;
  values: string[];
}

export interface IAdminSchoolSupplyListService extends ISchoolSupplyListService {
  listSpecificationOptions(
    actor: SupplyListStaffActor,
    categoryId: number,
  ): Promise<SupplyListResult<SpecificationOption[]>>;
}
