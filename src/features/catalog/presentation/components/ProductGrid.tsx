"use client";

import { motion } from "framer-motion";
import { Product } from "@/features/catalog/domain/entities/Product";
import { ProductCard } from "./ProductCard";
import { SectionStateEmpty } from "@/components/common/state/SectionStateEmpty";
import { useTranslations } from "next-intl";

interface ProductGridProps {
  products: Product[];
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

/**
 *
 */
export function ProductGrid({ products }: ProductGridProps) {
  const t = useTranslations();

  if (!products || products.length === 0) {
    return (
      <SectionStateEmpty
        title={t("Pages.Shop.NoProducts")}
        description={t("Pages.Shop.NoProducts")}
      />
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </motion.div>
  );
}
