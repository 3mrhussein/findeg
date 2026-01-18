/**
 * Database Seed Script
 *
 * This script populates the database with initial data from src/lib/constants.ts
 *
 * Usage:
 *   npm run db:seed
 *
 * Make sure to run migrations first:
 *   npm run db:migrate
 */

import * as dotenv from 'dotenv';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { products, productTranslations } from '../src/infrastructure/database/schema/products.ts';
import { products as mockProducts } from '../src/lib/constants.ts';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config();

/**
 * Seed the database with products and translations
 */
async function seed() {
  let client;

  try {
    // Get database URL
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    // Create postgres client
    client = postgres(databaseUrl);
    const db = drizzle(client);

    console.log('🌱 Starting database seed...');

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🗑️  Clearing existing data...');
    await db.delete(productTranslations);
    await db.delete(products);

    console.log(`📦 Seeding ${mockProducts.length} products...`);

    // Insert products and their translations
    for (const mockProduct of mockProducts) {
      // Insert base product
      const [insertedProduct] = await db
        .insert(products)
        .values({
          price: mockProduct.price.toString(),
          strikePrice: mockProduct.strikePrice?.toString(),
          category: mockProduct.category,
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
        language: 'en',
        name: mockProduct.name,
        description: mockProduct.description,
        longDescription: mockProduct.longDescription || mockProduct.description,
      });

      console.log(`✅ Seeded product: ${mockProduct.name} (ID: ${insertedProduct.id})`);
    }

    console.log('✨ Database seed completed successfully!');
    console.log(`📊 Total products seeded: ${mockProducts.length}`);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
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