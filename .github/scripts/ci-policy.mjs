// The CI rules, one import for every caller: ci-cli.mjs (workflows), validate-branch-name.mjs
// (the pre-push hook) and the tests. Each rule lives in its own pure module under policy/:
//
//   policy/config.mjs      the data: branch names, path groups, tier patterns
//   policy/branches.mjs    branch naming and which branches may target main
//   policy/plan.mjs        the tier and job plan for one CI run
//   policy/verdict.mjs     the `CI / Gate` verdict from every job's result
//   policy/pr-title.mjs    the PR title format and its commit override
//   policy/promotion.mjs   when the Promote to main button may open the release PR
//
// No module here reads files, the environment or the network; callers pass plain inputs.

export * from './policy/branches.mjs';
export * from './policy/plan.mjs';
export * from './policy/verdict.mjs';
export * from './policy/pr-title.mjs';
export * from './policy/promotion.mjs';
