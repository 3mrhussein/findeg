import { db } from "@features/core/infrastructure/persistence";
import { brands } from "@features/core/infrastructure/persistence/schema";
import { eq } from "drizzle-orm";

async function seedBrands() {
  console.log("🌱 Seeding brands...");

  const brandData = [
    {
      slug: "faber-castell",
      name: "Faber-Castell",
      localizedName: { en: "Faber-Castell", ar: "فابر كاستل" },
      localizedDescription: {
        en: "Premium German stationery brand since 1761.",
        ar: "علامة ألمانية متميزة منذ 1761.",
      },
      logoUrl: "https://placehold.co/200x80/1a1a2e/ffffff?text=Faber-Castell",
      isActive: true,
    },
    {
      slug: "pilot",
      name: "Pilot",
      localizedName: { en: "Pilot", ar: "بايلوت" },
      localizedDescription: {
        en: "Japanese brand known for smooth gel pens.",
        ar: "علامة يابانية معروفة بأقلام الجل السلسة.",
      },
      logoUrl: "https://placehold.co/200x80/2980b9/ffffff?text=Pilot",
      isActive: true,
    },
    {
      slug: "maped",
      name: "Maped",
      localizedName: { en: "Maped", ar: "ماباد" },
      localizedDescription: {
        en: "French brand for innovative school supplies.",
        ar: "علامة فرنسية لمستلزمات مدرسية مبتكرة.",
      },
      logoUrl: "https://placehold.co/200x80/e67e22/ffffff?text=Maped",
      isActive: true,
    },
    {
      slug: "bic",
      name: "BIC",
      localizedName: { en: "BIC", ar: "بيك" },
      localizedDescription: {
        en: "World-renowned for affordable ballpoint pens.",
        ar: "علامة عالمية لأقلام الحبر الجاف بأسعار معقولة.",
      },
      logoUrl: "https://placehold.co/200x80/f39c12/ffffff?text=BIC",
      isActive: true,
    },
    {
      slug: "staedtler",
      name: "Staedtler",
      localizedName: { en: "Staedtler", ar: "ستيدلر" },
      localizedDescription: {
        en: "German manufacturer of writing and drawing instruments.",
        ar: "شركة ألمانية لأدوات الكتابة والرسم.",
      },
      logoUrl: "https://placehold.co/200x80/c0392b/ffffff?text=Staedtler",
      isActive: true,
    },
    {
      slug: "pentel",
      name: "Pentel",
      localizedName: { en: "Pentel", ar: "بنتل" },
      localizedDescription: {
        en: "Japanese brand known for mechanical pencils and EnerGel pens.",
        ar: "علامة يابانية معروفة بالأقلام الميكانيكية.",
      },
      logoUrl: "https://placehold.co/200x80/8e44ad/ffffff?text=Pentel",
      isActive: false,
    },
  ];

  for (const data of brandData) {
    const existing = await db.select().from(brands).where(eq(brands.slug, data.slug)).limit(1);

    if (existing.length > 0) {
      console.log(`Updating brand: ${data.name}`);
      await db
        .update(brands)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(brands.slug, data.slug));
    } else {
      console.log(`Inserting brand: ${data.name}`);
      await db.insert(brands).values({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }

  console.log("✅ Brands seeded successfully!");
  process.exit(0);
}

seedBrands().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
