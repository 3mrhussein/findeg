"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

/**
 * Secondary school-list discovery flow.
 */
export default function SchoolListsTemplate() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCode = searchParams.get("code") ?? "";
  const [listCode, setListCode] = useState(initialCode);

  /**
   * Routes school list input into search flow as a non-blocking utility.
   */
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = listCode.trim();
    if (!normalized) {
      return;
    }

    router.push(`/search?q=${encodeURIComponent(normalized)}`);
  };

  return (
    <div className="bg-muted/50 min-h-[60vh]">
      <Container className="py-12 lg:py-16 space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h1 className="text-4xl font-bold">{t("Pages.SchoolLists.Title")}</h1>
          <p className="text-muted-foreground">{t("Pages.SchoolLists.Subtitle")}</p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>{t("Pages.SchoolLists.FormTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <Input
                value={listCode}
                onChange={(event) => setListCode(event.target.value)}
                placeholder={t("Pages.SchoolLists.Placeholder")}
              />
              <div className="flex flex-col sm:flex-row gap-3">
                <Button type="submit" className="sm:flex-1">
                  {t("Pages.SchoolLists.Submit")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="sm:flex-1"
                  onClick={() => router.push("/shop")}
                >
                  {t("Pages.SchoolLists.BackToShop")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </Container>
    </div>
  );
}
