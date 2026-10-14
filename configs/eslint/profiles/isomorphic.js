import { compose } from './compose.js';

// Leaf packages shared by server and browser bundles (money, domain-errors).
export const isomorphic = compose('isomorphic');

// Migration owners activate the complete target through the existing lint seam.
if (process.env.FINDEG_ESLINT_STANDARDS === '1') {
  const { standards } = await import('../standards.js');
  isomorphic.push(...(await standards('isomorphic')));
}
