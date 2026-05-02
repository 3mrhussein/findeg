"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { Badge } from "@findeg/ui";
import { Button } from "@findeg/ui";
import { Card, CardHeader, CardTitle, CardContent } from "@findeg/ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@findeg/ui";
import { Input } from "@findeg/ui";
import { Label } from "@findeg/ui";
import { Switch } from "@findeg/ui";
import { createAdminAction, updateAdminAction } from "@data/access/actions";
import type { AdminUser } from "@findeg/backend/features/identity";
import type { RoleWithPermissions } from "@findeg/backend/features/identity";
import { useToast } from "@hooks/use-toast";
import { Search, Loader2 } from "lucide-react";
import { useRouter } from "@i18n/navigation";

/**
 *
 */
export function AdminUsersList({
  initialUsers,
  roles,
}: {
  initialUsers: AdminUser[];
  roles: RoleWithPermissions[];
}) {
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const router = useRouter();
  const t = useTranslations("Pages.Dashboard");

  // Form State
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    isActive: true,
    roles: [] as number[],
  });

  /**
   *
   */
  const handleOpenEdit = (user: AdminUser) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      password: "", // Don't show existing password
      isActive: user.isActive,
      roles: user.roles.map((r) => r.id),
    });
    setEditModalOpen(true);
  };

  /**
   *
   */
  const handleOpenAdd = () => {
    setSelectedUser(null);
    setFormData({
      email: "",
      firstName: "",
      lastName: "",
      password: "",
      isActive: true,
      roles: [],
    });
    setAddModalOpen(true);
  };

  /**
   *
   */
  const handleToggleRole = (roleId: number) => {
    setFormData((prev) => ({
      ...prev,
      roles: prev.roles.includes(roleId)
        ? prev.roles.filter((id) => id !== roleId)
        : [...prev.roles, roleId],
    }));
  };

  /**
   *
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);

    try {
      let result;
      if (selectedUser) {
        result = await updateAdminAction(selectedUser.id, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          isActive: formData.isActive,
          roleIds: formData.roles,
        });
      } else {
        result = await createAdminAction({
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          password: formData.password,
          roleIds: formData.roles,
        });
      }

      if (result.success) {
        toast({
          title: selectedUser ? "Admin Updated" : "Admin Created",
          description: `Successfully ${selectedUser ? "updated" : "created"} admin account for ${formData.firstName} ${formData.lastName}`,
        });
        setEditModalOpen(false);
        setAddModalOpen(false);
        router.refresh();
      } else {
        throw new Error(result.error || "Action failed");
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while saving the administrator.",
        variant: "destructive",
      });
    } finally {
      setIsPending(false);
    }
  };

  const filteredUsers = initialUsers.filter((user) => {
    const searchStr = searchQuery.toLowerCase();
    return (
      user.email.toLowerCase().includes(searchStr) ||
      (user.firstName || "").toLowerCase().includes(searchStr) ||
      (user.lastName || "").toLowerCase().includes(searchStr)
    );
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
        <div className="space-y-1">
          <CardTitle>{t("Overview")}</CardTitle>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t("SearchAdmins")}
              className="pl-8 w-[250px] lg:w-[350px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <Button onClick={handleOpenAdd}>{t("NewAdmin")}</Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-muted text-muted-foreground">
              <tr>
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Account Status</th>
                <th className="px-6 py-3">Roles</th>
                <th className="px-6 py-3">Created</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b">
                  <td className="px-6 py-4">
                    <div className="font-semibold">
                      {user.firstName} {user.lastName}
                    </div>
                    <div className="text-muted-foreground">{user.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={user.isActive ? "default" : "destructive"}>
                      {user.isActive ? t("Active") : t("Inactive")}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map((role) => (
                        <Badge key={role.id} variant="outline">
                          {role.name}
                        </Badge>
                      ))}
                      {user.roles.length === 0 && (
                        <span className="text-muted-foreground">No roles assigned</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">{format(new Date(user.createdAt), "MMM d, yyyy")}</td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(user)}>
                      {t("Edit")}
                    </Button>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr className="border-b text-center">
                  <td colSpan={5} className="px-6 py-10">
                    {searchQuery ? t("NoSearchResults") : t("TeamEmpty")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal for Edit/Add */}
        <Dialog
          open={isEditModalOpen || isAddModalOpen}
          onOpenChange={(open) => {
            if (!open) {
              setEditModalOpen(false);
              setAddModalOpen(false);
            }
          }}
        >
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>{selectedUser ? t("EditAdmin") : t("NewAdmin")}</DialogTitle>
              <DialogDescription>{t("TeamDescription")}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("FirstName")}</Label>
                  <Input
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("LastName")}</Label>
                  <Input
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t("AdminEmail")}</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={!!selectedUser} // Do not let them change email of existing user easily
                />
              </div>

              <div className="space-y-2">
                <Label>{selectedUser ? `${t("Password")} (optional)` : t("Password")}</Label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!selectedUser}
                />
              </div>

              {selectedUser && (
                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(c) => setFormData({ ...formData, isActive: c })}
                  />
                  <Label htmlFor="isActive">{t("Active")}</Label>
                </div>
              )}

              <div className="pt-4 space-y-3">
                <Label className="text-base">{t("Roles")}</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {roles.map((role) => (
                    <div
                      key={role.id}
                      className={`flex items-start space-x-2 p-3 rounded-md border text-sm cursor-pointer transition-colors ${formData.roles.includes(role.id) ? "bg-primary/10 border-primary shadow-sm" : "hover:bg-muted"}`}
                      onClick={() => handleToggleRole(role.id)}
                    >
                      <div>
                        <div className="font-semibold">{role.name}</div>
                        <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {role.permissions
                            .slice(0, 3)
                            .map((p) => p.name)
                            .join(", ")}
                          {role.permissions.length > 3
                            ? ` +${role.permissions.length - 3} more`
                            : ""}
                        </div>
                      </div>
                    </div>
                  ))}
                  {roles.length === 0 && (
                    <div className="text-sm text-muted-foreground col-span-2">
                      No roles available in the system yet.
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter className="pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditModalOpen(false);
                    setAddModalOpen(false);
                  }}
                >
                  {t("Cancel")}
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isPending ? t("Updating") : t("Save")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
