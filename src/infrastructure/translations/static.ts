/**
 * Static Translation Service
 */

import { StaticTranslations } from "./types";
// import { cmsClient } from '../cms/client';

/**
 * Get static translations for a specific language
 *
 * @param language Language code ('en', 'ar')
 * @returns Static translations from CMS
 */
export async function getStaticTranslation(
  language: string = "en",
): Promise<StaticTranslations> {
  // Try to fetch from CMS
  try {
    // const translations = await cmsClient.getTranslations(language);
    // return translations;

    // For now, return mock translations (you can replace this with actual CMS call)
    return getMockTranslations(language);
  } catch (error) {
    console.error(`Failed to fetch translations for ${language}:`, error);
    return getMockTranslations("en"); // Fallback to English
  }
}

/**
 * Mock translations for development
 */
function getMockTranslations(language: string): StaticTranslations {
  if (language === "ar") {
    return {
      featured_products_title: "منتجات مختارة",
      featured_products_subtitle: "اكتشف مجموعتنا المختارة من المنتجات المميزة",
      add_to_cart: "أضف إلى السلة",
      shop_now: "تسوق الآن",
    };
  }

  return {
    featured_products_title: "Featured Products",
    featured_products_subtitle:
      "Discover our handpicked selection of premium products",
    add_to_cart: "Add to Cart",
    shop_now: "Shop Now",
  };
}
