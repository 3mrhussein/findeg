'use server';

import { requireStaffAction } from '@lib/auth-guard';
import { revalidateTag } from 'next/cache';
import { createIdentityServices } from '@findeg/backend/features/identity';
import { PERMISSION_CODES } from '@findeg/backend/features/core';
import { getErrorMessage } from '@lib/type-guards';

/**
 * Admin User Actions (Dashboard Data Layer)
 *
 * Uses "use server" directive and calls backend identity service factories.
 */

export async function createAdminAction(formData: FormData) {
  try {
    await requireStaffAction(PERMISSION_CODES.ADMIN_USERS_WRITE, 'create admin user');

    // Extract form data
    const input = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      firstName: (formData.get('firstName') || formData.get('nameEn')) as string,
      lastName: (formData.get('lastName') || '') as string,
      roleIds: JSON.parse((formData.get('roleIds') as string) || '[]'),
    };

    const { adminUsers } = createIdentityServices();
    const result = await adminUsers.createAdmin(input);

    revalidateTag('admin-users', 'max');
    return { success: true, data: result };
  } catch (error: unknown) {
    console.error('[createAdminAction]', error);
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function updateAdminAction(userId: number, formData: FormData) {
  try {
    await requireStaffAction(PERMISSION_CODES.ADMIN_USERS_WRITE, 'update admin user');

    // Extract form data
    const input = {
      firstName: (formData.get('firstName') || formData.get('nameEn')) as string,
      lastName: (formData.get('lastName') || '') as string,
      roleIds: JSON.parse((formData.get('roleIds') as string) || '[]'),
      isActive: formData.get('isActive') === 'true',
    };

    const { adminUsers } = createIdentityServices();
    const result = await adminUsers.updateAdmin(userId, input);

    revalidateTag('admin-users', 'max');
    return { success: true, data: result };
  } catch (error: unknown) {
    console.error('[updateAdminAction]', error);
    return { success: false, error: getErrorMessage(error) };
  }
}
