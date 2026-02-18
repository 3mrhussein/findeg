"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/common/Icon";
import { RegistrationForm } from "@/features/identity/presentation/components/RegistrationForm";
import { LoginForm } from "@/features/identity/presentation/components/LoginForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/**
 *
 */
export const RegistrationContent: React.FC = () => {
  const t = useTranslations();
  const [isLoginView, setIsLoginView] = useState(false);

  return (
    <div className="bg-muted py-16 lg:py-24 w-full flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <Container>
        <Card className="max-w-md mx-auto w-full shadow-lg">
          <CardHeader className="text-center space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight">
              {isLoginView ? t("Pages.Auth.LoginTitle") : t("Pages.Auth.RegistrationTitle")}
            </CardTitle>
            <CardDescription>
              {isLoginView ? t("Pages.Auth.NoAccount") : t("Pages.Auth.HaveAccount")}{" "}
              <button
                onClick={() => setIsLoginView(!isLoginView)}
                data-testid={isLoginView ? "switch-to-signup" : "switch-to-signin"}
                className="text-primary hover:underline font-medium ml-1"
              >
                {isLoginView ? t("Pages.Auth.SignupLink") : t("Pages.Auth.SigninLink")}
              </button>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoginView ? <LoginForm /> : <RegistrationForm />}

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
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
