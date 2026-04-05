import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@findeg/ui";
import { Label } from "@findeg/ui";
import { Input } from "@findeg/ui";
import { Button } from "@findeg/ui";
import { getTranslations } from "next-intl/server";
import { loginAction } from "@/actions/auth-actions";
import { Locale } from "next-intl";

/**
 * Generate static params for supported locales
 */
export async function generateStaticParams() {
  return [{ locale: "en" }, { locale: "ar" }];
}

/**
 * Admin Login Page — /admin/login
 *
 * Renders inside the passthrough (admin) layout without the admin shell,
 * providing a centered card experience identical to the user login.
 */
export default async function AdminLoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: "Pages.Auth" });

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Admin Login</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access the dashboard
          </CardDescription>
        </CardHeader>
        {/* @ts-ignore - Server Action type mismatch due to return value */}
        <form action={loginAction}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="admin@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" type="submit">
              Sign In
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
