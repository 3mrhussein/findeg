import { redirect } from 'next/navigation';
export default async function OpenList({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  async function open(form: FormData) {
    'use server';
    const code = String(form.get('code') ?? '').trim();
    if (/^[a-zA-Z0-9_-]{16,128}$/.test(code))
      redirect(`/${locale}/lists/${encodeURIComponent(code)}`);
  }
  return (
    <form action={open}>
      <h1>{locale === 'ar' ? 'افتح قائمة المدرسة' : 'Open a school list'}</h1>
      <label>
        {locale === 'ar' ? 'رمز القائمة' : 'List code'}
        <input name="code" required minLength={16} maxLength={128} pattern="[a-zA-Z0-9_-]+" />
      </label>
      <button type="submit">{locale === 'ar' ? 'فتح القائمة' : 'Open list'}</button>
    </form>
  );
}
