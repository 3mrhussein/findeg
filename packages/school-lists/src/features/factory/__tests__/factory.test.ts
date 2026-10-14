import { describe, expect, it } from 'vitest';
import {
  createSchoolDirectory,
  createSchoolSupplyListReader,
  createSchoolSupplyListService,
} from '../index';

describe('school list factories', () => {
  it('build services over an injected database without opening a connection', () => {
    const db = {} as never;
    expect(createSchoolSupplyListService({ db })).toBeDefined();
    expect(createSchoolSupplyListReader({ db })).toBeDefined();
    expect(createSchoolDirectory({ db })).toBeDefined();
  });
});
