// PR title format, its commit override and its suggestion. Run with `node --test .github/scripts`.

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  decidePrTitle,
  decidePrTitleSuggestion,
  issueNumberFromBranch,
  prOpenUrl,
} from './pr-title.mjs';

describe('decidePrTitleSuggestion', () => {
  it('builds the title from the branch slug', () => {
    const plan = decidePrTitleSuggestion({ head: 'feat/add-dispatch-button' });
    assert.equal(plan.title, 'Feature | Add dispatch button');
    assert.match(
      plan.body,
      /BEGIN_COMMIT_OVERRIDE\nfeat: add dispatch button\nEND_COMMIT_OVERRIDE/,
    );
  });

  it('adds the issue number a branch names and prefers the issue title', () => {
    const plan = decidePrTitleSuggestion({
      head: 'ci/122-dispatch-button',
      issueTitle: 'Add dispatch button',
    });
    assert.equal(plan.title, 'CI | #122 | Add dispatch button');
    assert.equal(issueNumberFromBranch('ci/122-dispatch-button'), 122);
    assert.equal(issueNumberFromBranch('ci/dispatch-button'), undefined);
  });

  it('falls back to the commit subject, without its conventional prefix', () => {
    const plan = decidePrTitleSuggestion({
      head: 'docs/notes',
      commitSubject: 'docs(ci): explain the cache tiers',
    });
    assert.equal(plan.title, 'Doc | Explain the cache tiers');
  });

  it('maps hotfix branches to a Fix commit', () => {
    const plan = decidePrTitleSuggestion({ head: 'hotfix/stop-crash' });
    assert.equal(plan.title, 'Hotfix | Stop crash');
    assert.match(plan.body, /\nfix: stop crash\n/);
  });

  it('keeps the body and does not add a second override', () => {
    const first = decidePrTitleSuggestion({ head: 'feat/a-b', body: '## Description\nHi' });
    assert.match(first.body, /^## Description\nHi\n\n<!--/);
    assert.equal(decidePrTitleSuggestion({ head: 'feat/a-b', body: first.body }).body, first.body);
  });

  it('replaces an existing override that does not fit the new title', () => {
    const body = 'Hi\n<!--\nBEGIN_COMMIT_OVERRIDE\ndocs: old words\nEND_COMMIT_OVERRIDE\n-->';
    const plan = decidePrTitleSuggestion({ head: 'feat/add-x', body });
    assert.equal(
      plan.body,
      'Hi\n<!--\nBEGIN_COMMIT_OVERRIDE\nfeat: add x\nEND_COMMIT_OVERRIDE\n-->',
    );
    assert.equal(decidePrTitle(plan).ok, true);
  });

  it('keeps an existing override that fits the new title', () => {
    const body = '<!--\nBEGIN_COMMIT_OVERRIDE\nfeat(ci)!: add x\nEND_COMMIT_OVERRIDE\n-->';
    assert.equal(decidePrTitleSuggestion({ head: 'feat/add-x', body }).body, body);
  });

  it('keeps a pipe title the PR was opened with and builds the override from it', () => {
    const plan = decidePrTitleSuggestion({
      head: 'feat/add-x',
      currentTitle: 'Feature | #9 | Add the big X',
    });
    assert.equal(plan.title, 'Feature | #9 | Add the big X');
    assert.match(plan.body, /\nfeat: add the big X\n/);
    assert.equal(decidePrTitle(plan).ok, true);
  });

  it('replaces a title that is not in the pipe format', () => {
    const plan = decidePrTitleSuggestion({ head: 'feat/add-x', currentTitle: 'Feat/add x' });
    assert.equal(plan.title, 'Feature | Add x');
  });

  it('refuses branches without a type and slug', () => {
    assert.equal(decidePrTitleSuggestion({ head: 'develop' }).ok, false);
    assert.equal(decidePrTitleSuggestion({ head: 'dependabot/npm/x' }).ok, false);
  });
});

describe('decidePrTitle', () => {
  const body = '<!--\nBEGIN_COMMIT_OVERRIDE\nfeat: add dispatch button\nEND_COMMIT_OVERRIDE\n-->';

  it('accepts the pipe format with a matching override', () => {
    assert.equal(decidePrTitle({ title: 'Feature | #122 | Add dispatch button', body }).ok, true);
    assert.equal(decidePrTitle({ title: 'Feature | Add dispatch button', body }).ok, true);
  });

  it('rejects a pipe title without a matching override', () => {
    assert.equal(decidePrTitle({ title: 'Feature | Add dispatch button' }).ok, false);
    assert.equal(decidePrTitle({ title: 'Fix | Add dispatch button', body }).ok, false);
    assert.equal(
      decidePrTitle({ title: 'Feature | Add dispatch button', base: 'develop' }).ok,
      false,
    );
  });

  it('needs no override on a PR into main, which merges with a merge commit', () => {
    assert.equal(decidePrTitle({ title: 'CI | Fix pipeline issues', base: 'main' }).ok, true);
    assert.equal(decidePrTitle({ title: 'not a valid title', base: 'main' }).ok, false);
  });

  it('rejects an override whose subject no longer matches the title', () => {
    assert.equal(decidePrTitle({ title: 'Feature | Remove dispatch button', body }).ok, false);
  });

  it('accepts a scoped or breaking override, and CRLF bodies', () => {
    const scoped = body.replace('feat:', 'feat(ci)!:').replaceAll('\n', '\r\n');
    assert.equal(decidePrTitle({ title: 'Feature | Add dispatch button', body: scoped }).ok, true);
  });

  it('accepts plain Conventional Commits for tooling PRs', () => {
    assert.equal(decidePrTitle({ title: 'chore(deps): bump x' }).ok, true);
    assert.equal(decidePrTitle({ title: 'Add dispatch button' }).ok, false);
  });
});

describe('prOpenUrl', () => {
  it('links to the new-PR form into develop with the title filled in', () => {
    assert.equal(
      prOpenUrl({
        repoUrl: 'git@github.com:acme/shop.git',
        head: 'feat/122-add-x',
        title: 'Feature | #122 | Add x',
      }),
      'https://github.com/acme/shop/compare/develop...feat/122-add-x?quick_pull=1&title=Feature%20%7C%20%23122%20%7C%20Add%20x',
    );
  });

  it('turns ssh:// remotes into https links', () => {
    const url = prOpenUrl({
      repoUrl: 'ssh://git@github.com:22/acme/shop.git',
      head: 'feat/x',
      title: 'T',
    });
    assert.match(url, /^https:\/\/github\.com\/acme\/shop\/compare\//);
  });

  it('sends hotfixes to main', () => {
    const url = prOpenUrl({
      repoUrl: 'https://github.com/acme/shop',
      head: 'hotfix/x',
      title: 'T',
    });
    assert.match(url, /\/compare\/main\.\.\.hotfix\/x\?/);
  });
});
