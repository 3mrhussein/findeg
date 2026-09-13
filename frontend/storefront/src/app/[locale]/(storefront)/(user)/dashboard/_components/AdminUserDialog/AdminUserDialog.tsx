'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@findeg/ui';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@findeg/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@findeg/ui';
import { Icon } from '@findeg/ui';
import type {
  AdminUser,
  AdminUserDialogProps,
  OverrideAction,
  Role,
  Permission,
} from './AdminUserDialog.interface';
import { ProfileTab } from './ProfileTab';
import { RolesTab } from './RolesTab';
import { OverridesTab } from './OverridesTab';
import { getSystemRoles, getAllPermissions } from '@data/access/queries';
import {
  createAdminAction,
  updateAdminAction,
  setPermissionOverridesAction,
} from '@data/access/actions';

/**
 * AdminUserDialog — create / edit admin users with Profile, Roles, and Override tabs.
 */
export function AdminUserDialog({
  open,
  user,
  defaultTab = 'profile',
  onClose,
}: AdminUserDialogProps) {
  const t = useTranslations('Pages.Dashboard');
  const isEdit = user !== null;

  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);
  const [overrides, setOverrides] = useState<Map<number, OverrideAction>>(new Map());

  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load roles and permissions whenever dialog opens
  useEffect(() => {
    if (!open) return;

    Promise.all([getSystemRoles(), getAllPermissions()]).then(([roleData, permData]) => {
      setRoles(roleData as any);
      setPermissions(permData as any);
    });

    if (user) {
      Promise.resolve().then(() => {
        setEmail(user.email);
        setFirstName(user.firstName ?? '');
        setLastName(user.lastName ?? '');
        setIsActive(user.isActive);
        setSelectedRoleIds(user.roles.map((r) => r.id));
      });
      // Code-based overrides — resolved to id-based below
      const map = new Map<number, OverrideAction>();
      user.permissionOverrides.forEach(({ permissionCode, action }) => {
        map.set(permissionCode as unknown as number, action as OverrideAction);
      });
      Promise.resolve().then(() => {
        setOverrides(map);
      });
    } else {
      Promise.resolve().then(() => {
        setEmail('');
        setFirstName('');
        setLastName('');
        setPassword('');
        setIsActive(true);
        setSelectedRoleIds([]);
      });
      Promise.resolve().then(() => {
        setOverrides(new Map());
      });
    }
  }, [open, user]);

  // Convert code-keyed overrides to id-keyed once permissions are loaded
  useEffect(() => {
    if (!user || permissions.length === 0) return;
    const map = new Map<number, OverrideAction>();
    user.permissionOverrides.forEach(({ permissionCode, action }) => {
      const perm = permissions.find((p) => p.code === permissionCode);
      if (perm) map.set(perm.id, action as OverrideAction);
    });
    Promise.resolve().then(() => {
      setOverrides(map);
    });
  }, [permissions, user]);

  /**
   *
   */
  const toggleRole = (roleId: number) => {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId],
    );
  };

  /**
   *
   */
  const cycleOverride = (permId: number) => {
    setOverrides((prev) => {
      const current = prev.get(permId) ?? 'default';
      const next: OverrideAction =
        current === 'default' ? 'grant' : current === 'grant' ? 'revoke' : 'default';
      const newMap = new Map(prev);
      if (next === 'default') newMap.delete(permId);
      else newMap.set(permId, next);
      return newMap;
    });
  };

  /**
   *
   */
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      if (isEdit && user) {
        const updateResult = await updateAdminAction(user.id, {
          firstName,
          lastName,
          isActive,
          roleIds: selectedRoleIds,
        });
        if (!updateResult.success) throw new Error(updateResult.error || 'Update failed');

        const grantIds = Array.from(overrides.entries())
          .filter(([_, action]) => action === 'grant')
          .map(([id, _]) => id);

        // Note: setPermissionOverridesAction currently only supports grant list.
        // If revoke is needed, the action/service needs to be updated.
        await setPermissionOverridesAction(user.id, grantIds);
      } else {
        const createResult = await createAdminAction({
          email,
          firstName,
          lastName,
          password,
          roleIds: selectedRoleIds,
        });
        if (!createResult.success) throw new Error(createResult.error || 'Create failed');
      }
      onClose(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? t('EditAdmin') : t('NewAdmin')}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue={defaultTab}>
          <TabsList className="w-full mb-4">
            <TabsTrigger value="profile" className="flex-1">
              {t('Profile')}
            </TabsTrigger>
            <TabsTrigger value="roles" className="flex-1">
              {t('Roles')}
            </TabsTrigger>
            {isEdit && (
              <TabsTrigger value="overrides" className="flex-1">
                {t('Overrides')}
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <ProfileTab
              isEdit={isEdit}
              email={email}
              onEmailChange={setEmail}
              firstName={firstName}
              onFirstNameChange={setFirstName}
              lastName={lastName}
              onLastNameChange={setLastName}
              password={password}
              onPasswordChange={setPassword}
              isActive={isActive}
              onIsActiveChange={setIsActive}
            />
          </TabsContent>

          <TabsContent value="roles">
            <RolesTab roles={roles} selectedRoleIds={selectedRoleIds} onToggle={toggleRole} />
          </TabsContent>

          {isEdit && (
            <TabsContent value="overrides">
              <OverridesTab
                permissions={permissions}
                overrides={overrides}
                onCycle={cycleOverride}
              />
            </TabsContent>
          )}
        </Tabs>

        {error && <p className="text-sm text-destructive mt-2">{error}</p>}

        <DialogFooter>
          <Button variant="outline" onClick={() => onClose()}>
            {t('Cancel')}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && (
              <Icon name="progress_activity" className="w-4 h-4 ltr:mr-2 rtl:ml-2 animate-spin" />
            )}
            {t('Save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
