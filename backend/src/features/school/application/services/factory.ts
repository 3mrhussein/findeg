/**
 * School Services Factory
 */
import { SchoolDirectoryService } from './SchoolDirectoryService';
import { SchoolAccessService } from './SchoolAccessService';
import { ParentListService } from './ParentListService';
import { SchoolListService } from '@findeg/backend/features/catalog';

export function createSchoolServices() {
  const schoolLists = new SchoolListService();
  const schoolDirectory = new SchoolDirectoryService();
  const schoolAccess = new SchoolAccessService(schoolLists);
  const parentList = new ParentListService(schoolDirectory, schoolAccess);

  return {
    schoolDirectory,
    schoolAccess,
    parentList,
    schoolLists,
  };
}
