import type { Locale } from '@findeg/domain';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@findeg/ui';
import { Button } from '@findeg/ui';
import { Input } from '@findeg/ui';
import { Label } from '@findeg/ui';
import { getUserProfile } from '@data/user/queries';
import { requireAuth } from '@lib/auth-guard';
import { updateProfileAction } from '@data/user/actions';

type Props = {
  params: Promise<{ locale: Locale }>;
};

/**
 * User Settings Page
 */
export default async function SettingsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Pages.MyAccount' });
  const tCommon = await getTranslations({ locale, namespace: 'Common' });
  const session = await requireAuth(locale);
  const user = await getUserProfile(session.userId);

  const storedName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">{t('Settings')}</h1>
        <p className="text-muted-foreground">{t('SettingsDescription')}</p>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>{t('AccountDetails')}</CardTitle>
            <CardDescription>{t('UpdatePersonalInfo')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              action={async (formData) => {
                'use server';
                await updateProfileAction(formData);
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="email">{t('EmailLabel')}</Label>
                <Input id="email" value={user.email} disabled />
                <p className="text-xs text-muted-foreground">{t('EmailCannotChange')}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">{t('NameLabel')}</Label>
                <Input id="name" name="name" defaultValue={storedName} minLength={2} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">{t('PhoneLabel')}</Label>
                <Input
                  id="phone"
                  name="phone"
                  defaultValue={user.phone || ''}
                  placeholder="+20 10 1234 5678"
                />
              </div>
              <Button type="submit">{tCommon('Save')}</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
