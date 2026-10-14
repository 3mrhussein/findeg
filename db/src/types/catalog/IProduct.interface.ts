export interface IProduct {
  //product Row Id in database
  id: number;
  //
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
    card?: object | undefined;
    pdp?: object | undefined;
    zoom?: object | undefined;
    original?: object | undefined;
  } | null;
  rating: string | null;
  reviewsCount: number | null;
}
