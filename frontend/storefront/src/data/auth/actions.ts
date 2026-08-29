"use server";

import {
    RegisterInputSchema,
    createIdentityServices,
    type RegisterInput,
} from '@findeg/backend/features/identity';
import type { ActivePortal as CoreActivePortal } from '@findeg/backend/features/core';
import { deleteSession, establishSession, switchActivePortal } from '@lib/session';
import { redirect } from '@i18n/navigation';

export interface AuthActionResult {
    success: boolean;
    error?: string;
}

/** Authenticate a Storefront User and establish the HTTP-only Current Session. */
export async function loginAction(email: string, password: string): Promise<AuthActionResult> {
    if (!email.trim() || !password) {
        return { success: false, error: 'Email and password are required' };
    }

    const { auth } = createIdentityServices();
    const result = await auth.login(email.trim(), password);
    if (!result.success || !result.user) {
        return { success: false, error: result.error ?? 'Invalid credentials' };
    }

    const session = await establishSession(result.user.id);
    if (!session) {
        return { success: false, error: 'Account is not active' };
    }

    return { success: true };
}

/** Register a customer and establish the HTTP-only Current Session. */
export async function registerAction(input: RegisterInput): Promise<AuthActionResult> {
    const parsed = RegisterInputSchema.safeParse(input);
    if (!parsed.success) {
        return {
            success: false,
            error: parsed.error.issues[0]?.message ?? 'Invalid registration details',
        };
    }

    const { auth } = createIdentityServices();
    const result = await auth.register(parsed.data);
    if (!result.success || !result.user) {
        return { success: false, error: result.error ?? 'Registration failed' };
    }

    const session = await establishSession(result.user.id);
    if (!session) {
        return { success: false, error: 'Account is not active' };
    }

    return { success: true };
}

/**
 * Logout server action.
 * 
 * Deletes the session cookie and redirects to login page.
 */
export async function logout(): Promise<void> {
    await deleteSession();
    redirect({ href: '/login', locale: 'en' });
}

export async function logoutAction(): Promise<void> {
    return await logout();
}

/** Server Action for explicit Active Portal selection. */
export async function switchPortalAction(
    activePortal: CoreActivePortal,
): Promise<AuthActionResult> {
    const session = await switchActivePortal(activePortal);
    if (!session) {
        return { success: false, error: 'Not authenticated' };
    }

    return {
        success: session.activePortal === activePortal,
        error: session.activePortal === activePortal ? undefined : 'Active Portal is not available',
    };
}
