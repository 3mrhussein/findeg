"use client";

import { useTranslations } from "next-intl";
import { Lock, UserCircle, LogIn, UserPlus } from "lucide-react";
import { Button } from "@ui";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@ui";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

interface SchoolAuthWallProps {
  schoolName?: string;
  listTitle?: string;
}

/**
 * SchoolAuthWall
 *
 * A context-aware authentication gate for school lists and profiles.
 * Renders BEFORE the content for unauthenticated users.
 */
export function SchoolAuthWall({ schoolName, listTitle }: SchoolAuthWallProps) {
  const t = useTranslations("School.AuthWall");
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const callbackUrl = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="w-full max-w-md border-2 border-primary/10 shadow-xl overflow-hidden">
        <div className="bg-primary/5 p-8 flex flex-col items-center border-b border-primary/5">
          <div className="relative mb-4">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-primary-foreground rounded-full blur opacity-25" />
            <div className="relative bg-background rounded-full p-4 border shadow-sm">
              <Lock className="w-10 h-10 text-primary" />
            </div>
          </div>

          <CardTitle className="text-2xl text-center mb-2">
            {schoolName ? (
              <span className="block text-xl text-muted-foreground mb-1">{schoolName}</span>
            ) : null}
            {listTitle || t("title")}
          </CardTitle>
          <CardDescription className="text-center text-base">{t("description")}</CardDescription>
        </div>

        <CardContent className="p-8">
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <Button asChild size="lg" className="w-full gap-2 text-base font-semibold">
                <Link href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}>
                  <LogIn className="w-4 h-4" />
                  {t("signIn")}
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full gap-2 text-base font-semibold"
              >
                <Link href={`/register?callbackUrl=${encodeURIComponent(callbackUrl)}`}>
                  <UserPlus className="w-4 h-4" />
                  {t("createAccount")}
                </Link>
              </Button>
            </div>

            <div className="pt-4 border-t border-muted text-center text-sm text-muted-foreground italic">
              {t("whyLogin")}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
