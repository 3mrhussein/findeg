import { getServices } from "@/server/getServices";
import { BrandsTable } from "./_components/BrandsTable";

/**
 *
 */
export default async function BrandsPage() {
  const { adminBrand } = getServices();
  const brands = await adminBrand.getAll();

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Brands</h2>
      </div>
      <div className="hidden h-full flex-1 flex-col space-y-8 md:flex">
        <BrandsTable brands={brands} />
      </div>
    </div>
  );
}
