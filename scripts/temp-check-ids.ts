import { db } from "../src/features/core/infrastructure/persistence";
import {
  products,
  categories,
  brands,
  warehouses,
} from "../src/features/core/infrastructure/persistence/schema";
import { count } from "drizzle-orm";

async function checkIds() {
  const [{ value: productCount }] = await db.select({ value: count() }).from(products);
  console.log(`---PRODUCT_COUNT:${productCount}---`);

  const allCats = await db.select().from(categories);
  const allBrands = await db.select().from(brands);
  const allWhs = await db.select().from(warehouses);

  console.log("---CATEGORIES_START---");
  allCats.forEach((c) => console.log(`${c.id}|${c.localizedName.en}|${c.slug}`));
  console.log("---CATEGORIES_END---");

  console.log("---BRANDS_START---");
  allBrands.forEach((b) => console.log(`${b.id}|${b.name}|${b.slug}`));
  console.log("---BRANDS_END---");

  console.log("---WAREHOUSES_START---");
  allWhs.forEach((w) => console.log(`${w.id}|${w.name}|${w.code}`));
  console.log("---WAREHOUSES_END---");

  process.exit(0);
}

checkIds().catch((err) => {
  console.error(err);
  process.exit(1);
});
