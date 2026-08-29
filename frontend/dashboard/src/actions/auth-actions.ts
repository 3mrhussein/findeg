/**
 * Dashboard Authentication Server Actions
 *
 * TODO: Reimplement using createIdentityServices() from backend
 *
 * The backend login/logout functions were removed from exports because they use
 * ServiceContainer with @ imports that break Turbopack bundling.
 *
 * Implementation approach:
 * 1. Import createIdentityServices from @backend/features/identity
 * 2. Call authService.login(email, password)
 * 3. Handle session creation with Next.js cookies
 * 4. Handle redirects and cache invalidation
 */

'use server';

import { redirect } from '@i18n/navigation';
import { createIdentityServices } from '@findeg/backend/features/identity';
import { adminSession, type ActivePortal } from '@findeg/backend/features/core';
import { establishSession, deleteSession, switchActivePortal } from '@lib/session';

/**
 * Server Action: User login
 *
 * @param formData - Form data with 'email' and 'password' fields
 */
export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  try {
    const { auth } = createIdentityServices();
    const result = await auth.login(email, password);

    if (!result.success || !result.user) {
      throw new Error(result.error || 'Invalid email or password');
    }

    const session = await establishSession(result.user.id);

    if (!session || !adminSession(session)) {
      throw new Error('Forbidden: This portal is for administrators only');
    }
  } catch (error: unknown) {
    // If it's a redirect, let it bubble up (standard Next.js behavior)
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
    throw error;
  }

  redirect({ href: '/', locale: 'en' });
}

/**
 * Server Action: User logout
 *
 * @param formData - Optional form data with redirectTo field
 */
export async function logoutAction(formData?: FormData) {
  try {
    // Delete session cookie
    await deleteSession();

    // Redirect after logout
    const redirectTo = (formData?.get('redirectTo') as string) || '/';
    redirect({ href: redirectTo, locale: 'en' });
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
    console.error('[dashboard] Logout action error:', error);
    // Even if error occurs, redirect to home
    redirect({ href: '/', locale: 'en' });
  }
}

/** Server Action for explicit Active Portal selection. */
export async function switchPortalAction(activePortal: ActivePortal) {
  const session = await switchActivePortal(activePortal);
  if (!session) {
    return { success: false, error: 'Not authenticated' };
  }

  return {
    success: session.activePortal === activePortal,
    error: session.activePortal === activePortal ? undefined : 'Active Portal is not available',
  };
}
