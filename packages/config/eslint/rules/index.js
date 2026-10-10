import { SCHEMA_EXPORT_NAMES_BY_FEATURE } from '../registry.js';
import { declaredWorkspaceDependenciesRule } from './declared-workspace-dependencies.js';
import { createNoFullBarrelImportInClientComponentsRule } from './no-full-barrel-import-in-client-components.js';
import { noSuppressionCommentsRule } from './no-suppression-comments.js';
import { ordersBoundaryRule } from './orders-boundary.js';
import { requiredPackageScriptsRule } from './required-package-scripts.js';
import { runtimeImportsRule } from './runtime-imports.js';

// The one `local` plugin every layer registers. Flat config rejects two different objects
// under the same plugin name, so layers must share this instance rather than build their own.
export const local = {
  rules: {
    'declared-workspace-dependencies': declaredWorkspaceDependenciesRule,
    'no-full-barrel-import-in-client-components': createNoFullBarrelImportInClientComponentsRule(
      SCHEMA_EXPORT_NAMES_BY_FEATURE,
    ),
    'no-suppression-comments': noSuppressionCommentsRule,
    'orders-boundary': ordersBoundaryRule,
    'required-package-scripts': requiredPackageScriptsRule,
    'runtime-imports': runtimeImportsRule,
  },
};
