export interface IProduct {
  //product Row Id in database
  id: number;
  //
  sku: string | null;
  skuPrefix: string | null;
  slug: string | null;
  localizedName: {
    en: string;
    ar?: string | undefined;
  };
  localizedDescription: {
    en: string;
    ar?: string | undefined;
  };
  localizedLongDescription: {
    en: string;
    ar?: string | undefined;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  categoryId: number | null;
  brandId: number | null;
  mediaSet: {
    thumbnail?:
      | {
          url: string;
          width?: number | undefined;
          height?: number | undefined;
          mimeType?: string | undefined;
          alt?:
            | {
                en: string;
                ar?: string | undefined;
              }
            | undefined;
        }
      | undefined;
    card?: {} | undefined;
    pdp?: {} | undefined;
    zoom?: {} | undefined;
    original?: {} | undefined;
  } | null;
  rating: string | null;
  reviewsCount: number | null;
}
