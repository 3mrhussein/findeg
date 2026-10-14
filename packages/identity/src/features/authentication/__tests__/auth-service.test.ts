import { describe, it, expect, beforeEach, vi } from 'vitest';
import bcrypt from 'bcryptjs';
import { userQueries } from '@findeg/db/queries';
import { AuthService, AuthCredentialsSchema, RegisterInputSchema } from '../helpers';

vi.mock('bcryptjs', () => ({
  default: { compare: vi.fn(), hash: vi.fn() },
}));

vi.mock('@findeg/db/queries', () => ({
  userQueries: {
    getByEmailWithPassword: vi.fn(),
    getByEmail: vi.fn(),
    getAuthorizationContext: vi.fn(),
    create: vi.fn(),
    upsertPasswordCredentials: vi.fn(),
  },
}));

const activeUser = {
  id: 3,
  email: 'buyer@example.com',
  firstName: 'Buyer',
  lastName: null,
  phone: '0100',
  portalRole: 'customer' as const,
  password: 'hash',
  isActive: true,
  authorizationVersion: 2,
};

const authorization = { activeRoleIds: ['customer'], permissionCodes: [] as string[] };

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AuthService();
    vi.mocked(userQueries.getAuthorizationContext).mockResolvedValue(authorization);
  });

  it('rejects an unknown email with the generic invalid-credentials message', async () => {
    vi.mocked(userQueries.getByEmailWithPassword).mockResolvedValue(undefined as never);

    const result = await service.login('nobody@example.com', 'secret');

    expect(result).toEqual({ success: false, error: 'Invalid email or password.' });
  });

  it('rejects an account without a password credential', async () => {
    vi.mocked(userQueries.getByEmailWithPassword).mockResolvedValue({
      ...activeUser,
      password: null,
    } as never);

    const result = await service.login(activeUser.email, 'secret');

    expect(result).toEqual({ success: false, error: 'Account has no password set.' });
  });

  it('rejects a wrong password and an inactive account with the same message', async () => {
    vi.mocked(userQueries.getByEmailWithPassword).mockResolvedValue(activeUser as never);
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never);
    expect(await service.login(activeUser.email, 'wrong')).toEqual({
      success: false,
      error: 'Invalid email or password.',
    });

    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
    vi.mocked(userQueries.getByEmailWithPassword).mockResolvedValue({
      ...activeUser,
      isActive: false,
    } as never);
    expect(await service.login(activeUser.email, 'right')).toEqual({
      success: false,
      error: 'Invalid email or password.',
    });
  });

  it('returns the Current Session payload and the user summary on success', async () => {
    vi.mocked(userQueries.getByEmailWithPassword).mockResolvedValue(activeUser as never);
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

    const result = await service.login(activeUser.email, 'right');

    expect(result.success).toBe(true);
    expect(result.session).toMatchObject({
      userId: 3,
      portalRole: 'customer',
      activeRoleIds: ['customer'],
      tokenVersion: 2,
    });
    expect(result.user).toMatchObject({
      id: 3,
      email: 'buyer@example.com',
      firstName: 'Buyer',
      lastName: undefined,
      phone: '0100',
      portalRole: 'customer',
    });
  });

  it('registers a customer with a bcrypt credential and logs them in', async () => {
    vi.mocked(userQueries.getByEmail).mockResolvedValue(undefined as never);
    vi.mocked(bcrypt.hash).mockResolvedValue('hashed' as never);
    vi.mocked(userQueries.create).mockResolvedValue({ id: 3 } as never);
    vi.mocked(userQueries.getByEmailWithPassword).mockResolvedValue({
      ...activeUser,
      password: 'hashed',
    } as never);
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

    const result = await service.register({
      email: 'buyer@example.com',
      password: 'longenough',
      firstName: 'Buyer',
    });

    expect(userQueries.create).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'buyer@example.com', portalRole: 'customer' }),
    );
    expect(userQueries.upsertPasswordCredentials).toHaveBeenCalledWith(
      3,
      { passwordHash: 'hashed', hashStrategy: 'bcrypt' },
      { isInitialCredential: true },
    );
    expect(result.success).toBe(true);
  });

  it('reports an already registered email without creating a user', async () => {
    vi.mocked(userQueries.getByEmail).mockResolvedValue(activeUser as never);

    const result = await service.register({ email: activeUser.email, password: 'longenough' });

    expect(result).toEqual({ success: false, error: 'Email already registered.' });
    expect(userQueries.create).not.toHaveBeenCalled();
  });

  it('surfaces an error message on registration failure, falling back to the catalog text', async () => {
    vi.mocked(userQueries.getByEmail).mockRejectedValueOnce(new Error('db down'));
    expect(await service.register({ email: 'a@example.com', password: 'longenough' })).toEqual({
      success: false,
      error: 'db down',
    });

    vi.mocked(userQueries.getByEmail).mockRejectedValueOnce('boom');
    expect(await service.register({ email: 'a@example.com', password: 'longenough' })).toEqual({
      success: false,
      error: 'Registration failed.',
    });
  });

  it('keeps session creation, retrieval and validation in the app layer', async () => {
    await expect(service.logout()).rejects.toThrow('handle in app-layer');
    await expect(service.getSession()).rejects.toThrow('handle in app-layer');
    await expect(service.validateAdmin()).rejects.toThrow('handle in app-layer');
  });

  it('checks administrative sessions through the shared predicate', () => {
    expect(service.adminSession({ permissionCodes: ['admin.portal'] } as never)).toBe(true);
  });

  it('validates credential and registration input', () => {
    expect(AuthCredentialsSchema.safeParse({ email: 'a@example.com', password: '' }).success).toBe(
      false,
    );
    expect(
      RegisterInputSchema.safeParse({ email: 'a@example.com', password: 'short' }).success,
    ).toBe(false);
    expect(
      RegisterInputSchema.safeParse({ email: 'a@example.com', password: 'longenough' }).success,
    ).toBe(true);
  });
});
