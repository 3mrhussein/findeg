import { compose } from './compose.js';

// Leaf packages shared by server and browser bundles (money, domain-errors).
export const isomorphic = compose('isomorphic');
