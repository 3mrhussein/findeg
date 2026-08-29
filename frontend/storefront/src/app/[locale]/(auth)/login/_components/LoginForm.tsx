'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from '@i18n/navigation';
import { Button } from '@findeg/ui';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@findeg/ui';
import { Input } from '@findeg/ui';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { loginAction } from '@data/auth/actions';
const formSchema = z.object({
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  password: z.string().min(1, {
    message: 'Password is required.',
  }),
});

/**
 *
 */
export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const t = useTranslations();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
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

      const result = await loginAction(values.email, values.password);
      if (!result.success) {
        const message = result.error || t('Common.ErrorOccurred');
        setServerError(message);
        return;
      }

      router.push('/my-account');
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
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="m@example.com" data-testid="login-email-input" {...field} />
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
              <FormLabel>Password</FormLabel>
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
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <span data-testid="login-submit-label">{t('Pages.Auth.ButtonLogin')}</span>
        </Button>
      </form>
    </Form>
  );
}
