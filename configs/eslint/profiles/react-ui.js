import { compose } from './compose.js';

// Browser component libraries (ui).
export const reactUi = compose('browser');

// Migration owners activate the complete target through the existing lint seam.
if (process.env.FINDEG_ESLINT_STANDARDS === '1') {
  const { standards } = await import('../standards.js');
  reactUi.push(...(await standards('browser')));
}
