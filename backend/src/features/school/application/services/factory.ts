/**
 * School Services Factory
 */
import { SchoolDirectoryService } from './SchoolDirectoryService';
import { SchoolAccessService } from './SchoolAccessService';
import { ParentListService } from './ParentListService';
import type { ISchoolDirectoryService } from '../interfaces/ISchoolDirectoryService';
import type { ISchoolAccessService } from '../interfaces/ISchoolAccessService';
import type { IParentListService } from '../interfaces/IParentListService';
import { type ISchoolListService, SchoolListService } from '@findeg/backend/features/catalog';

export function createSchoolServices(): {
  schoolDirectory: ISchoolDirectoryService;
  schoolAccess: ISchoolAccessService;
  parentList: IParentListService;
  schoolLists: ISchoolListService;
} {
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
