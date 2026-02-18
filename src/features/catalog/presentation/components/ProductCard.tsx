"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Eye } from "lucide-react";

import { Product } from "@/features/catalog/domain/entities/Product";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useCart } from "@/hooks/useCart"; // Assuming this exists or will exist

interface ProductCardProps {
  product: Product;
}

/**
 *
 */
export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart(); // Assuming simplified hook usage

  return (
    <motion.div
      data-testid={`product-card-${product.id}`}
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
    >
      <Card className="overflow-hidden h-full flex flex-col group border-0 shadow-sm hover:shadow-md transition-shadow">
        <div className="relative aspect-square overflow-hidden bg-secondary/10">
          <Image
            src={product.images[0] || product.imageUrl || "/placeholder-product.jpg"}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {/* Status Badge (e.g. New, Sale) - logic can be added */}
          {/* <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">New</Badge> */}

          {/* Quick Actions overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              variant="secondary"
              size="icon"
              className="rounded-full translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75"
              asChild
            >
              <Link href={`/products/${product.id}`}>
                <Eye className="h-4 w-4" />
                <span className="sr-only">View Details</span>
              </Link>
            </Button>
            <Button
              variant="default"
              size="icon"
              data-testid={`product-card-add-${product.id}`}
              className="rounded-full translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-100"
              onClick={() => addToCart(product, 1)}
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="sr-only">Add to Cart</span>
            </Button>
          </div>
        </div>

        <CardContent className="p-4 flex-grow">
          <div className="text-sm text-muted-foreground mb-1">
            {product.categoryName || "Stationary"}
          </div>
          <Link href={`/products/${product.id}`} className="hover:underline">
            <h3
              className="font-semibold text-lg leading-tight line-clamp-2 mb-2"
              data-testid={`product-card-title-${product.id}`}
            >
              {product.name}
            </h3>
          </Link>
          <div className="flex items-center gap-2">{/* Rating logic could go here */}</div>
        </CardContent>

        <CardFooter className="p-4 pt-0 flex items-center justify-between">
          <div className="font-bold text-lg" data-testid={`product-card-price-${product.id}`}>
            {new Intl.NumberFormat("en-EG", {
              style: "currency",
              currency: "EGP",
            }).format(product.price)}
          </div>
          {/* Add to cart / Buy now can be here too for mobile */}
        </CardFooter>
      </Card>
    </motion.div>
  );
}
