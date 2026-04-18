import { Locale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@ui";
import { Button } from "@ui";
import { Input } from "@ui";
import { Label } from "@ui";
import { getMyAccountData } from "@backend/features/identity/application/queries/my-account";

type Props = {
  params: Promise<{ locale: Locale }>;
};

/**
 * User Settings Page
 */
export default async function SettingsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Pages.MyAccount" });
  const userId = 1; // TODO: Get actual user ID from session
  const { user } = await getMyAccountData(userId);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">{t("Settings")}</h1>
        <p className="text-muted-foreground">{t("SettingsDescription")}</p>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
            <CardDescription>Update your personal information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" value={user.email} disabled />
              <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
            </div>
            {/* Additional settings can be added here */}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>Update your password and security settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline">Change Password</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
