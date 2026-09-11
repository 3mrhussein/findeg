import { describe, it, expect } from 'vitest';
import { createIdentityAccess } from '../public.js';

describe('Current Session', () => {
  it('resolves one credential independently for Storefront and Back Office requests', async () => {
    const identity = createIdentityAccess(
      {
        readSession: async () => ({
          userId: 7,
          expiresAt: new Date('2030-01-01'),
          authorizationVersion: 1,
        }),
        readUser: async () => ({
          id: 7,
          email: 'staff@example.test',
          isActive: true,
          authorizationVersion: 1,
          staffRoles: ['catalog-manager'],
        }),
        refreshSession: async () => {},
      },
      { digest: (token: string) => token, now: () => new Date('2026-01-01') },
    );
    const staff = await identity.currentSession('credential', 'back-office');
    const customer = await identity.currentSession('credential', 'storefront');
    expect(staff).toMatchObject({
      status: 'authenticated',
      session: {
        userId: 7,
        activePortal: 'back-office',
        permissions: ['back-office.enter', 'catalog.manage'],
      },
    });
    expect(customer).toMatchObject({
      status: 'authenticated',
      session: { activePortal: 'storefront', permissions: [], staffRoles: [] },
    });
    expect(staff).toMatchObject({ session: { activePortal: 'back-office' } });
  });
});

it('adds fixed staff roles and refreshes removed access without invalidating the credential', async () => {
  let version = 1;
  let roles: import('../contracts.js').StaffRole[] = ['catalog-manager', 'finance-manager'];
  let active = true;
  let revoked = false;
  const identity = createIdentityAccess(
    {
      readSession: async () =>
        revoked
          ? undefined
          : { userId: 7, expiresAt: new Date('2030-01-01'), authorizationVersion: 1 },
      readUser: async () => ({
        id: 7,
        email: 'staff@example.test',
        isActive: active,
        authorizationVersion: version,
        staffRoles: roles,
      }),
      refreshSession: async () => {},
    },
    { digest: (token: string) => token, now: () => new Date('2026-01-01') },
  );
  expect(await identity.authorize('credential', 'back-office', 'finance.manage')).toMatchObject({
    status: 'authenticated',
  });
  expect(await identity.authorize('credential', 'back-office', 'catalog.manage')).toMatchObject({
    status: 'authenticated',
  });
  expect(await identity.authorize('credential', 'storefront', 'catalog.manage')).toMatchObject({
    status: 'authorization-denied',
  });
  expect(await identity.currentSession('credential', 'partner')).toMatchObject({
    status: 'authorization-denied',
  });
  roles = ['catalog-manager'];
  version = 2;
  expect(await identity.authorize('credential', 'back-office', 'finance.manage')).toMatchObject({
    status: 'authorization-denied',
    session: { authorizationVersion: 2 },
  });
  expect(await identity.authorize('credential', 'back-office', 'catalog.manage')).toMatchObject({
    status: 'authenticated',
  });
  roles = [];
  version = 3;
  expect(await identity.currentSession('credential', 'back-office')).toMatchObject({
    status: 'authorization-denied',
  });
  expect(await identity.currentSession('credential', 'storefront')).toMatchObject({
    status: 'authenticated',
  });
  active = false;
  expect(await identity.currentSession('credential', 'storefront')).toEqual({
    status: 'authentication-required',
  });
  active = true;
  revoked = true;
  expect(await identity.currentSession('credential', 'storefront')).toEqual({
    status: 'authentication-required',
  });
});

it('rejects expired and missing credentials', async () => {
  const identity = createIdentityAccess(
    {
      readSession: async () => ({
        userId: 7,
        expiresAt: new Date('2026-01-01'),
        authorizationVersion: 1,
      }),
      readUser: async () => ({
        id: 7,
        email: 'staff@example.test',
        isActive: true,
        authorizationVersion: 1,
        staffRoles: ['catalog-manager'],
      }),
      refreshSession: async () => {},
    },
    { digest: (token: string) => token, now: () => new Date('2026-01-01') },
  );
  expect(await identity.currentSession('credential', 'storefront')).toEqual({
    status: 'authentication-required',
  });
  expect(await identity.currentSession(undefined, 'storefront')).toEqual({
    status: 'authentication-required',
  });
});
