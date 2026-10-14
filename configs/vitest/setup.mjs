import path from 'node:path';
import { coverageInclude, coverageExclude, thresholds } from './policy.mjs';

export default function setup(project) {
  const { enabled } = project.config.provide.findegPolicy;
  if (enabled) {
    // Vitest appends discovery, setup and its own virtual/config exclusions.
    const runnerExclusions = new Set([
      ...project.config.include,
      ...project.config.setupFiles.map((file) =>
        path.relative(project.config.root, file).replaceAll(path.sep, '/'),
      ),
      '**/virtual:*',
      '**/__x00__*',
      '**/node_modules/**',
    ]);
    const coverage = project.vitest.config.coverage;
    if (
      !coverage.enabled ||
      !coverage.thresholds.perFile ||
      JSON.stringify(coverage.include) !== JSON.stringify(coverageInclude) ||
      JSON.stringify(coverage.exclude.slice(0, coverageExclude.length)) !==
        JSON.stringify(coverageExclude) ||
      coverage.exclude
        .slice(coverageExclude.length)
        .some(
          (pattern) =>
            !runnerExclusions.has(pattern) &&
            !/(?:^|\/)(?:vite|vitest)\.config\.[cm]?[jt]s$/.test(pattern),
        ) ||
      Object.entries(thresholds).some(([key, value]) => coverage.thresholds[key] !== value)
    )
      throw new Error(
        'FindEg enforcing test requires enabled 80% per-file coverage for all four metrics',
      );
  }
}
