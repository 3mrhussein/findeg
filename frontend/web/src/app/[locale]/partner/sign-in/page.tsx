export default async function SignIn({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <p>
      {locale === 'ar'
        ? 'تسجيل الدخول غير متاح حاليًا. يرجى المحاولة لاحقًا.'
        : 'Sign-in is currently unavailable. Please try again later.'}
    </p>
  );
}
