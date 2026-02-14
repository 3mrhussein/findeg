import { Brand, NewBrand } from "@/infrastructure/database/schema/brands";

export interface IBrandRepository {
  getAll(activeOnly?: boolean): Promise<Brand[]>;
  getById(id: number): Promise<Brand | null>;
  getBySlug(slug: string): Promise<Brand | null>;
  create(data: NewBrand): Promise<Brand>;
  update(id: number, data: Partial<NewBrand>): Promise<Brand>;
  delete(id: number): Promise<void>;
  count(): Promise<number>;
}
