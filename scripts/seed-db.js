/**
 * Database Seed Script
 *
 * This script populates the database with initial data from src/lib/constants.ts
 * and creates a default admin user.
 *
 * Usage:
 *   npm run db:seed
 */

import * as dotenv from "dotenv";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { products, productTranslations } from "../src/infrastructure/database/schema/products.ts";
import {
  categories,
  categoryTranslations,
} from "../src/infrastructure/database/schema/categories.ts";
import { users } from "../src/infrastructure/database/schema/users.ts";
import { products as mockProducts } from "../src/lib/constants.ts";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

// Load environment variables
dotenv.config({ path: ".env.local" });
dotenv.config();

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}

/**
 * Seed the database with products, translations, categories, and admin user
 */
async function seed() {
  let client;

  try {
    // Get database URL
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error("DATABASE_URL environment variable is not set");
    }

    // Create postgres client
    client = postgres(databaseUrl);
    const db = drizzle(client);

    console.log("🌱 Starting database seed...");

    // --- Create/Update Admin User ---
    console.log("👤 Seeding admin user...");

    // Admin credentials
    const adminEmail = "admin@findeg.com";
    const adminPassword = "admin";
    const adminName = "Admin User";

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Check if user exists
    const existingUsers = await db.select().from(users).where(eq(users.email, adminEmail));

    if (existingUsers.length > 0) {
      console.log("⚠️  Admin user already exists. Updating password...");
      await db
        .update(users)
        .set({
          password: hashedPassword,
          role: "admin",
          name: adminName,
          isActive: true,
        })
        .where(eq(users.email, adminEmail));
      console.log("✅ Admin user updated.");
    } else {
      await db.insert(users).values({
        email: adminEmail,
        password: hashedPassword,
        name: adminName,
        role: "admin",
        isActive: true,
      });
      console.log("✅ Admin user created.");
    }

    // --- Seed Data ---
    console.log("🗑️  Clearing existing data...");
    // Clear in correct order due to FK constraints
    await db.delete(productTranslations);
    await db.delete(products);
    await db.delete(categoryTranslations);
    await db.delete(categories);

    // --- Seed Categories ---
    console.log("📂 Seeding categories...");
    const uniqueCategories = [...new Set(mockProducts.map((p) => p.category))].filter(Boolean);
    const categoryMap = new Map(); // Name -> ID

    for (const catName of uniqueCategories) {
      if (!catName) continue;

      const slug = slugify(catName);

      const [insertedCategory] = await db
        .insert(categories)
        .values({
          slug: slug,
          isActive: true,
          path: "/",
          depth: 0,
        })
        .returning();

      await db.insert(categoryTranslations).values({
        categoryId: insertedCategory.id,
        language: "en",
        name: catName,
        description: `Everything for ${catName}`,
      });

      categoryMap.set(catName, insertedCategory.id);
      console.log(`folder ✅ Category created: ${catName}`);
    }

    // --- Seed Products ---
    console.log(`📦 Seeding ${mockProducts.length} products...`);

    for (const mockProduct of mockProducts) {
      const categoryId = mockProduct.category ? categoryMap.get(mockProduct.category) : null;

      // Insert base product
      const [insertedProduct] = await db
        .insert(products)
        .values({
          price: mockProduct.price.toString(),
          strikePrice: mockProduct.strikePrice?.toString(),
          categoryId: categoryId, // Mapped ID
          // category: mockProduct.category, // Removed column
          images: mockProduct.images || [],
          isNew: mockProduct.isNew || false,
          rating: (mockProduct.rating || 0).toString(),
          reviewsCount: mockProduct.reviewsCount || 0,
          variants: mockProduct.variants || null,
        })
        .returning();

      if (!insertedProduct) {
        console.error(`❌ Failed to insert product: ${mockProduct.name}`);
        continue;
      }

      // Insert English translation
      await db.insert(productTranslations).values({
        productId: insertedProduct.id,
        language: "en",
        name: mockProduct.name,
        description: mockProduct.description,
        longDescription: mockProduct.longDescription || mockProduct.description,
      });

      console.log(`✅ Seeded product: ${mockProduct.name} (ID: ${insertedProduct.id})`);
    }

    console.log("✨ Database seed completed successfully!");
    console.log(`📊 Total products seeded: ${mockProducts.length}`);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  } finally {
    // Close database connection
    if (client) {
      await client.end();
    }
  }
}

// Run seed
seed();
