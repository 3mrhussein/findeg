/**
 * Partner School profile vocabulary (GLOSSARY: Partner School, Partner School Profile).
 *
 * Governorate, school type and academic system are closed lists chosen by FindEg Staff.
 */

export const GOVERNORATES = [
  'Cairo',
  'Giza',
  'Alexandria',
  'Dakahlia',
  'Red Sea',
  'Sharqia',
  'Qalyubia',
  'Beheira',
  'Gharbia',
  'Faiyum',
  'Minya',
  'Asyut',
  'Sohag',
  'Qena',
  'Luxor',
  'Aswan',
] as const;
export type Governorate = (typeof GOVERNORATES)[number];

export const SCHOOL_TYPES = [
  'National',
  'International',
  'Language',
  'Private',
  'Experimental',
] as const;
export type SchoolType = (typeof SCHOOL_TYPES)[number];

export const ACADEMIC_SYSTEMS = [
  'National',
  'American',
  'British',
  'IGCSE',
  'IB',
  'French',
  'German',
  'Canadian',
] as const;
export type AcademicSystem = (typeof ACADEMIC_SYSTEMS)[number];
