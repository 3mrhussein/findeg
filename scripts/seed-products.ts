import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { db } from "@/features/core/infrastructure/persistence";
import {
  products,
  productVariants,
  variantImages,
  inventoryBalances,
} from "@/features/core/infrastructure/persistence/schema";

async function seedProducts() {
  console.log("🌱 Seeding realistic stationery products...");

  const WAREHOUSE_ID = 1; // Main Warehouse

  const productData = [
    // Pens
    {
      name: "Pilot G2 Premium Gel Pen - Blue",
      sku: "PLT-G2-BLU",
      cat: 33,
      brand: 8,
      price: 45,
      stock: 120,
    },
    {
      name: "Pilot G2 Premium Gel Pen - Black",
      sku: "PLT-G2-BLK",
      cat: 33,
      brand: 8,
      price: 45,
      stock: 85,
    },
    {
      name: "Bic Cristal Original Ballpoint Pen - Blue",
      sku: "BIC-CR-BLU",
      cat: 34,
      brand: 9,
      price: 15,
      stock: 500,
    },
    {
      name: "Bic Cristal Original Ballpoint Pen - Black",
      sku: "BIC-CR-BLK",
      cat: 34,
      brand: 9,
      price: 15,
      stock: 450,
    },
    {
      name: "Faber-Castell Grip 2011 Fountain Pen - Silver",
      sku: "FC-GRIP-SLV",
      cat: 35,
      brand: 1,
      price: 350,
      stock: 12,
    },

    // Pencils & Drawing
    {
      name: "Faber-Castell 9000 Graphite Pencil - 2B",
      sku: "FC-9000-2B",
      cat: 24,
      brand: 1,
      price: 25,
      stock: 200,
    },
    {
      name: "Faber-Castell 9000 Graphite Pencil - HB",
      sku: "FC-9000-HB",
      cat: 24,
      brand: 1,
      price: 25,
      stock: 150,
    },
    {
      name: "Staedtler Mars Lumograph Pencil Set 12pcs",
      sku: "STD-MARS-12",
      cat: 24,
      brand: 2,
      price: 480,
      stock: 30,
    },
    {
      name: "Maped Black'Peps Graphite Pencils - 12 Pack",
      sku: "MPD-BP-12",
      cat: 24,
      brand: 3,
      price: 110,
      stock: 65,
    },

    // Markers & Highlighters
    {
      name: "Stabilo Boss Original Highlighter - Yellow",
      sku: "STB-BOSS-YEL",
      cat: 31,
      brand: 4,
      price: 35,
      stock: 300,
    },
    {
      name: "Stabilo Boss Original Highlighter - Pink",
      sku: "STB-BOSS-PNK",
      cat: 31,
      brand: 4,
      price: 35,
      stock: 250,
    },
    {
      name: "Pilot V-Board Master Whiteboard Marker - Red",
      sku: "PLT-VBM-RED",
      cat: 29,
      brand: 8,
      price: 55,
      stock: 40,
    },
    {
      name: "Pilot V-Board Master Whiteboard Marker - Black",
      sku: "PLT-VBM-BLK",
      cat: 29,
      brand: 8,
      price: 55,
      stock: 45,
    },

    // Rulers & Measurement
    {
      name: "Maped Twist'n Flex Unbreakable Ruler 30cm",
      sku: "MPD-TWIST-30",
      cat: 19,
      brand: 3,
      price: 40,
      stock: 90,
    },
    {
      name: "Staedtler Aluminium Scale Ruler 30cm",
      sku: "STD-ALU-30",
      cat: 19,
      brand: 2,
      price: 220,
      stock: 15,
    },
    {
      name: "Maped Precision Geometry Set 9pcs",
      sku: "MPD-GEO-9",
      cat: 20,
      brand: 3,
      price: 180,
      stock: 50,
    },

    // Erasers & Sharpeners
    {
      name: "Faber-Castell Dust-Free Eraser - White",
      sku: "FC-DFE-WHT",
      cat: 26,
      brand: 1,
      price: 12,
      stock: 400,
    },
    {
      name: "Maped Vivo 1-Hole Pencil Sharpener",
      sku: "MPD-VIVO-1",
      cat: 27,
      brand: 3,
      price: 18,
      stock: 150,
    },
    {
      name: "Staedtler Mars Plastic Eraser - Large",
      sku: "STD-MARS-ERS",
      cat: 26,
      brand: 2,
      price: 30,
      stock: 200,
    },

    // Office & Desk
    {
      name: "Deli Effortless Heavy Duty Stapler",
      sku: "DLI-HD-STP",
      cat: 55,
      brand: 5,
      price: 420,
      stock: 8,
    },
    {
      name: "Deli Desktop Organizer - 9 Compartments",
      sku: "DLI-ORG-9",
      cat: 78,
      brand: 5,
      price: 280,
      stock: 10,
    },
    {
      name: "Casio MS-20UC Desktop Calculator - Blue",
      sku: "CAS-MS20-BLU",
      cat: 54,
      brand: 6,
      price: 350,
      stock: 25,
    },

    // Paper & Notebooks (using some generic IDs for now)
    {
      name: "Premium Spiral Notebook A4 - 100 Sheets",
      sku: "NBK-A4-100",
      cat: 62,
      brand: 11,
      price: 85,
      stock: 60,
    },
    {
      name: "Pocket Memo Pad 3x5 - 50 Sheets",
      sku: "MEM-35-50",
      cat: 62,
      brand: 11,
      price: 25,
      stock: 120,
    },

    // Draft/Inactive/Missing data items
    {
      name: "Draft Product - New Arrival Pen",
      sku: "DFT-PEN-001",
      cat: 32,
      brand: 7,
      price: 0,
      stock: 0,
      active: false,
    },
    {
      name: "Product Missing Category - Mystery Pen",
      sku: "MISC-PEN-001",
      cat: null,
      brand: 7,
      price: 25,
      stock: 10,
    },
    {
      name: "Product Missing Price - Pilot Luxury",
      sku: "PLT-LUX-001",
      cat: 35,
      brand: 1,
      price: null,
      stock: 5,
    },
    {
      name: "Product With Very Long Name That Should Be Truncated In The Table View To Ensure Layout Stability And Test Tooltips If Any",
      sku: "LONG-NAME-001",
      cat: 32,
      brand: 8,
      price: 99,
      stock: 100,
    },
    {
      name: "Pilot Pen With No Images For Verification",
      sku: "PLT-NOIMG-001",
      cat: 32,
      brand: 8,
      price: 30,
      stock: 50,
    },
    {
      name: "Old Stationery Item - Discontinued",
      sku: "OLD-ITEM-001",
      cat: 32,
      brand: 9,
      price: 10,
      stock: 0,
      active: false,
    },
  ];

  for (const item of productData) {
    const slug = item.name
      .toLowerCase()
      .replace(/ /g, "-")
      .replace(/[^\w-]/g, "");

    // 1. Insert SPU
    const [spu] = await db
      .insert(products)
      .values({
        sku: item.sku,
        localizedName: { en: item.name, ar: item.name }, // Simplified for seed
        localizedSlug: { en: slug, ar: slug },
        categoryId: item.cat,
        brandId: item.brand,
        isActive: item.active ?? true,
      })
      .returning({ id: products.id });

    // 2. Insert Variant
    const [variant] = await db
      .insert(productVariants)
      .values({
        productId: spu.id,
        sku: item.sku,
        variantKey: "default",
        localizedLabel: { en: "Default", ar: "افتراضي" },
        basePrice: item.price !== null ? String(item.price) : "0.00",
        isActive: item.active ?? true,
      })
      .returning({ id: productVariants.id });

    // 3. Insert Image (except for the one marked no images)
    if (!item.name.includes("No Images")) {
      await db.insert(variantImages).values({
        variantId: variant.id,
        url: `https://placehold.co/400x400/eeeeee/333333?text=${encodeURIComponent(item.name)}`,
        alt: item.name,
      });
    }

    // 4. Insert Inventory
    if (item.stock > 0) {
      await db.insert(inventoryBalances).values({
        variantId: variant.id,
        warehouseId: WAREHOUSE_ID,
        onHand: item.stock,
        reserved: 0,
      });
    }
  }

  console.log("✅ Successfully seeded 32 realistic products!");
  process.exit(0);
}

seedProducts().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
