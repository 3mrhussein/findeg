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

interface RegisterResponseBody {
  success?: boolean;
  error?: {
    code?: 'INVALID_INPUT' | 'REGISTRATION_FAILED';
  };
}

/**
 * Splits a full name into first + last name parts.
 */
function splitName(name: string): { firstName?: string; lastName?: string } {
  const trimmed = name.trim();
  if (!trimmed) return {};

  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return { firstName: parts[0] };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  };
}

/**
 *
 */
interface RegistrationFormProps {
  initialEmail?: string;
  emailLocked?: boolean;
  returnTo?: string;
}

export function RegistrationForm({
  initialEmail = '',
  emailLocked = false,
  returnTo,
}: RegistrationFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const t = useTranslations();
  const tValidation = useTranslations('Validation');
  const router = useRouter();
  const { refresh } = useUser();

  const formSchema = useMemo(
    () =>
      z
        .object({
          name: z.string().min(2, {
            message: tValidation('NameMin'),
          }),
          email: z.string().email({
            message: tValidation('EmailInvalid'),
          }),
          password: z.string().min(8, {
            message: tValidation('PasswordMin'),
          }),
          confirmPassword: z.string(),
        })
        .refine((data) => data.password === data.confirmPassword, {
          message: tValidation('PasswordsDoNotMatch'),
          path: ['confirmPassword'],
        }),
    [tValidation],
  );

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: initialEmail,
      password: '',
      confirmPassword: '',
    },
  });

  /**
   *
   */
  async function onSubmit(values: FormValues) {
    try {
      setIsLoading(true);
      setServerError(null);

      const { firstName, lastName } = splitName(values.name);
      const response = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: values.email.trim(),
          password: values.password,
          firstName,
          lastName,
        }),
      });

      const json = (await response.json().catch(() => null)) as RegisterResponseBody | null;
      if (!response.ok || !json?.success) {
        const message =
          json?.error?.code === 'INVALID_INPUT'
            ? tValidation('RequestInvalid')
            : tValidation('RegistrationFailed');
        setServerError(message);
        return;
      }

      await refresh();
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('Pages.Auth.Name')}</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" data-testid="registration-name-input" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('Pages.Auth.Email')}</FormLabel>
              <FormControl>
                <Input
                  placeholder="m@example.com"
                  data-testid="registration-email-input"
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
                <Input type="password" data-testid="registration-password-input" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('Pages.Auth.ConfirmPassword')}</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  data-testid="registration-confirm-password-input"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {serverError ? (
          <p
            data-testid="registration-server-error"
            className="text-sm text-destructive"
            role="alert"
          >
            {serverError}
          </p>
        ) : null}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
          <span data-testid="registration-submit-label">{t('Pages.Auth.ButtonRegister')}</span>
        </Button>
      </form>
    </Form>
  );
}
