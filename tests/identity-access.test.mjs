import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { randomUUID } from 'node:crypto';
import { launchWeb } from './support/web-process.mjs';
import { runMigrations } from '../db/dist/runtime/migrations.js';
import { createWebRuntime } from '../runtime/dist/index.js';

const require = createRequire(new URL('../db/package.json', import.meta.url));
const postgres = require('postgres');
const bcrypt = require('bcryptjs');

test('PostgreSQL Current Sessions survive runtime restart and isolate Active Portals', async (t) => {
  const admin = postgres(process.env.MIGRATION_TEST_DATABASE_URL, { max: 1 });
  const name = `findeg_identity_${randomUUID().replaceAll('-', '')}`;
  const url = new URL(process.env.MIGRATION_TEST_DATABASE_URL);
  url.pathname = `/${name}`;
  let database, web, restarted, stopWeb;
  await admin`CREATE DATABASE ${admin(name)}`;
  try {
    await runMigrations({ url: url.toString(), ssl: false });
    database = postgres(url.toString(), { max: 1 });
    const [user] =
      await database`INSERT INTO identity.users(email) VALUES ('staff@example.test') RETURNING id`;
    const hash = await bcrypt.hash('test-password-123', 4);
    await database`INSERT INTO identity.password_credentials(user_id, password_hash) VALUES (${user.id}, ${hash})`;
    await database`INSERT INTO identity.staff_role_grants(user_id, role) VALUES (${user.id}, 'catalog-manager')`;
    const environment = { RELEASE_REVISION: 'a'.repeat(40), DATABASE_URL: url.toString() };
    web = createWebRuntime(environment);
    const login = await web.signIn('staff@example.test', 'test-password-123');
    assert.equal(login.status, 'authenticated');
    await web.close();
    restarted = createWebRuntime(environment);
    assert.equal(
      (await restarted.currentSession(login.token, 'back-office')).session.activePortal,
      'back-office',
    );
    assert.deepEqual(
      (await restarted.currentSession(login.token, 'storefront')).session.permissions,
      [],
    );
    assert.equal(
      (await restarted.authorize(login.token, 'back-office', 'catalog.manage')).status,
      'authenticated',
    );
    assert.equal(
      (await restarted.authorize(login.token, 'storefront', 'catalog.manage')).status,
      'authorization-denied',
    );
    const [administrator] =
      await database`INSERT INTO identity.users(email) VALUES ('admin@example.test') RETURNING id`;
    await database`INSERT INTO identity.password_credentials(user_id, password_hash) VALUES (${administrator.id}, ${hash})`;
    await database`INSERT INTO identity.staff_role_grants(user_id, role) VALUES (${administrator.id}, 'access-administrator')`;
    const adminLogin = await restarted.signIn('admin@example.test', 'test-password-123');
    assert.equal(
      (
        await restarted.updateStaffAccess(
          login.token,
          'back-office',
          user.id,
          ['finance-manager'],
          true,
        )
      ).status,
      'authorization-denied',
    );
    assert.equal(
      (
        await restarted.updateStaffAccess(
          adminLogin.token,
          'storefront',
          user.id,
          ['finance-manager'],
          true,
        )
      ).status,
      'authorization-denied',
    );
    const before = (await restarted.currentSession(login.token, 'back-office')).session
      .authorizationVersion;
    assert.equal(
      (
        await restarted.updateStaffAccess(
          adminLogin.token,
          'back-office',
          user.id,
          ['finance-manager', 'fulfillment-operator'],
          true,
        )
      ).status,
      'updated',
    );
    const refreshed = await restarted.currentSession(login.token, 'back-office');
    assert.ok(refreshed.session.authorizationVersion > before);
    assert.equal(
      (await restarted.authorize(login.token, 'back-office', 'catalog.manage')).status,
      'authorization-denied',
    );
    assert.equal(
      (await restarted.authorize(login.token, 'back-office', 'finance.manage')).status,
      'authenticated',
    );
    assert.equal(
      (await restarted.authorize(login.token, 'back-office', 'fulfillment.manage')).status,
      'authenticated',
    );
    await restarted.updateStaffAccess(adminLogin.token, 'back-office', user.id, [], true);
    assert.equal(
      (await restarted.currentSession(login.token, 'back-office')).status,
      'authorization-denied',
    );
    assert.equal(
      (await restarted.currentSession(login.token, 'storefront')).status,
      'authenticated',
    );
    await restarted.updateStaffAccess(adminLogin.token, 'back-office', user.id, [], false);
    await restarted.updateStaffAccess(
      adminLogin.token,
      'back-office',
      user.id,
      ['catalog-manager'],
      true,
    );
    assert.equal(
      (await restarted.currentSession(login.token, 'storefront')).status,
      'authentication-required',
    );
    const nextLogin = await restarted.signIn('staff@example.test', 'test-password-123');
    await restarted.signOut(nextLogin.token);
    assert.equal(
      (await restarted.currentSession(nextLogin.token, 'storefront')).status,
      'authentication-required',
    );
    assert.equal(
      (await restarted.signIn('staff@example.test', 'wrong-password')).status,
      'invalid-credentials',
    );
    const { base, stop, output } = await launchWeb(t, environment);
    stopWeb = stop;
    const signInResponse = await fetch(`${base}/api/v1/sessions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: base },
      body: JSON.stringify({ email: 'staff@example.test', password: 'test-password-123' }),
    });
    assert.equal(signInResponse.status, 201);
    const setCookie = signInResponse.headers.get('set-cookie');
    assert.match(setCookie, /HttpOnly/i);
    assert.match(setCookie, /SameSite=Lax/i);
    assert.match(setCookie, /Secure/i);
    const cookie = setCookie.split(';')[0];
    const headers = { cookie };
    for (const locale of ['en', 'ar']) {
      assert.equal((await fetch(`${base}/${locale}/back-office`, { headers })).status, 200);
      const customer = await fetch(`${base}/api/v1/sessions/storefront`, { headers });
      assert.equal((await customer.json()).session.activePortal, 'storefront');
      const staff = await fetch(`${base}/api/v1/sessions/back-office`, { headers });
      assert.equal((await staff.json()).session.activePortal, 'back-office');
    }
    const denied = await fetch(`${base}/api/v1/back-office/staff-access`, {
      method: 'PUT',
      headers: { ...headers, origin: base, 'content-type': 'application/json' },
      body: JSON.stringify({ userId: user.id, roles: ['access-administrator'], isActive: true }),
    });
    assert.equal(denied.status, 403);
    assert.equal(denied.headers.get('set-cookie'), null);
    assert.equal((await fetch(`${base}/api/v1/sessions/back-office`, { headers })).status, 200);
    const partner = await fetch(`${base}/api/v1/sessions/partner`, { headers });
    assert.equal(partner.status, 403);
    assert.equal(partner.headers.get('set-cookie'), null);
    const crossOrigin = await fetch(`${base}/api/v1/sessions`, {
      method: 'DELETE',
      headers: { ...headers, origin: 'https://attacker.example' },
    });
    assert.equal(crossOrigin.status, 403);
    assert.equal((await fetch(`${base}/api/v1/sessions/back-office`, { headers })).status, 200);
    const changed = await fetch(`${base}/api/v1/back-office/staff-access`, {
      method: 'PUT',
      headers: {
        cookie: `findeg_session=${adminLogin.token}`,
        origin: base,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ userId: user.id, roles: ['finance-manager'], isActive: true }),
    });
    assert.equal(changed.status, 200);
    const fresh = await (await fetch(`${base}/api/v1/sessions/back-office`, { headers })).json();
    assert.deepEqual(fresh.session.permissions, ['back-office.enter', 'finance.manage']);
    const signInPage = await (await fetch(`${base}/ar/back-office/sign-in`)).text();
    const form = new FormData();
    // Replay the public HTML form, including Next's action fields, as a browser would.
    const decode = (value) =>
      value
        .replaceAll('&quot;', '"')
        .replaceAll('&#x27;', "'")
        .replaceAll('&amp;', '&')
        .replaceAll('&lt;', '<')
        .replaceAll('&gt;', '>');
    for (const input of signInPage.matchAll(/<input\b[^>]*>/g)) {
      const name = input[0].match(/name="([^"]+)"/);
      const value = input[0].match(/value="([^"]*)"/);
      if (name) form.append(decode(name[1]), value ? decode(value[1]) : '');
    }
    form.set('email', 'staff@example.test');
    form.set('password', 'test-password-123');
    const formLogin = await fetch(`${base}/ar/back-office/sign-in`, {
      method: 'POST',
      headers: { origin: base },
      body: form,
      redirect: 'manual',
    });
    assert.equal(formLogin.status, 303, output());
    assert.equal(formLogin.headers.get('location'), '/ar/back-office');
    const formCookie = formLogin.headers.get('set-cookie').split(';')[0];
    assert.equal(
      (await fetch(`${base}/api/v1/sessions/back-office`, { headers: { cookie: formCookie } }))
        .status,
      200,
    );
    const logout = await fetch(`${base}/api/v1/sessions`, {
      method: 'DELETE',
      headers: { ...headers, origin: base },
    });
    assert.equal(logout.status, 204);
    assert.equal((await fetch(`${base}/api/v1/sessions/storefront`, { headers })).status, 401);

    const replacementHash = await bcrypt.hash('new-password-123', 4);
    await database`UPDATE identity.password_credentials SET password_hash = ${replacementHash} WHERE user_id = ${user.id}`;
    assert.equal(
      (await fetch(`${base}/api/v1/sessions/back-office`, { headers: { cookie: formCookie } }))
        .status,
      401,
    );
  } finally {
    await stopWeb?.();
    await web?.close();
    await restarted?.close();
    await database?.end();
    await admin`DROP DATABASE ${admin(name)}`;
    await admin.end();
  }
});
