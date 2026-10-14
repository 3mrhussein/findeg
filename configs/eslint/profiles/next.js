import { compose, cypressGlobals } from './compose.js';

export const next = await compose('next', { client: true, extra: [cypressGlobals] });
