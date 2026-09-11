import 'server-only';
import { redirect } from 'next/navigation';
import { signInBrowserSession } from './session';
import type { Portal } from '@findeg/runtime';

export async function SignInForm({
  locale,
  portal,
  failed,
}: {
  locale: string;
  portal: Portal;
  failed: boolean;
}) {
  async function signIn(form: FormData) {
    'use server';
    const email = form.get('email');
    const password = form.get('password');
    if (typeof email !== 'string' || typeof password !== 'string') return;
    const status = await signInBrowserSession(email, password);
    const path = portal === 'storefront' ? `/${locale}` : `/${locale}/${portal}`;
    if (status !== 'authenticated') redirect(`${path}/sign-in?failed=1`);
    redirect(path);
  }
  return (
    <form action={signIn} className="sign-in">
      {failed && (
        <p role="alert">
          {locale === 'ar'
            ? 'تعذر تسجيل الدخول. تحقق من بياناتك.'
            : 'Unable to sign in. Check your credentials.'}
        </p>
      )}
      <label>
        {locale === 'ar' ? 'البريد الإلكتروني' : 'Email'}
        <input name="email" type="email" autoComplete="username" required maxLength={255} />
      </label>
      <label>
        {locale === 'ar' ? 'كلمة المرور' : 'Password'}
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          maxLength={72}
        />
      </label>
      <button type="submit">{locale === 'ar' ? 'تسجيل الدخول' : 'Sign in'}</button>
    </form>
  );
}
