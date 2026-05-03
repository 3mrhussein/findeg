/**
 * School Services Factory
 */
import { container } from '@findeg/backend/features/core/infrastructure/di/ServiceContainer';

export function createSchoolServices() {
  return {
    schoolDirectory: container.schoolDirectoryService,
    schoolAccess: container.schoolAccessService,
    parentList: container.parentListService,
    schoolLists: container.schoolListService,
  };
}
