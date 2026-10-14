import type { Locale } from '@findeg/domain';
import { requirePermission } from '@lib/auth-guard';
import { PERMISSION_CODES } from '@findeg/identity/types';
import { PartnerForm } from '../_components/PartnerForm';

export const metadata = {
  title: 'New Business Partner - FindEg Admins',
};

export default async function NewPartnerPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  await requirePermission(locale as Locale, { permission: PERMISSION_CODES.PARTNERS_MANAGE });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">New Business Partner</h1>
      <PartnerForm />
    </div>
  );
}
