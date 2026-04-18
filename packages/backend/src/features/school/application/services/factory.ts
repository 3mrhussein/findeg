/**
 * School Services Factory
 */
import { container } from "@features/core/infrastructure/di/ServiceContainer";
import type { ISchoolDirectoryService } from "../interfaces/ISchoolDirectoryService";
import type { ISchoolAccessService } from "../interfaces/ISchoolAccessService";
import type { IParentListService } from "../interfaces/IParentListService";

export function createSchoolServices() {
  return {
    schoolDirectory: container.schoolDirectoryService,
    schoolAccess: container.schoolAccessService,
    parentList: container.parentListService,
    schoolLists: container.schoolListService,
  };
}
