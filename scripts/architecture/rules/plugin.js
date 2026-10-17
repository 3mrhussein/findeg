import { declaredWorkspaceDependencies } from './declared-workspace-dependencies.js';
import { importSources } from './import-sources.js';
import { libraryLayout } from './library-layout.js';
import { naming } from './naming.js';
import { noDomainValueSetCopies } from './no-domain-value-set-copies.js';
import { noSuppressionComments } from './no-suppression-comments.js';
import { ordersBoundary } from './orders-boundary.js';
import { requiredPackageScripts } from './required-package-scripts.js';

export const architecturePlugin = {
  rules: {
    'declared-workspace-dependencies': declaredWorkspaceDependencies,
    'import-sources': importSources,
    'library-layout': libraryLayout,
    naming,
    'no-domain-value-set-copies': noDomainValueSetCopies,
    'no-suppression-comments': noSuppressionComments,
    'orders-boundary': ordersBoundary,
    'required-package-scripts': requiredPackageScripts,
  },
};
