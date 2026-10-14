import { sharedTest } from './policy.mjs';

export const nodeTest = { ...sharedTest(), environment: 'node' as const };
export const browserTest = { ...sharedTest(), environment: 'jsdom' as const, globals: true };
