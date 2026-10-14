import { node } from './eslint/profiles/node.js';

export default [...node, { ignores: ['env/**'] }];
