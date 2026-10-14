import { compose } from './compose.js';

// Server-side packages and services (backend, db, env, orders).
export const node = compose('node');

// Migration owners activate the complete target through the existing lint seam.
if (process.env.FINDEG_ESLINT_STANDARDS === '1') {
  const { standards } = await import('../standards.js');
  node.push(...(await standards('node')));
}
