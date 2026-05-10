import fs from 'fs';
import path from 'path';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'seeds/data');

function migrateBrands() {
  const filePath = path.join(DATA_DIR, 'brands.json');
  const brands = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const migrated = brands.map(b => ({
    id: b.id,
    slug: b.slug,
    localizedName: { en: b.name, ar: b.name }, // Fallback ar to en for seed
    localizedDescription: b.localizedDescription || { en: "", ar: "" },
    logoUrl: b.logoUrl,
    createdAt: b.createdAt,
    updatedAt: b.updatedAt
  }));
  fs.writeFileSync(filePath, JSON.stringify(migrated, null, 2));
  console.log('Migrated brands.json');
}

function migrateProducts() {
  const filePath = path.join(DATA_DIR, 'products.json');
  const products = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const migrated = products.map(p => {
    const { mediaSet, sku, skuPrefix, ...rest } = p;
    return rest;
  });
  fs.writeFileSync(filePath, JSON.stringify(migrated, null, 2));
  console.log('Migrated products.json');
}

function migrateAttributes() {
  const oldPath = path.join(DATA_DIR, 'attribute_definitions.json');
  const newPath = path.join(DATA_DIR, 'attributes.json');
  const attrs = JSON.parse(fs.readFileSync(oldPath, 'utf8'));
  const migrated = attrs.map(a => {
    const { scope, isVariantDefining, ...rest } = a;
    return rest;
  });
  fs.writeFileSync(newPath, JSON.stringify(migrated, null, 2));
  fs.unlinkSync(oldPath);
  console.log('Migrated attribute_definitions.json to attributes.json');
}

function migrateProductVariants() {
  const filePath = path.join(DATA_DIR, 'product_variants.json');
  const variants = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  // Group by productId to assign isDefault
  const grouped = {};
  variants.forEach(v => {
    if (!grouped[v.productId]) grouped[v.productId] = [];
    grouped[v.productId].push(v);
  });

  const migrated = [];
  Object.values(grouped).forEach(productVariants => {
    productVariants.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    productVariants.forEach((v, index) => {
      const { lowStockThreshold, displayOrder, ...rest } = v;
      migrated.push({
        ...rest,
        isDefault: index === 0, // Mark first as default
        sortOrder: index + 1,
        mediaSet: {} // Empty for now, will be populated by logic or manual edit if needed
      });
    });
  });

  fs.writeFileSync(filePath, JSON.stringify(migrated, null, 2));
  console.log('Migrated product_variants.json');
}

function migrateJoinTables() {
  ['product_attributes.json', 'variant_attributes.json'].forEach(file => {
    const filePath = path.join(DATA_DIR, file);
    if (!fs.existsSync(filePath)) return;
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const migrated = data.map(item => {
      const { valueNum, valueBool, ...rest } = item;
      return rest;
    });
    fs.writeFileSync(filePath, JSON.stringify(migrated, null, 2));
    console.log(`Migrated ${file}`);
  });
}

migrateBrands();
migrateProducts();
migrateAttributes();
migrateProductVariants();
migrateJoinTables();
