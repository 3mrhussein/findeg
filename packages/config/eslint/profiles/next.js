import { compose, cypressGlobals } from './compose.js';

// Next.js applications (dashboard, storefront).
export const next = compose('next', { client: true, extra: [cypressGlobals] });
