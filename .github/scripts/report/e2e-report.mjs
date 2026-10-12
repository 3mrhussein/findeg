// E2E reporting decisions are pure. Only readEvidenceDir performs file I/O.
import { stripVTControlCharacters } from 'node:util';
import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';

function cleanText(text) {
  return stripVTControlCharacters(typeof text === 'string' ? text : '').replace(/\r\n?/g, '\n');
}

function nonnegativeInteger(value, fallback) {
  return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : fallback;
}

/** Last logical lines; a terminal newline is a delimiter, not an extra line. */
export function trimLog(text, maxLines = 50) {
  const cleaned = cleanText(text);
  if (!cleaned) return '';
  const lines = cleaned.replace(/\n$/, '').split('\n');
  const limit = nonnegativeInteger(maxLines, 50);
  const omitted = Math.max(0, lines.length - limit);
  return [...(omitted ? [`… ${omitted} earlier lines omitted`] : []), ...lines.slice(omitted)].join(
    '\n',
  );
}

// Cypress prints both short spec names and paths, depending on the output section.
function specPaths(line) {
  return line.match(/(?:[\w@.+-]+[/\\])*[\w@.+-]+\.(?:(?:cy|spec)\.[cm]?[jt]sx?|feature)\b/g) || [];
}

/** Best-effort parsing: unrecognized or non-string logs yield empty results. */
export function parseE2eOutput(text) {
  const lines = cleanText(text).split('\n');
  const failedSuites = new Set();
  const failedSpecs = new Set();
  let summary = false;
  let failureExit = false;
  for (const [index, line] of lines.entries()) {
    const nonzeroExit =
      /(?:exited\s*\(?|exit(?:ed)?\s+(?:with\s+)?code\s*[:=]?\s*)[1-9]\d*\)?/i.test(line);
    failureExit ||= nonzeroExit || /(?:ERROR\s+run failed|ELIFECYCLE.*failed)/i.test(line);
    summary ||=
      /\(Run Finished\)|\bSpec\b.*\bTests\b.*\bPassing\b.*\bFailing\b|All specs passed!|\d+ of \d+ failed/i.test(
        line,
      );
    const task = line.match(/((?:@[\w.-]+\/)?[\w.-]+):test:e2e:/);
    if (task && (/\bERROR\b/.test(line) || nonzeroExit)) failedSuites.add(task[1]);
    if (/^\s*Failed\s*:/i.test(line)) {
      for (const match of line.matchAll(/((?:@[\w.-]+\/)?[\w.-]+)#test:e2e\b/g))
        failedSuites.add(match[1]);
    }

    const content = line.replace(/^.*?:test:e2e:\s*/, '');
    const specs = specPaths(content);
    const failureRow = /^\s*[✖✘×✗xX]\s/.test(content);
    const numberedSpec = /^\s*\d+\)\s/.test(content);
    const explicitFailure = /\bfailing\b|\bfailed\b/i.test(content);
    // Nearby failure counts help identify paths outside the summary table. Never
    // apply that heuristic to passed rows or Cypress's "Running:" announcements.
    const nearbyFailure =
      !/[✔✓√]|\bRunning\s*:/i.test(content) &&
      lines
        .slice(Math.max(0, index - 2), index + 3)
        .some(
          (nearby) =>
            /\bfailing\b/i.test(nearby) && !/\bSpec\b.*\bPassing\b.*\bFailing\b/i.test(nearby),
        );
    if (failureRow || numberedSpec || explicitFailure || nearbyFailure) {
      for (const spec of specs) failedSpecs.add(spec);
    }
  }
  return {
    failedSuites: [...failedSuites],
    failedSpecs: [...failedSpecs],
    crashed: !summary && failureExit,
  };
}

/** Newest per spec first, followed by newest extras; input is never reordered. */
export function selectScreenshots(files, cap = 3) {
  const sorted = [...files].sort((a, b) => b.mtimeMs - a.mtimeMs || a.path.localeCompare(b.path));
  const seen = new Set();
  const distinct = [];
  const extras = [];
  for (const file of sorted) {
    if (seen.has(file.spec)) extras.push(file);
    else {
      seen.add(file.spec);
      distinct.push(file);
    }
  }
  const shown = [...distinct, ...extras].slice(0, nonnegativeInteger(cap, 3));
  return { shown, more: files.length - shown.length };
}

export function screenshotTokens(selection, urlFor) {
  const tokens = {};
  const linked = selection.shown.map((file) => ({ file, url: urlFor(file) }));
  for (let slot = 1; slot <= 3; slot++) {
    tokens[`SCREENSHOT_URL_${slot}`] = linked[slot - 1]?.url || '';
    tokens[`SCREENSHOT_SPEC_${slot}`] = linked[slot - 1]?.file.spec || '';
  }
  tokens.SCREENSHOT_MORE = selection.more
    ? `…and ${selection.more} more in the evidence artifact`
    : '';
  tokens.SCREENSHOT_LIST = linked.length
    ? linked
        .map(
          ({ file, url }) =>
            `- ${file.spec}: [${basename(file.path.replaceAll('\\', '/'))}](${url})`,
        )
        .join('\n')
    : '_No screenshots were produced._';
  return tokens;
}

export function decideScreenshotMode({ mode, canWrite }) {
  if (mode === 'pages' && canWrite === true)
    return { mode: 'pages', reason: 'Pages mode requested and write permission is available.' };
  return {
    mode: 'link',
    reason:
      mode === 'pages'
        ? 'Pages needs write permission; using artifact links.'
        : 'Using artifact links (Pages mode was not requested).',
  };
}

/** Strictly older than retention; protect the newest commit (largest name on ties). */
export function planPrune(folders, nowMs, retentionDays = 14) {
  const newest = [...folders].sort(
    (a, b) =>
      b.committedMs - a.committedMs || b.name.localeCompare(a.name, 'en', { numeric: true }),
  )[0];
  const cutoff = nowMs - retentionDays * 86400000;
  return folders
    .filter((folder) => folder !== newest && folder.committedMs < cutoff)
    .map((folder) => folder.name);
}

/** Returns { tokens, status } for the shared report renderer. */
export function buildE2eTokens({
  outcome,
  outputText = '',
  storefrontLog = '',
  dashboardLog = '',
  evidenceFiles = [],
  maxLogLines = 50,
  screenshotCap = 3,
  urlFor = (file) => file.path,
  artifactName = 'e2e-evidence',
}) {
  const parsed = parseE2eOutput(outputText);
  const screenshots = evidenceFiles.filter((file) => /\.(?:png|jpe?g|webp)$/i.test(file.path));
  const recognizedFailure =
    parsed.crashed || parsed.failedSuites.length > 0 || parsed.failedSpecs.length > 0;
  const status =
    outcome === 'success'
      ? 'success'
      : outcome === 'failure' && recognizedFailure
        ? 'failure'
        : 'warning';
  const evidenceStatus = evidenceFiles.length
    ? `Evidence artifact \`${artifactName}\` uploaded (${evidenceFiles.length} files)`
    : parsed.crashed
      ? '⚠️ No artifacts found: the run crashed before writing any evidence'
      : 'No evidence artifacts were produced.';
  return {
    status,
    tokens: {
      FAILED_SPECS: parsed.failedSpecs.length
        ? parsed.failedSpecs.map((spec) => `- ${spec}`).join('\n')
        : '_None_',
      LOG_EXCERPT_STOREFRONT: trimLog(storefrontLog, maxLogLines),
      LOG_EXCERPT_DASHBOARD: trimLog(dashboardLog, maxLogLines),
      EVIDENCE_STATUS: evidenceStatus,
      ...screenshotTokens(selectScreenshots(screenshots, screenshotCap), urlFor),
    },
  };
}

/** Recursively list evidence files, without following symlinks; missing dirs are empty.
 * Paths are relative to dir; spec is inferred from Cypress's spec-name directory.
 * All evidence is returned, so callers can count videos/logs as well as screenshots.
 */
export async function readEvidenceDir(dir) {
  const { readdir, stat } = await import('node:fs/promises');
  const root = dir instanceof URL ? fileURLToPath(dir) : dir;
  const files = [];
  async function walk(relative) {
    let entries;
    try {
      entries = await readdir(join(root, relative), { withFileTypes: true });
    } catch (error) {
      if (error.code === 'ENOENT') return;
      throw error;
    }
    for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
      const path = join(relative, entry.name);
      if (entry.isDirectory()) await walk(path);
      else if (entry.isFile()) {
        const { mtimeMs } = await stat(join(root, path));
        files.push({ path, spec: specPaths(path)[0] || '', mtimeMs });
      }
    }
  }
  await walk('');
  return files;
}
