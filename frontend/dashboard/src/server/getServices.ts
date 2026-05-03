/**
 * @deprecated getServices() is no longer supported in Next.js 16.
 *
 * ServiceContainer cannot be exported because it's backend infrastructure.
 * Use data layer functions from @data/* which wrap backend calls with "use cache".
 *
 * Migration examples:
 *
 * OLD:
 *   const { products } = getServices();
 *   const data = await products.getAll();
 *
 * NEW:
 *   import { getProducts } from '@data/products/queries';
 *   const data = await getProducts(locale);
 */
export function getServices(): never {
  throw new Error('getServices() is deprecated. Use queries/actions from @data/* instead.');
}
