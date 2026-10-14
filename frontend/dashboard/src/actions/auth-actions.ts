/**
 * Dashboard Authentication Server Actions
 */

'use server';

import { redirect } from '@i18n/navigation';
import { createIdentityServices } from '@findeg/identity';
import { type SessionPayload } from '@findeg/identity';
import { adminSession, createUserVO } from '@findeg/identity/types';
import { createSession, deleteSession } from '@lib/session';

export type LoginActionState = {
  success?: boolean;
  error?: string;
} | null;

/**
 * Server Action: User login
 *
 * Supports both useActionState (prevState, formData) and direct invocation (formData).
 */
export async function loginAction(
  prevStateOrFormData?: LoginActionState | FormData,
  formDataOrUndefined?: FormData,
): Promise<LoginActionState> {
  const formData =
    formDataOrUndefined instanceof FormData
      ? formDataOrUndefined
      : prevStateOrFormData instanceof FormData
        ? prevStateOrFormData
        : null;

  if (!formData) {
    return { success: false, error: 'generic' };
  }

  const locale = (formData.get('locale') as string) === 'ar' ? 'ar' : 'en';
  const email = (formData.get('email') as string)?.trim();
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { success: false, error: 'requiredFields' };
  }

  try {
    const { auth } = createIdentityServices();
    const result = await auth.login(email, password);

    if (!result.success || !result.user) {
      return { success: false, error: 'invalidCredentials' };
    }

    // Construct SessionPayload mapping from AuthResult.user
    const sessionPayload = {
      userId: result.user.id,
      portalRole: result.user.portalRole,
      user: createUserVO({
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
      }),
      subjectId: String(result.user.id),
      actorType: result.user.actorType || 'user',
      activeRoleIds: result.user.activeRoleIds,
      permissionCodes: result.user.permissionCodes,
      organizationId: result.user.organizationId,
      tokenVersion: 1,
    };

    if (!adminSession(sessionPayload as SessionPayload)) {
      return { success: false, error: 'adminOnly' };
    }

    await createSession(sessionPayload as SessionPayload);
  } catch (error: unknown) {
    if (
      error &&
      typeof error === 'object' &&
      'digest' in error &&
      typeof error.digest === 'string' &&
      error.digest.startsWith('NEXT_REDIRECT')
    ) {
      throw error;
    }
    console.error('[dashboard] Login error:', error);
    return { success: false, error: 'generic' };
  }

  redirect({ href: '/', locale });
  return { success: true };
}

/**
 * Server Action: User logout
 *
 * Retains locale and redirects to /login.
 */
export async function logoutAction(formData?: FormData) {
  const locale = (formData?.get('locale') as string) === 'ar' ? 'ar' : 'en';
  const redirectTo = (formData?.get('redirectTo') as string) || '/login';

  try {
    await deleteSession();
  } catch (error: unknown) {
    console.error('[dashboard] Logout action error:', error);
  }

  redirect({ href: redirectTo, locale });
}
