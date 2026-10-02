/**
 * School Services Factory
 */
import { SchoolDirectoryService } from './SchoolDirectoryService';
import { ParentListService } from './ParentListService';
import type { ISchoolDirectoryService } from '../interfaces/ISchoolDirectoryService';
import type { IParentListService } from '../interfaces/IParentListService';
import { createSchoolListService, type ISchoolListService } from '@findeg/backend/features/catalog';

export function createSchoolServices(): {
  schoolDirectory: ISchoolDirectoryService;
  parentList: IParentListService;
  schoolLists: ISchoolListService;
} {
  const schoolLists = createSchoolListService();
  const schoolDirectory = new SchoolDirectoryService();
  const parentList = new ParentListService(schoolDirectory);

  return {
    schoolDirectory,
    parentList,
    schoolLists,
  };
}
