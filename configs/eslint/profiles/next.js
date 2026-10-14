import { compose, cypressGlobals } from './compose.js';

export const next = await compose('next', { extra: [cypressGlobals] });
