import { db } from '../../connection';
import { products, productVariants, variantImages } from '../../schema';
import { asc, eq } from 'drizzle-orm';

export async function getAdminProductForEditRaw(id: number) {
  return db.query.products.findFirst({
    where: eq(products.id, id),
    with: {
      variants: {
        with: {
          images: {
            orderBy: [asc(variantImages.displayOrder)],
          },
          attributes: {
            with: {
              definition: true,
            },
          },
        },
        orderBy: [asc(productVariants.sortOrder)],
      },
      tags: {
        with: {
          tag: true,
        },
      },
    },
  });
}