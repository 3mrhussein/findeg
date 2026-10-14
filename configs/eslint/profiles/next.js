import { compose, cypressGlobals } from './compose.js';

// Next.js applications (dashboard, storefront).
export const next = compose('next', { client: true, extra: [cypressGlobals] });

// Migration owners activate the complete target through the existing lint seam.
if (process.env.FINDEG_ESLINT_STANDARDS === '1') {
  const { standards } = await import('../standards.js');
  next.push(...(await standards('next')));
}
