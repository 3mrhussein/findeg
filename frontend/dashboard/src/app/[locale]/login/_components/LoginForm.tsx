'use client';

import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@findeg/ui';
import { Label } from '@findeg/ui';
import { Input } from '@findeg/ui';
import { Button } from '@findeg/ui';
import { loginAction } from '@actions/auth-actions';

interface LoginFormProps {
  locale: string;
}

export function LoginForm({ locale }: LoginFormProps) {
  const t = useTranslations('Auth');
  const [state, formAction, isPending] = useActionState(loginAction, null);

  const errorMessage = state?.error ? t(`errors.${state.error}` as Parameters<typeof t>[0]) : null;

  return (
    <Card className="w-full max-w-md" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">{t('title')}</CardTitle>
        <CardDescription className="text-center">{t('description')}</CardDescription>
      </CardHeader>
      <form action={formAction}>
        <input type="hidden" name="locale" value={locale} />
        <CardContent className="space-y-4">
          {errorMessage ? (
            <div
              role="alert"
              className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400"
            >
              {errorMessage}
            </div>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="email">{t('emailLabel')}</Label>
            <Input id="email" name="email" type="email" placeholder="admin@findeg.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t('passwordLabel')}</Label>
            <Input id="password" name="password" type="password" required />
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" type="submit" disabled={isPending}>
            {isPending ? t('signingIn') : t('signIn')}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
