import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

async function readSource(relativePath) {
  return readFile(join(root, relativePath), 'utf8');
}

test('partner access adapters stay server-only and delegate to runtime operations', async () => {
  const partnerApi = await readSource('frontend/web/src/server/partner-api.ts');

  assert.match(partnerApi, /import 'server-only';/);
  assert.doesNotMatch(partnerApi, /@findeg\/db|drizzle-orm|postgres|pg\b/);
  assert.doesNotMatch(partnerApi, /createPartnerManagement|createIdentityAccess|bindPartnerStore/);
  assert.match(partnerApi, /getWebRuntime\(\)\.partners/);
  assert.match(partnerApi, /accessOverview\(|invite\(|revokeInvitation\(|updateMembership\(/);
});

test('session helpers keep browser session handling server-only and runtime-backed', async () => {
  const session = await readSource('frontend/web/src/server/session.ts');

  assert.match(session, /import 'server-only';/);
  assert.doesNotMatch(session, /@findeg\/db|drizzle-orm|postgres|pg\b/);
  assert.match(
    session,
    /getWebRuntime\(\)\.currentSession|getWebRuntime\(\)\.signIn|getWebRuntime\(\)\.signOut/,
  );
  assert.match(session, /sessionCookie|sameOrigin\(|errorResponse\(/);
});
