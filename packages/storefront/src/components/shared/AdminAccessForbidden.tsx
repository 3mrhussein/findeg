"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@findeg/ui";
import { Button } from "@findeg/ui";
import { Link } from "@/i18n/navigation";
import { ShieldAlert, LogIn, LayoutDashboard, Home } from "lucide-react";
import { logoutAction } from "@/features/identity/application/actions/auth";
import { useTranslations } from "next-intl";

/**
 *
 */
export function AdminAccessForbidden() {
  const t = useTranslations("Pages.MyAccount.AdminForbidden");

  return (
    <div className="flex min-h-[80vh] w-full items-center justify-center p-4">
      <Card className="max-w-md w-full border-2 border-amber-500/20 shadow-xl overflow-hidden">
        <div className="h-2 bg-amber-500 w-full" />
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
            <ShieldAlert className="h-10 w-10 text-amber-600 dark:text-amber-500" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">{t("Title")}</CardTitle>
          <CardDescription className="text-base mt-2">{t("Description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="rounded-lg bg-muted p-4 text-sm">
            <p className="font-medium mb-1">{t("WhyTitle")}</p>
            <p className="text-muted-foreground">{t("WhyText")}</p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 pb-8 px-8">
          <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
            <Button asChild variant="outline" className="w-full">
              <Link href="/admin">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                {t("AdminPanel")}
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                {t("StoreHome")}
              </Link>
            </Button>
          </div>

          <div className="w-full pt-2">
            <div className="relative mb-6 mt-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  {t("NeedUserAccount")}
                </span>
              </div>
            </div>

            <form action={logoutAction} className="w-full">
              <input type="hidden" name="redirectTo" value="/login" />
              <Button
                type="submit"
                variant="default"
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <LogIn className="mr-2 h-4 w-4" />
                {t("SwitchAccount")}
              </Button>
            </form>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
