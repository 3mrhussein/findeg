import * as schema from "../schema";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { prepareSeedData, ensureParents } from "./helpers";

import brandsData from "./data/brands.json";
import categoriesData from "./data/categories.json";
import productsData from "./data/products.json";
import productVariantsData from "./data/product_variants.json";
import variantImagesData from "./data/variant_images.json";
import variantAttributesData from "./data/variant_attributes.json";
import variantSellableUomsData from "./data/variant_sellable_uoms.json";
import variantPriceListsData from "./data/variant_price_lists.json";
import tagsData from "./data/tags.json";
import collectionsData from "./data/collections.json";
import productTagsData from "./data/product_tags.json";
import collectionTagsData from "./data/collection_tags.json";
import attributeDefinitionsData from "./data/attribute_definitions.json";
import productAttributesData from "./data/product_attributes.json";
import reviewsData from "./data/reviews.json";
import reviewHelpfulVotesData from "./data/review_helpful_votes.json";

export async function seedCatalog(db: PostgresJsDatabase<typeof schema>) {
  console.log("🌱 Seeding Catalog Domain...");

  // Level 1: Independent Tables
  if (brandsData.length > 0) {
    console.log("  - Seeding Brands...");
    await db.insert(schema.brands).values(prepareSeedData(schema.brands, brandsData));
  }
  if (categoriesData.length > 0) {
    console.log("  - Seeding Categories...");
    await db.insert(schema.categories).values(prepareSeedData(schema.categories, categoriesData));
  }
  if (tagsData.length > 0) {
    console.log("  - Seeding Tags...");
    await db.insert(schema.tags).values(prepareSeedData(schema.tags, tagsData));
  }
  if (collectionsData.length > 0) {
    console.log("  - Seeding Collections...");
    await db
      .insert(schema.collections)
      .values(prepareSeedData(schema.collections, collectionsData));
  }
  if (attributeDefinitionsData.length > 0) {
    console.log("  - Seeding Attribute Definitions...");
    await db
      .insert(schema.attributeDefinitions)
      .values(prepareSeedData(schema.attributeDefinitions, attributeDefinitionsData));
  }

  // Level 2: Products (depends on brands, categories)
  if (productsData.length > 0) {
    console.log("  - Seeding Products...");
    await ensureParents(db, [
      { table: schema.brands, name: '"catalog"."brands"' },
      { table: schema.categories, name: '"catalog"."categories"' },
    ]);
    await db.insert(schema.products).values(prepareSeedData(schema.products, productsData));
  }

  // Level 3: Variants & Associations
  if (productVariantsData.length > 0) {
    console.log("  - Seeding Product Variants...");
    await ensureParents(db, [{ table: schema.products, name: '"catalog"."products"' }]);
    await db
      .insert(schema.productVariants)
      .values(prepareSeedData(schema.productVariants, productVariantsData));
  }

  if (variantImagesData.length > 0) {
    console.log("  - Seeding Variant Images...");
    await ensureParents(db, [
      { table: schema.productVariants, name: '"catalog"."product_variants"' },
    ]);
    await db
      .insert(schema.variantImages)
      .values(prepareSeedData(schema.variantImages, variantImagesData));
  }

  if (variantAttributesData.length > 0) {
    console.log("  - Seeding Variant Attributes...");
    await ensureParents(db, [
      { table: schema.productVariants, name: '"catalog"."product_variants"' },
      { table: schema.attributeDefinitions, name: '"catalog"."attribute_definitions"' },
    ]);
    await db
      .insert(schema.variantAttributes)
      .values(prepareSeedData(schema.variantAttributes, variantAttributesData));
  }

  if (variantSellableUomsData.length > 0) {
    console.log("  - Seeding Variant Sellable UOMs...");
    await ensureParents(db, [
      { table: schema.productVariants, name: '"catalog"."product_variants"' },
    ]);
    await db
      .insert(schema.variantSellableUoms)
      .values(prepareSeedData(schema.variantSellableUoms, variantSellableUomsData));
  }

  if (variantPriceListsData.length > 0) {
    console.log("  - Seeding Variant Price Lists...");
    await ensureParents(db, [
      { table: schema.productVariants, name: '"catalog"."product_variants"' },
    ]);
    await db
      .insert(schema.variantPriceLists)
      .values(prepareSeedData(schema.variantPriceLists, variantPriceListsData));
  }

  if (productTagsData.length > 0) {
    console.log("  - Seeding Product Tags...");
    await ensureParents(db, [
      { table: schema.products, name: '"catalog"."products"' },
      { table: schema.tags, name: '"catalog"."tags"' },
    ]);
    await db
      .insert(schema.productTags)
      .values(prepareSeedData(schema.productTags, productTagsData));
  }

  if (collectionTagsData.length > 0) {
    console.log("  - Seeding Collection Tags...");
    await ensureParents(db, [
      { table: schema.collections, name: '"catalog"."collections"' },
      { table: schema.tags, name: '"catalog"."tags"' },
    ]);
    await db
      .insert(schema.collectionTags)
      .values(prepareSeedData(schema.collectionTags, collectionTagsData));
  }

  if (productAttributesData.length > 0) {
    console.log("  - Seeding Product Attributes...");
    await ensureParents(db, [
      { table: schema.products, name: '"catalog"."products"' },
      { table: schema.attributeDefinitions, name: '"catalog"."attribute_definitions"' },
    ]);
    await db
      .insert(schema.productAttributes)
      .values(prepareSeedData(schema.productAttributes, productAttributesData));
  }

  if (reviewsData.length > 0) {
    console.log("  - Seeding Reviews...");
    await ensureParents(db, [{ table: schema.products, name: '"catalog"."products"' }]);
    await db.insert(schema.reviews).values(prepareSeedData(schema.reviews, reviewsData));
  }

  if (reviewHelpfulVotesData.length > 0) {
    console.log("  - Seeding Review Helpful Votes...");
    await ensureParents(db, [{ table: schema.reviews, name: '"catalog"."reviews"' }]);
    await db
      .insert(schema.reviewHelpfulVotes)
      .values(prepareSeedData(schema.reviewHelpfulVotes, reviewHelpfulVotesData));
  }
}
