import 'server-only';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getWebRuntime } from './runtime';
import { sessionCookie, sessionToken } from './session';

export async function SessionAccount({ locale }: { locale: string }) {
  const result = await getWebRuntime().currentSession(await sessionToken(), 'storefront');
  if (result.status !== 'authenticated')
    return <Link href={`/${locale}/sign-in`}>{locale === 'ar' ? 'تسجيل الدخول' : 'Sign in'}</Link>;
  async function signOut() {
    'use server';
    await getWebRuntime().signOut(await sessionToken());
    (await cookies()).delete(sessionCookie);
    redirect(`/${locale}`);
  }
  return (
    <form action={signOut}>
      <span>{result.session.email}</span>{' '}
      <button type="submit">{locale === 'ar' ? 'تسجيل الخروج' : 'Sign out'}</button>
    </form>
  );
}
