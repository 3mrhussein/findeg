"use client";

import { useTranslations } from "next-intl";
import { Input } from "@findeg/ui";
import { Label } from "@findeg/ui";
import { Switch } from "@findeg/ui";
import { Button } from "@findeg/ui";
import { Icon } from "@findeg/ui";
import { useState } from "react";

interface ProfileTabProps {
  isEdit: boolean;
  email: string;
  onEmailChange: (v: string) => void;
  firstName: string;
  onFirstNameChange: (v: string) => void;
  lastName: string;
  onLastNameChange: (v: string) => void;
  password: string;
  onPasswordChange: (v: string) => void;
  isActive: boolean;
  onIsActiveChange: (v: boolean) => void;
}

/**
 * Profile tab — name, email, password and active toggle fields.
 */
export function ProfileTab({
  isEdit,
  email,
  onEmailChange,
  firstName,
  onFirstNameChange,
  lastName,
  onLastNameChange,
  password,
  onPasswordChange,
  isActive,
  onIsActiveChange,
}: ProfileTabProps) {
  const t = useTranslations("Pages.Dashboard");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-4">
      {!isEdit && (
        <div className="space-y-1.5">
          <Label>{t("AdminEmail")}</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="admin@example.com"
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>{t("FirstName")}</Label>
          <Input value={firstName} onChange={(e) => onFirstNameChange(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>{t("LastName")}</Label>
          <Input value={lastName} onChange={(e) => onLastNameChange(e.target.value)} />
        </div>
      </div>

      {!isEdit && (
        <div className="space-y-1.5">
          <Label>{t("Password")}</Label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute top-0 ltr:right-0 rtl:left-0 h-full"
              onClick={() => setShowPassword((v) => !v)}
            >
              <Icon name={showPassword ? "visibility_off" : "visibility"} className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {isEdit && (
        <div className="flex items-center gap-3 pt-2">
          <Switch id="isActive" checked={isActive} onCheckedChange={onIsActiveChange} />
          <Label htmlFor="isActive">{t("Active")}</Label>
        </div>
      )}
    </div>
  );
}
