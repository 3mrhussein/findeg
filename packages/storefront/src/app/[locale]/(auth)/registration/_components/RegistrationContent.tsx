"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Container } from "@findeg/ui";
import { Button } from "@findeg/ui";
import { Icon } from "@findeg/ui";
import { RegistrationForm } from "./RegistrationForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@findeg/ui";
import { Link } from "@/i18n/navigation";
import { Logo } from "@findeg/ui";

/**
 * Registration view content component.
 */
export const RegistrationContent: React.FC = () => {
  const t = useTranslations();

  return (
    <div className="bg-muted py-16 lg:py-24 w-full flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
      <div className="mb-8">
        <Logo />
      </div>
      <Container>
        <Card className="max-w-md mx-auto w-full shadow-lg">
          <CardHeader className="text-center space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight">
              {t("Pages.Auth.RegistrationTitle")}
            </CardTitle>
            <CardDescription>
              {t("Pages.Auth.HaveAccount")}{" "}
              <Link href="/login" className="text-primary hover:underline font-medium ml-1">
                {t("Pages.Auth.SigninLink")}
              </Link>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RegistrationForm />

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  {t("Pages.Auth.SocialPrompt") || "Or continue with"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="w-full">
                <Icon name="google" className="mr-2 h-4 w-4" />
                Google
              </Button>
              <Button variant="outline" className="w-full">
                <Icon name="facebook" className="mr-2 h-4 w-4" />
                Facebook
              </Button>
            </div>
          </CardContent>
        </Card>
      </Container>
    </div>
  );
};
