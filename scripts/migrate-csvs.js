import fs from "fs";
import path from "path";

const DATA_DIR = path.resolve("scripts/data/seed/tables");

function readCsv(filename) {
  const filepath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filepath)) return null;
  const content = fs.readFileSync(filepath, "utf-8");
  const lines = content.split(/\r?\n/).filter(Boolean);
  const headers = lines[0].split(",");
  return lines.slice(1).map((line) => {
    // Basic CSV parser for the seed files
    const values = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      if (line[i] === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (line[i] === "," && !inQuotes) {
        values.push(current);
        current = "";
      } else {
        current += line[i];
      }
    }
    values.push(current);

    const obj = {};
    headers.forEach((h, i) => (obj[h] = values[i]));
    return obj;
  });
}

function writeCsv(filename, data) {
  if (!data || data.length === 0) return;
  const headers = Object.keys(data[0]);
  const lines = [headers.join(",")];
  for (const row of data) {
    const line = headers.map((h) => {
      let val = row[h];
      if (val === null || val === undefined) return "";
      val = String(val);
      if (val.includes(",") || val.includes('"') || val.includes("\n")) {
        return '"' + val.replace(/"/g, '""') + '"';
      }
      return val;
    });
    lines.push(line.join(","));
  }
  fs.writeFileSync(path.join(DATA_DIR, filename), lines.join("\n"));
  console.log(`Wrote ${filename} with ${data.length} rows.`);
}

console.log("Starting CSV Migration...");

// 1. Process products.csv -> products, product_variants, variant_images, warehouses, inventory_balances
const oldProducts = readCsv("products.csv");
if (oldProducts) {
  const newProducts = [];
  const productVariants = [];
  const variantImages = [];
  const inventoryBalances = [];

  // Create a default warehouse
  const warehouses = [
    {
      id: 1,
      code: "MAIN",
      name: "Main Warehouse",
      is_active: "true",
      created_at: new Date().toISOString(),
    },
  ];

  let nextImageId = 1;

  for (const p of oldProducts) {
    // 1. New Product (SPU)
    newProducts.push({
      id: p.id,
      sku_prefix: p.sku ? p.sku.substring(0, 5) : "",
      localized_slug: "{}",
      localized_name: "{}",
      localized_description: "{}",
      localized_long_description: "{}",
      category_id: p.category_id,
      brand_id: p.brand_id,
      media_set: "{}",
      display_meta: p.display_meta || "{}",
      is_active: p.is_active,
      is_new: p.is_new,
      rating: p.rating,
      reviews_count: p.reviews_count,
      created_at: p.created_at,
      updated_at: p.updated_at,
    });

    // 2. Product Variant (SKU)
    productVariants.push({
      id: p.id, // mapped 1:1 for simplicity
      product_id: p.id,
      sku: p.sku || `SKU-${p.id}`,
      variant_key: "default",
      localized_label: "{}",
      display_order: 0,
      is_active: "true",
      base_price: p.price || 0,
      strike_price: p.strike_price || "",
      cost_price: "",
      weight_grams: "", // not in old products.csv
      barcode: "",
      low_stock_threshold: p.low_stock_threshold || 10,
      created_at: p.created_at,
      updated_at: p.updated_at,
    });

    // 3. Variant Images
    if (p.images) {
      try {
        const imagesList = JSON.parse(p.images);
        if (Array.isArray(imagesList)) {
          imagesList.forEach((imgUrl, idx) => {
            variantImages.push({
              id: nextImageId++,
              variant_id: p.id,
              url: imgUrl,
              alt: "",
              display_order: idx,
              created_at: p.created_at,
            });
          });
        }
      } catch (e) {
        // ignore malformed images
      }
    }

    // 4. Inventory Balances
    inventoryBalances.push({
      id: p.id,
      variant_id: p.id,
      warehouse_id: 1,
      on_hand: p.stock_quantity || 0,
      reserved: 0,
      updated_at: p.updated_at,
    });
  }

  writeCsv("products.csv", newProducts); // overwrite
  writeCsv("product_variants.csv", productVariants);
  writeCsv("variant_images.csv", variantImages);
  writeCsv("warehouses.csv", warehouses);
  writeCsv("inventory_balances.csv", inventoryBalances);
}

// 2. Migrate variant_price_lists.csv
const priceLists = readCsv("variant_price_lists.csv");
if (priceLists) {
  const newPriceLists = priceLists.map((pl) => {
    return {
      id: pl.id,
      variant_id: pl.product_id, // we mapped variant_id = product_id
      customer_group: pl.customer_group,
      uom_code: pl.uom_code,
      currency: pl.currency,
      unit_price: pl.unit_price,
      min_qty: pl.min_qty || 1,
      is_sellable: pl.is_sellable,
      starts_at: pl.starts_at || "",
      ends_at: pl.ends_at || "",
      created_at: pl.created_at,
      updated_at: pl.updated_at,
    };
  });
  writeCsv("variant_price_lists.csv", newPriceLists);
}

// 3. Migrate variant_sellable_uoms.csv
const sellableUoms = readCsv("variant_sellable_uoms.csv");
if (sellableUoms) {
  const newSellableUoms = sellableUoms.map((su) => {
    return {
      id: su.id,
      variant_id: su.product_id,
      uom_code: su.uom_code,
      factor_to_base: su.factor_to_base,
      localized_label: su.localized_label || "{}",
      barcode: su.barcode || "",
      is_enabled: su.is_enabled,
      created_at: su.created_at,
      updated_at: su.updated_at,
    };
  });
  writeCsv("variant_sellable_uoms.csv", newSellableUoms);
}

// 4. Update orders items to have variant_id
const orderItems = readCsv("order_items.csv");
if (orderItems) {
  const newOrderItems = orderItems.map((oi) => {
    return {
      ...oi,
      variant_id: oi.product_id, // map to variant
      uom_code: "EA", // default uom if none existed
    };
  });
  writeCsv("order_items.csv", newOrderItems);
}

console.log("Migration complete!");
