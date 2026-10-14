import type { InlineConfig } from 'vitest/node';
export const activeWorkspaces: string[];
export const testInclude: string[];
export const helperExclude: string[];
export const coverageInclude: string[];
export const coverageExclude: string[];
export const thresholds: {
  perFile: boolean;
  lines: number;
  statements: number;
  functions: number;
  branches: number;
};
export function sharedTest(options?: {
  root?: string;
  enabled?: boolean;
  library?: boolean;
}): InlineConfig;
