import { Tag } from "@/features/catalog/domain/entities/Tag";

export const TAG_DISPLAY_MAP: Record<string, { en: string; ar: string }> = {
  // Use Case
  "usecase:school-prep": { en: "School Prep", ar: "تجهيز للمدرسة" },
  "usecase:bullet-journaling": { en: "Bullet Journaling", ar: "بوليت جورنالينج" },

  // Style
  "style:minimalist": { en: "Minimalist", ar: "بسيط" },
  "style:professional": { en: "Professional", ar: "احترافي" },

  // Seasonality
  "seasonality:back-to-school": { en: "Back to School", ar: "العودة للمدارس" },

  // Audience
  "audience:students": { en: "Students", ar: "طلاب" },
  "audience:teachers": { en: "Teachers", ar: "مدرسين" },
  "audience:artists": { en: "Artists", ar: "فنانين" },

  // Add more tags as needed
};

export function getTagDisplay(tag: Pick<Tag, "group" | "key">, locale: string = "en"): string {
  const identifier = `${tag.group}:${tag.key}`;
  const mapping = TAG_DISPLAY_MAP[identifier];

  if (mapping) {
    return locale === "ar" ? mapping.ar : mapping.en;
  }

  // Fallback: title-case the key
  return tag.key
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
