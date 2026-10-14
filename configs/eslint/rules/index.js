import { declaredWorkspaceDependenciesRule } from './declared-workspace-dependencies.js';
import { noSuppressionCommentsRule } from './no-suppression-comments.js';
import { ordersBoundaryRule } from './orders-boundary.js';
import { requiredPackageScriptsRule } from './required-package-scripts.js';
import { noDomainValueSetCopiesRule } from './no-domain-value-set-copies.js';

// The one `local` plugin every layer registers. Flat config rejects two different objects
// under the same plugin name, so layers must share this instance rather than build their own.
export const local = {
  rules: {
    'no-domain-value-set-copies': noDomainValueSetCopiesRule,
    'declared-workspace-dependencies': declaredWorkspaceDependenciesRule,
    'no-suppression-comments': noSuppressionCommentsRule,
    'orders-boundary': ordersBoundaryRule,
    'required-package-scripts': requiredPackageScriptsRule,
  },
};
