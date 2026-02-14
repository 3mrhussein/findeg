import { Brand } from "@/infrastructure/database/schema/brands";
import { AdminBrandInput } from "@/domain/types/admin";

export interface IAdminBrandService {
  getAll(activeOnly?: boolean): Promise<Brand[]>;
  getById(id: number): Promise<Brand | null>;
  create(input: AdminBrandInput): Promise<Brand>;
  update(id: number, input: AdminBrandInput): Promise<Brand>;
  delete(id: number): Promise<void>;
}
