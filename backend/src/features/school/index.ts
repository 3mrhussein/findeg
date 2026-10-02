export type {
  AccessState,
  VerifyCodeResult,
  ISchoolAccessService,
} from './application/interfaces/ISchoolAccessService';
export type {
  SchoolFilterOptions,
  SchoolProfile,
  SchoolSearchResult,
  SchoolSearchParams,
  ISchoolDirectoryService,
} from './application/interfaces/ISchoolDirectoryService';
export type {
  SessionState,
  SessionSummary,
  SchoolListPageData,
  IParentListService,
} from './application/interfaces/IParentListService';
export { createSchoolServices } from './application/services/factory';
export { eligibleVariants } from './domain/eligibleVariants';
export type {
  EligibilityCandidate,
  EligibilityItem,
  ItemSpecification,
} from './domain/eligibleVariants';
