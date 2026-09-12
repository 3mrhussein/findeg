import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { randomUUID } from 'node:crypto';
import { runMigrations } from '../db/dist/runtime/migrations.js';
import { createWebRuntime } from '../runtime/dist/index.js';

const require = createRequire(new URL('../db/package.json', import.meta.url));
const postgres = require('postgres');
const bcrypt = require('bcryptjs');

async function fixture(t) {
  const admin = postgres(process.env.MIGRATION_TEST_DATABASE_URL, { max: 1 });
  const name = `findeg_partner_${randomUUID().replaceAll('-', '')}`;
  const url = new URL(process.env.MIGRATION_TEST_DATABASE_URL);
  url.pathname = `/${name}`;
  await admin`CREATE DATABASE ${admin(name)}`;
  let database, web;
  t.after(async () => {
    await web?.close();
    await database?.end();
    await admin`DROP DATABASE ${admin(name)}`;
    await admin.end();
  });
  await runMigrations({ url: url.toString(), ssl: false });
  database = postgres(url.toString(), { max: 2 });
  web = createWebRuntime({ RELEASE_REVISION: 'a'.repeat(40), DATABASE_URL: url.toString() });
  async function user(email, verified = true, staff = false) {
    const [user] = await database`INSERT INTO identity.users(email, email_verified)
      VALUES (${email}, ${verified ? new Date() : null}) RETURNING id`;
    const hash = await bcrypt.hash('test-password-123', 4);
    await database`INSERT INTO identity.password_credentials(user_id, password_hash) VALUES (${user.id}, ${hash})`;
    if (staff)
      await database`INSERT INTO identity.staff_role_grants(user_id, role) VALUES (${user.id}, 'access-administrator')`;
    const login = await web.signIn(email, 'test-password-123');
    return { ...user, email, token: login.token };
  }
  return {
    web,
    database,
    user,
    environment: { RELEASE_REVISION: 'a'.repeat(40), DATABASE_URL: url.toString() },
  };
}

test('a verified invitee accepts once and enters only the invited Partner Workspace', async (t) => {
  const { web, user } = await fixture(t);
  const staff = await user('staff@example.test', true, true);
  const member = await user('member@example.test');
  const created = await web.partners.createPartner(staff.token, {
    code: 'school-a',
    nameEn: 'School A',
    nameAr: 'المدرسة أ',
  });
  assert.equal(created.status, 'created');
  const partnerId = created.partner.id;
  const invitation = await web.partners.invite(staff.token, 'back-office', partnerId, {
    email: ' MEMBER@example.test ',
    roles: ['partner-administrator'],
  });
  assert.equal(invitation.status, 'invited');
  const accepted = await web.partners.acceptInvitation(member.token, invitation.token);
  assert.equal(accepted.status, 'accepted');
  assert.equal(
    (await web.partners.acceptInvitation(member.token, invitation.token)).status,
    'invitation-unavailable',
  );
  assert.equal(
    (await web.currentSession(member.token, 'partner', partnerId)).status,
    'authorization-denied',
  );
  assert.equal(
    (await web.partners.changePartnerStatus(staff.token, partnerId, 'active')).status,
    'updated',
  );
  const selected = await web.currentSession(member.token, 'partner', partnerId);
  assert.equal(selected.status, 'authenticated');
  assert.equal(selected.session.activePortal, 'partner');
  assert.equal(selected.session.partner.businessPartnerId, partnerId);
  assert.deepEqual(selected.session.partner.roles, ['partner-administrator']);
  assert.deepEqual(selected.session.staffRoles, []);
  assert.equal(
    (await web.currentSession(member.token, 'back-office')).status,
    'authorization-denied',
  );
  assert.equal(
    (await web.currentSession(staff.token, 'partner', partnerId)).status,
    'authorization-denied',
  );
});

async function activePartner(web, staff, administrator, code) {
  const { partner } = await web.partners.createPartner(staff.token, {
    code,
    nameEn: code,
    nameAr: 'مدرسة',
  });
  const invitation = await web.partners.invite(staff.token, 'back-office', partner.id, {
    email: administrator.email,
    roles: ['partner-administrator'],
  });
  const accepted = await web.partners.acceptInvitation(administrator.token, invitation.token);
  await web.partners.changePartnerStatus(staff.token, partner.id, 'active');
  return { partner, membership: accepted.membership };
}

test('membership lifecycle refreshes scoped roles, protects the last administrator, and preserves ended tenures', async (t) => {
  const { web, user } = await fixture(t);
  const staff = await user('staff@example.test', true, true);
  const administrator = await user('admin@example.test');
  const member = await user('member@example.test');
  const { partner, membership: adminMembership } = await activePartner(
    web,
    staff,
    administrator,
    'school-a',
  );
  const invitation = await web.partners.invite(administrator.token, 'partner', partner.id, {
    email: member.email,
    roles: ['list-manager', 'report-viewer'],
  });
  const { membership } = await web.partners.acceptInvitation(member.token, invitation.token);
  const before = await web.currentSession(member.token, 'partner', partner.id);
  assert.deepEqual(before.session.partner.roles, ['list-manager', 'report-viewer']);
  assert.equal(
    (
      await web.partners.invite(member.token, 'partner', partner.id, {
        email: 'other@example.test',
        roles: ['partner-administrator'],
      })
    ).status,
    'authorization-denied',
  );
  assert.equal(
    (
      await web.partners.updateMembership(
        administrator.token,
        'partner',
        partner.id,
        adminMembership.id,
        { roles: ['report-viewer'], status: 'active' },
      )
    ).status,
    'last-administrator',
  );
  assert.equal(
    (
      await web.partners.updateMembership(
        administrator.token,
        'partner',
        partner.id,
        membership.id,
        { roles: ['report-viewer'], status: 'suspended' },
      )
    ).status,
    'updated',
  );
  assert.equal(
    (await web.currentSession(member.token, 'partner', partner.id)).status,
    'authorization-denied',
  );
  assert.equal((await web.currentSession(member.token, 'storefront')).status, 'authenticated');
  await web.partners.updateMembership(administrator.token, 'partner', partner.id, membership.id, {
    roles: ['report-viewer'],
    status: 'active',
  });
  const after = await web.currentSession(member.token, 'partner', partner.id);
  assert.deepEqual(after.session.partner.roles, ['report-viewer']);
  assert.ok(
    after.session.partner.authorizationVersion > before.session.partner.authorizationVersion,
  );
  await web.partners.updateMembership(administrator.token, 'partner', partner.id, membership.id, {
    roles: ['report-viewer'],
    status: 'ended',
  });
  assert.equal(
    (
      await web.partners.updateMembership(
        administrator.token,
        'partner',
        partner.id,
        membership.id,
        { roles: ['report-viewer'], status: 'active' },
      )
    ).status,
    'invalid-transition',
  );
  const reissued = await web.partners.invite(administrator.token, 'partner', partner.id, {
    email: member.email,
    roles: ['list-manager'],
  });
  const rejoined = await web.partners.acceptInvitation(member.token, reissued.token);
  assert.equal(rejoined.status, 'accepted');
  assert.notEqual(rejoined.membership.id, membership.id);
  const access = await web.partners.accessOverview(administrator.token, 'partner', partner.id);
  assert.equal(access.memberships.find((row) => row.id === membership.id).status, 'ended');
  assert.ok(access.history.some((row) => row.action === 'membership-updated'));
  assert.equal(
    (await web.partners.accessOverview(member.token, 'partner', partner.id)).status,
    'authorization-denied',
  );
});

test('invitations reject unverified and wrong Users, expiry, revocation, resends, and concurrent replay', async (t) => {
  const { web, user, database } = await fixture(t);
  const staff = await user('staff@example.test', true, true);
  const administrator = await user('admin@example.test');
  const member = await user('member@example.test', false);
  const wrongUser = await user('wrong@example.test');
  const { partner } = await activePartner(web, staff, administrator, 'school-a');
  const invite = () =>
    web.partners.invite(administrator.token, 'partner', partner.id, {
      email: member.email,
      roles: ['report-viewer'],
    });
  const first = await invite();
  assert.equal(
    (await web.partners.acceptInvitation(member.token, first.token)).status,
    'invitation-unavailable',
  );
  assert.equal(
    (await web.partners.acceptInvitation(wrongUser.token, first.token)).status,
    'invitation-unavailable',
  );
  await database`UPDATE identity.users SET email_verified = now() WHERE id = ${member.id}`;
  const resent = await invite();
  assert.equal(
    (await web.partners.acceptInvitation(member.token, first.token)).status,
    'invitation-unavailable',
  );
  const overview = await web.partners.accessOverview(administrator.token, 'partner', partner.id);
  const revokedInvitation = overview.invitations.find(
    (row) => row.email === member.email && row.status === 'revoked',
  );
  const resendAudit = overview.history.find(
    (row) => row.action === 'invitation-revoked' && row.after.id === revokedInvitation.id,
  );
  assert.equal(resendAudit?.before.status, 'pending');
  assert.equal(resendAudit?.after.status, 'revoked');
  assert.ok(
    overview.history.some((row) => row.action === 'invitation-issued' && row.after.expiresAt),
  );
  assert.ok(!JSON.stringify(overview.history).includes('tokenDigest'));
  const pending = overview.invitations.find(
    (row) => row.email === member.email && row.status === 'pending',
  );
  assert.equal(
    (await web.partners.revokeInvitation(administrator.token, 'partner', partner.id, pending.id))
      .status,
    'revoked',
  );
  assert.equal(
    (await web.partners.acceptInvitation(member.token, resent.token)).status,
    'invitation-unavailable',
  );
  const expiring = await invite();
  await database`UPDATE identity.partner_invitations SET expires_at = now() - interval '1 second' WHERE email = ${member.email}`;
  assert.equal(
    (await web.partners.acceptInvitation(member.token, expiring.token)).status,
    'invitation-unavailable',
  );
  const final = await invite();
  const results = await Promise.all([
    web.partners.acceptInvitation(member.token, final.token),
    web.partners.acceptInvitation(member.token, final.token),
  ]);
  assert.deepEqual(results.map((r) => r.status).sort(), ['accepted', 'invitation-unavailable']);
  const duplicate = await invite();
  assert.equal(
    (await web.partners.acceptInvitation(member.token, duplicate.token)).status,
    'membership-exists',
  );
});

test('multiple Workspaces require a choice, never merge roles, and revoke ineligible context without sign-out', async (t) => {
  const { web, user } = await fixture(t);
  const staff = await user('staff@example.test', true, true);
  const administrator = await user('admin@example.test');
  const member = await user('member@example.test', true, true);
  const a = await activePartner(web, staff, administrator, 'school-a');
  const b = await activePartner(web, staff, administrator, 'school-b');
  for (const [partner, roles] of [
    [a.partner, ['list-manager']],
    [b.partner, ['report-viewer']],
  ]) {
    const invitation = await web.partners.invite(administrator.token, 'partner', partner.id, {
      email: member.email,
      roles,
    });
    await web.partners.acceptInvitation(member.token, invitation.token);
  }
  const entry = await web.currentSession(member.token, 'partner');
  assert.equal(entry.status, 'workspace-selection-required');
  assert.equal(entry.choices.length, 2);
  const aSession = await web.currentSession(member.token, 'partner', a.partner.id);
  const bSession = await web.currentSession(member.token, 'partner', b.partner.id);
  assert.deepEqual(aSession.session.partner.roles, ['list-manager']);
  assert.deepEqual(bSession.session.partner.roles, ['report-viewer']);
  assert.equal((await web.currentSession(member.token, 'back-office')).status, 'authenticated');
  assert.deepEqual(
    (await web.currentSession(member.token, 'partner', a.partner.id)).session.partner.roles,
    ['list-manager'],
  );
  assert.equal(
    (
      await web.partners.updateMembership(
        administrator.token,
        'partner',
        a.partner.id,
        b.membership.id,
        { roles: ['list-manager'], status: 'active' },
      )
    ).status,
    'not-found',
  );
  await web.partners.changePartnerStatus(staff.token, a.partner.id, 'suspended');
  assert.equal(
    (await web.currentSession(member.token, 'partner', a.partner.id)).status,
    'authorization-denied',
  );
  assert.equal((await web.currentSession(member.token, 'storefront')).status, 'authenticated');
  assert.equal(
    (await web.currentSession(member.token, 'partner')).session.partner.businessPartnerId,
    b.partner.id,
  );
  await web.partners.changePartnerStatus(staff.token, a.partner.id, 'closed');
  assert.equal(
    (await web.partners.changePartnerStatus(staff.token, a.partner.id, 'active')).status,
    'invalid-transition',
  );
});

test('concurrent administrator removals cannot leave an active Business Partner without an administrator', async (t) => {
  const { web, user } = await fixture(t);
  const staff = await user('staff@example.test', true, true);
  const first = await user('first@example.test');
  const second = await user('second@example.test');
  const { partner, membership } = await activePartner(web, staff, first, 'school-a');
  const invitation = await web.partners.invite(first.token, 'partner', partner.id, {
    email: second.email,
    roles: ['partner-administrator'],
  });
  const accepted = await web.partners.acceptInvitation(second.token, invitation.token);
  const results = await Promise.all([
    web.partners.updateMembership(first.token, 'partner', partner.id, membership.id, {
      roles: ['report-viewer'],
      status: 'active',
    }),
    web.partners.updateMembership(second.token, 'partner', partner.id, accepted.membership.id, {
      roles: ['report-viewer'],
      status: 'active',
    }),
  ]);
  assert.deepEqual(results.map((r) => r.status).sort(), ['last-administrator', 'updated']);
});

test('a technical failure rolls back invitation consumption and membership acceptance together', async (t) => {
  const { web, user, database } = await fixture(t);
  const staff = await user('staff@example.test', true, true);
  const { partner } = await web.partners.createPartner(staff.token, {
    code: 'school-a',
    nameEn: 'School A',
    nameAr: 'مدرسة',
  });
  const member = await user('member@example.test');
  const invitation = await web.partners.invite(staff.token, 'back-office', partner.id, {
    email: member.email,
    roles: ['partner-administrator'],
  });
  await database`CREATE FUNCTION identity.reject_test_audit() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'test audit unavailable'; END $$`;
  await database`CREATE TRIGGER reject_test_audit BEFORE INSERT ON identity.partner_access_history FOR EACH ROW EXECUTE FUNCTION identity.reject_test_audit()`;
  await assert.rejects(web.partners.acceptInvitation(member.token, invitation.token));
  await database`DROP TRIGGER reject_test_audit ON identity.partner_access_history`;
  assert.equal(
    (await web.partners.acceptInvitation(member.token, invitation.token)).status,
    'accepted',
  );
});

test('HTTP adapters authorize invitation acceptance and keep bilingual Workspace choices separate', async (t) => {
  const { launchWeb } = await import('./support/web-process.mjs');
  const { web, user, environment } = await fixture(t);
  const staff = await user('staff@example.test', true, true);
  const administrator = await user('admin@example.test');
  const member = await user('member@example.test', true, true);
  const a = await activePartner(web, staff, administrator, 'school-a');
  const b = await activePartner(web, staff, administrator, 'school-b');
  const server = await launchWeb(t, environment);
  try {
    const { base } = server;
    const adminHeaders = {
      cookie: `findeg_session=${administrator.token}`,
      origin: base,
      'content-type': 'application/json',
    };
    const headers = {
      cookie: `findeg_session=${member.token}`,
      origin: base,
      'content-type': 'application/json',
    };
    for (const partnerId of [a.partner.id, b.partner.id]) {
      const issued = await fetch(`${base}/api/v1/partner/${partnerId}/access`, {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({ action: 'invite', email: member.email, roles: ['report-viewer'] }),
      });
      assert.equal(issued.status, 201);
      const invitation = await issued.json();
      const accepted = await fetch(`${base}/api/v1/partner/invitations/accept`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ token: invitation.token }),
      });
      assert.equal(accepted.status, 200);
    }
    assert.equal((await fetch(`${base}/api/v1/sessions/partner`, { headers })).status, 409);
    for (const locale of ['en', 'ar']) {
      const choice = await fetch(`${base}/${locale}/partner`, { headers });
      assert.equal(choice.status, 200);
      const html = await choice.text();
      assert.ok(html.includes(`/${locale}/partner/${a.partner.id}`));
      assert.ok(html.includes(`/${locale}/partner/${b.partner.id}`));
      const workspace = await fetch(`${base}/${locale}/partner/${a.partner.id}`, { headers });
      assert.equal(workspace.status, 200);
      assert.match(await workspace.text(), /report-viewer|Report Viewer|عارض التقارير/);
      assert.equal(
        (await fetch(`${base}/${locale}/partner/invitations/accept`, { headers })).status,
        200,
      );
    }
    for (const partnerId of [a.partner.id, b.partner.id, a.partner.id]) {
      const selected = await fetch(
        `${base}/api/v1/sessions/partner?businessPartnerId=${partnerId}`,
        { headers },
      );
      assert.equal(selected.status, 200);
      assert.equal((await selected.json()).session.partner.businessPartnerId, partnerId);
      assert.equal(selected.headers.get('set-cookie'), null);
    }
    assert.equal((await fetch(`${base}/api/v1/sessions/back-office`, { headers })).status, 200);
    const denied = await fetch(`${base}/api/v1/partner/${a.partner.id}/access`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        action: 'invite',
        email: 'no@example.test',
        roles: ['partner-administrator'],
      }),
    });
    assert.equal(denied.status, 403);
    assert.equal(denied.headers.get('set-cookie'), null);
    const crossOrigin = await fetch(`${base}/api/v1/partner/${a.partner.id}/access`, {
      method: 'POST',
      headers: { ...adminHeaders, origin: 'https://attacker.example' },
      body: JSON.stringify({
        action: 'invite',
        email: 'no@example.test',
        roles: ['report-viewer'],
      }),
    });
    assert.equal(crossOrigin.status, 403);
    await web.partners.changePartnerStatus(staff.token, a.partner.id, 'suspended');
    const revokedPage = await fetch(`${base}/en/partner/${a.partner.id}`, {
      headers,
      redirect: 'manual',
    });
    assert.equal(revokedPage.status, 307);
    assert.equal(revokedPage.headers.get('location'), '/en');
    assert.equal((await fetch(`${base}/api/v1/sessions/storefront`, { headers })).status, 200);
    const signedOutPage = await (await fetch(`${base}/en/partner/invitations/accept`)).text();
    assert.match(signedOutPage, /Sign in to accept invitation/);
    const malformed = await fetch(`${base}/api/v1/sessions/partner?businessPartnerId=bad`, {
      headers,
    });
    assert.equal(malformed.status, 400);
  } finally {
    await server.stop();
  }
});
