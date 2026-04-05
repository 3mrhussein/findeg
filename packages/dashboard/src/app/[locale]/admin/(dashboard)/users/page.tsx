import { getServices } from "@/server/getServices";
import { requireAdmin } from "@/lib/auth-guard";
import { PERMISSION_CODES } from "@/features/core/domain/auth/authorization";
import { AdminUsersList } from "./_components/AdminUsersList";
import type { Locale } from "next-intl";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Admin Users - FindEg Admins",
};

/**
 *
 */
export default async function AdminUsersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await requireAdmin(locale as Locale);

  // Check permissions (Super Admins typically handle user management)
  const canManageUsers =
    session.activeRoleIds?.includes("system_admin") ||
    session.permissionCodes?.includes(PERMISSION_CODES.ADMIN_USERS_READ);

  if (!canManageUsers) {
    redirect("/admin");
  }

  const { adminUser, adminRole } = getServices();

  const [usersRaw, rolesRaw] = await Promise.all([adminUser.listAdmins(), adminRole.listRoles()]);

  // Serialize and clean data for Client Component (ensures Dates etc are handled)
  const users = JSON.parse(JSON.stringify(usersRaw));
  const roles = JSON.parse(JSON.stringify(rolesRaw));

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
