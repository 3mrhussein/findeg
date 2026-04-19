// .ts file only — no JSX
export const TAG_DISPLAY: Record<string, { en: string; ar: string }> = {
    // campaign group
    "back-to-school": { en: "Back to School", ar: "العودة للمدرسة" },
    "new-arrival": { en: "New Arrival", ar: "وصل حديثاً" },
    "ramadan-special": { en: "Ramadan Special", ar: "عروض رمضان" },
    // audience group
    "primary-school": { en: "Primary School", ar: "العودة للمدرسة" },
    "middle-school": { en: "Middle School", ar: "المرحلة الإعدادية" },
    "high-school": { en: "High School", ar: "المرحلة الثانوية" },
    // quality group
    "best-seller": { en: "Best Seller", ar: "الأكثر مبيعاً" },
    imported: { en: "Imported", ar: "مستورد" },
    "eco-friendly": { en: "Eco Friendly", ar: "صديق للبيئة" },
};

export function getTagDisplayName(key: string, locale: "en" | "ar" = "en"): string {
    return TAG_DISPLAY[key]?.[locale] ?? key;
}
