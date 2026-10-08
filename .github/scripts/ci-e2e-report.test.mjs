import test from 'node:test';
import assert from 'node:assert/strict';
import {
  trimLog,
  parseE2eOutput,
  selectScreenshots,
  screenshotTokens,
  decideScreenshotMode,
  planPrune,
  buildE2eTokens,
  readEvidenceDir,
} from './ci-e2e-report.mjs';

const passed = `@findeg/storefront:test:e2e: (Run Finished)
@findeg/storefront:test:e2e:       Spec                         Tests  Passing  Failing  Pending  Skipped
@findeg/storefront:test:e2e:   ✔  checkout.cy.ts                 00:02   4   4   -   -   -
@findeg/storefront:test:e2e:   All specs passed!                 00:02   4   4   -   -   -
 Tasks: 2 successful, 2 total`;
const failed = `@findeg/storefront:test:e2e: (Run Finished)
@findeg/storefront:test:e2e:       Spec                         Tests  Passing  Failing  Pending  Skipped
@findeg/storefront:test:e2e:   ✖  cypress/e2e/checkout.cy.ts     00:02   4   3   1   -   -
@findeg/storefront:test:e2e:   ✔  cypress/e2e/login.cy.ts        00:01   2   2   -   -   -
@findeg/storefront:test:e2e:   1 of 2 failed (50%)               00:03   6   5   1   -   -
@findeg/storefront:test:e2e: ERROR: command finished with error: command (/repo/frontend/storefront) pnpm run test:e2e exited (1)
@findeg/dashboard:test:e2e: (Run Finished)
@findeg/dashboard:test:e2e:   ×  users.cy.ts                    00:01   1   -   1   -   -
@findeg/dashboard:test:e2e: command (/repo/frontend/dashboard) pnpm run test:e2e exited (1)
 Failed: @findeg/storefront#test:e2e, @findeg/dashboard#test:e2e
 ERROR run failed: command exited (1)`;
const crashed = `@findeg/storefront:test:e2e: DevTools listening on ws://127.0.0.1:9222
@findeg/storefront:test:e2e: Cypress failed to start: missing X server
@findeg/storefront:test:e2e: ERROR: command finished with error: command (/repo/frontend/storefront) pnpm run test:e2e exited (1)
 ERROR run failed: command exited (1)`;
const screenshots = [
  { path: 'checkout.cy.ts/old.png', spec: 'checkout.cy.ts', mtimeMs: 10 },
  { path: 'checkout.cy.ts/new.png', spec: 'checkout.cy.ts', mtimeMs: 50 },
  { path: 'checkout.cy.ts/extra.png', spec: 'checkout.cy.ts', mtimeMs: 40 },
  { path: 'users.cy.ts/users.png', spec: 'users.cy.ts', mtimeMs: 20 },
];
const urlFor = (file) => `https://example.test/${file.path}`;

test('trimLog strips ANSI, normalizes CRLF and does not count the terminal newline', () => {
  assert.equal(
    trimLog('\u001b[31mone\u001b[0m\r\ntwo\r\nthree\r\n', 2),
    '… 1 earlier lines omitted\ntwo\nthree',
  );
  assert.equal(trimLog(''), '');
  assert.equal(trimLog(null), '');
  assert.equal(trimLog('one\n\ntwo'), 'one\n\ntwo');
  assert.equal(trimLog('\u001b]8;;https://example.test\u0007link\u001b]8;;\u0007'), 'link');
  assert.equal(trimLog('one\ntwo', 0), '… 2 earlier lines omitted');
  assert.equal(
    trimLog(Array.from({ length: 51 }, (_, i) => `line ${i + 1}`).join('\n')).split('\n').length,
    51,
  );
});

test('passed Cypress output has no failures or crash', () => {
  assert.deepEqual(parseE2eOutput(passed), { failedSuites: [], failedSpecs: [], crashed: false });
});

test('failed run finds distinct failed packages and specs, ignoring passed rows', () => {
  assert.deepEqual(parseE2eOutput(`\u001b[31m${failed}\u001b[0m`), {
    failedSuites: ['@findeg/storefront', '@findeg/dashboard'],
    failedSpecs: ['cypress/e2e/checkout.cy.ts', 'users.cy.ts'],
    crashed: false,
  });
});

test('crash before Cypress summary is distinguished from ordinary failures', () => {
  assert.deepEqual(parseE2eOutput(crashed), {
    failedSuites: ['@findeg/storefront'],
    failedSpecs: [],
    crashed: true,
  });
  assert.equal(parseE2eOutput('ELIFECYCLE Command failed with exit code 2.').crashed, true);
  assert.equal(parseE2eOutput('command exited (0)').crashed, false);
});

test('parser tolerates alternate failure formats, nearby paths and malformed input', () => {
  assert.deepEqual(
    parseE2eOutput(
      'Spec cypress/e2e/cart.cy.ts Failing\n  1) orders.cy.ts\n  2 failing\n  cypress/e2e/orders.cy.ts',
    ).failedSpecs,
    ['cypress/e2e/cart.cy.ts', 'orders.cy.ts', 'cypress/e2e/orders.cy.ts'],
  );
  for (const input of [undefined, null, 42, {}, ['unknown'], 'noise']) {
    assert.deepEqual(parseE2eOutput(input), { failedSuites: [], failedSpecs: [], crashed: false });
  }
  assert.deepEqual(
    parseE2eOutput('Failed: @findeg/dashboard#test:e2e\ncommand exited (1)').failedSuites,
    ['@findeg/dashboard'],
  );
});

test('screenshots prioritize newest distinct specs before newest extras without mutation', () => {
  const original = structuredClone(screenshots);
  assert.deepEqual(selectScreenshots(screenshots), {
    shown: [screenshots[1], screenshots[3], screenshots[2]],
    more: 1,
  });
  assert.deepEqual(screenshots, original);
  assert.deepEqual(selectScreenshots(screenshots, 1), { shown: [screenshots[1]], more: 3 });
  assert.deepEqual(selectScreenshots(screenshots, 0), { shown: [], more: 4 });
  assert.deepEqual(selectScreenshots([], 3), { shown: [], more: 0 });
  assert.equal(selectScreenshots(screenshots, 10).shown.length, 4);
});

test('nearby failing text identifies paths without treating passed rows or Running announcements as failures', () => {
  const output = `Failing tests in the following spec:
cypress/e2e/search.cy.ts
Running: cypress/e2e/login.cy.ts
  1 failing
  ✔ cypress/e2e/account.cy.ts 00:01 1 1 - - -`;
  assert.deepEqual(parseE2eOutput(output).failedSpecs, ['cypress/e2e/search.cy.ts']);
  assert.deepEqual(parseE2eOutput('Failing tests in:\ncypress/e2e/search.cy.ts').failedSpecs, [
    'cypress/e2e/search.cy.ts',
  ]);
  assert.deepEqual(
    parseE2eOutput(
      'Running: cypress/e2e/login.cy.ts\nSpec Tests Passing Failing\n✔ login.cy.ts 1 1 - - -',
    ).failedSpecs,
    [],
  );
});

test('screenshot tokens fill all three slots and describe remaining evidence', () => {
  const tokens = screenshotTokens(selectScreenshots(screenshots), urlFor);
  assert.equal(tokens.SCREENSHOT_URL_1, 'https://example.test/checkout.cy.ts/new.png');
  assert.equal(tokens.SCREENSHOT_SPEC_2, 'users.cy.ts');
  assert.equal(tokens.SCREENSHOT_MORE, '…and 1 more in the evidence artifact');
  assert.equal(
    tokens.SCREENSHOT_LIST,
    '- checkout.cy.ts: [new.png](https://example.test/checkout.cy.ts/new.png)\n- users.cy.ts: [users.png](https://example.test/users.cy.ts/users.png)\n- checkout.cy.ts: [extra.png](https://example.test/checkout.cy.ts/extra.png)',
  );
  const empty = screenshotTokens({ shown: [], more: 0 }, urlFor);
  for (const slot of [1, 2, 3]) {
    assert.equal(empty[`SCREENSHOT_URL_${slot}`], '');
    assert.equal(empty[`SCREENSHOT_SPEC_${slot}`], '');
  }
  assert.equal(empty.SCREENSHOT_MORE, '');
  assert.equal(empty.SCREENSHOT_LIST, '_No screenshots were produced._');
});

test('pages requires both opt-in and write permission, with an explanatory reason', () => {
  for (const [mode, canWrite, expected] of [
    ['pages', true, 'pages'],
    ['pages', false, 'link'],
    ['link', true, 'link'],
    ['unknown', true, 'link'],
    ['pages', 'true', 'link'],
  ]) {
    const decision = decideScreenshotMode({ mode, canWrite });
    assert.equal(decision.mode, expected);
    assert.ok(decision.reason.length > 0);
  }
});

test('pruning uses strict age cutoff and preserves newest even when all are old', () => {
  const day = 86400000;
  const folders = [
    { name: '100', committedMs: 0 },
    { name: '101', committedMs: day },
    { name: '102', committedMs: 2 * day },
  ];
  assert.deepEqual(planPrune(folders, 15 * day), ['100']);
  assert.deepEqual(planPrune(folders, 30 * day), ['100', '101']);
  assert.deepEqual(planPrune([folders[0]], 30 * day), []);
  assert.deepEqual(planPrune([], 30 * day), []);
  assert.deepEqual(planPrune(folders, 3 * day, 1), ['100', '101']);
  assert.deepEqual(
    planPrune(
      [
        { name: '1', committedMs: 0 },
        { name: '2', committedMs: 0 },
      ],
      30 * day,
    ),
    ['1'],
  );
});

test('builder combines failed specs, trimmed logs and screenshot-only selection with total evidence count', () => {
  const result = buildE2eTokens({
    outcome: 'failure',
    outputText: failed,
    storefrontLog: 'one\ntwo\nthree',
    dashboardLog: '\u001b[31merror\u001b[0m',
    evidenceFiles: [
      ...screenshots,
      { path: 'videos/checkout.cy.ts.mp4', mtimeMs: 60 },
      { path: 'logs/startup.log', mtimeMs: 70 },
    ],
    maxLogLines: 2,
    screenshotCap: 1,
    urlFor,
    artifactName: 'e2e-evidence',
  });
  assert.equal(result.status, 'failure');
  assert.equal(result.tokens.FAILED_SPECS, '- cypress/e2e/checkout.cy.ts\n- users.cy.ts');
  assert.equal(result.tokens.LOG_EXCERPT_STOREFRONT, '… 1 earlier lines omitted\ntwo\nthree');
  assert.equal(result.tokens.LOG_EXCERPT_DASHBOARD, 'error');
  assert.equal(
    result.tokens.EVIDENCE_STATUS,
    'Evidence artifact `e2e-evidence` uploaded (6 files)',
  );
  assert.equal(result.tokens.SCREENSHOT_MORE, '…and 3 more in the evidence artifact');
});

test('builder distinguishes crash, unparseable failure, success and skipped/cancelled outcomes', () => {
  const crash = buildE2eTokens({ outcome: 'failure', outputText: crashed });
  assert.equal(crash.status, 'failure');
  assert.equal(
    crash.tokens.EVIDENCE_STATUS,
    '⚠️ No artifacts found: the run crashed before writing any evidence',
  );
  assert.equal(crash.tokens.FAILED_SPECS, '_None_');
  assert.equal(
    buildE2eTokens({ outcome: 'failure', outputText: 'unknown problem' }).status,
    'warning',
  );
  const success = buildE2eTokens({ outcome: 'success', outputText: passed });
  assert.equal(success.status, 'success');
  assert.equal(success.tokens.EVIDENCE_STATUS, 'No evidence artifacts were produced.');
  assert.equal(success.tokens.SCREENSHOT_LIST, '_No screenshots were produced._');
  for (const outcome of ['cancelled', 'skipped'])
    assert.equal(buildE2eTokens({ outcome }).status, 'warning');
});

test('evidence directory helper lists files and treats a missing directory as empty', async () => {
  const files = await readEvidenceDir(new URL('.', import.meta.url));
  assert.ok(
    files.some(
      (file) => file.path.endsWith('ci-e2e-report.test.mjs') && Number.isFinite(file.mtimeMs),
    ),
  );
  assert.ok(files.every((file) => typeof file.path === 'string' && typeof file.spec === 'string'));
  assert.deepEqual(
    await readEvidenceDir(new URL('./absent-e2e-evidence-dir/', import.meta.url)),
    [],
  );
});
