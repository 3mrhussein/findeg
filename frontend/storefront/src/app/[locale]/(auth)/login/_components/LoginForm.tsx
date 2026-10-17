'use client';

import { safeReturnTarget } from '@lib/return-target';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from '@i18n/navigation';
import { Button } from '@findeg/ui';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@findeg/ui';
import { Input } from '@findeg/ui';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useUser } from '@hooks/useUser';

interface LoginResponseBody {
  success?: boolean;
  error?: {
    code?: 'INVALID_INPUT' | 'LOGIN_FAILED';
  };
}

/**
 *
 */
interface LoginFormProps {
  initialEmail?: string;
  emailLocked?: boolean;
  returnTo?: string;
}

export function LoginForm({ initialEmail = '', emailLocked = false, returnTo }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const t = useTranslations();
  const tValidation = useTranslations('Validation');
  const router = useRouter();
  const { refresh } = useUser();

  const formSchema = useMemo(
    () =>
      z.object({
        email: z.string().email({
          message: tValidation('EmailInvalid'),
        }),
        password: z.string().min(1, {
          message: tValidation('PasswordRequired'),
        }),
      }),
    [tValidation],
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: initialEmail,
      password: '',
    },
  });

  /**
   *
   */
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);
      setServerError(null);

      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: values.email.trim(),
          password: values.password,
        }),
      });

      const json = (await response.json().catch(() => null)) as LoginResponseBody | null;
      if (!response.ok || !json?.success) {
        const message =
          json?.error?.code === 'INVALID_INPUT'
            ? tValidation('RequestInvalid')
            : tValidation('LoginFailed');
        setServerError(message);
        return;
      }

      try {
        await refresh();
      } catch (err) {
        console.error('Failed to refresh user session after login:', err);
        setServerError(tValidation('LoginFailed'));
        return;
      }

      router.push(safeReturnTarget(returnTo));
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('Pages.Auth.Email')}</FormLabel>
              <FormControl>
                <Input
                  data-testid="login-email-input"
                  readOnly={emailLocked}
                  aria-readonly={emailLocked}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('Pages.Auth.Password')}</FormLabel>
              <FormControl>
                <Input type="password" data-testid="login-password-input" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {serverError ? (
          <p data-testid="login-server-error" className="text-sm text-destructive" role="alert">
            {serverError}
          </p>
        ) : null}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
          <span data-testid="login-submit-label">{t('Pages.Auth.ButtonLogin')}</span>
        </Button>
      </form>
    </Form>
  );
}
