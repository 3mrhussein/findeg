import { isomorphic } from '@findeg/config/eslint/isomorphic';
import { libraryLayout } from '@findeg/config/eslint/library';
import { libraryScopes } from '@findeg/config/library-scopes';

export default [
  ...isomorphic,
  ...libraryLayout(libraryScopes['packages/domain'], { root: import.meta.dirname }),
];
