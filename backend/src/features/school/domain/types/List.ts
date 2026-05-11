export interface SchoolListTranslationMap {
  en?: string;
  ar?: string;
}

export interface SchoolList {
  id: number;
  slug: string;
  schoolName: string;
  grade: string;
  academicYear: string;
  governorate: string | null;
  area: string | null;
  schoolType: string | null;
  academicSystem: string | null;
  localizedTitle: SchoolListTranslationMap;
  localizedDescription: SchoolListTranslationMap | null;
  heroImageUrl: string | null;
  logoUrl: string | null;
  isActive: boolean;
  accessMode: string;
  accessCode: string | null;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  categoryId: number | null;
}
