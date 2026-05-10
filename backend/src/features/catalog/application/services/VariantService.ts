import { type IVariantService } from '../interfaces/IVariantService';
import { type IVariantRepository } from '../interfaces/IVariantRepository';

export class VariantService implements IVariantService {
  constructor(private variantRepository: IVariantRepository) {}

}
