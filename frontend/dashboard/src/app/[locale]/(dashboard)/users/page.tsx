import { requirePermission } from "@lib/auth-guard";
import { PERMISSION_CODES } from "@findeg/backend/features/core";
import { AdminUsersList } from "./_components/AdminUsersList";
import type { Locale } from "next-intl";
import { getAdminUsers, getSystemRoles } from "@data/access/queries";

export const metadata = {
  title: "Admin Users - FindEg Admins",
};

/**
 *
 */
export default async function AdminUsersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  await requirePermission(locale as Locale, {
    permission: PERMISSION_CODES.ADMIN_USERS_READ,
  });

  const [users, roles] = await Promise.all([getAdminUsers(), getSystemRoles()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Users</h1>
        <p className="text-muted-foreground mt-2">
          Manage system administrators, editors, and operational staff.
        </p>
      </div>

      <AdminUsersList initialUsers={users} roles={roles} />
    </div>
  );
}
