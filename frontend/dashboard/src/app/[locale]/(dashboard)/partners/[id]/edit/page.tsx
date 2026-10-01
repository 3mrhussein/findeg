import { notFound } from 'next/navigation';
import type { Locale } from 'next-intl';
import { requirePermission } from '@lib/auth-guard';
import { PERMISSION_CODES } from '@findeg/backend/features/core';
import { createPartnerMembershipServices } from '@findeg/backend/features/partner-membership';
import { PartnerForm } from '../../_components/PartnerForm';
import { toStaffActor } from '../../_lib/toStaffActor';

export const metadata = {
  title: 'Edit Business Partner - FindEg Admins',
};

export default async function EditPartnerPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const session = await requirePermission(locale as Locale, {
    permission: PERMISSION_CODES.PARTNERS_MANAGE,
  });

  const partnerId = Number(id);
  if (!Number.isInteger(partnerId)) notFound();

  const { partners } = createPartnerMembershipServices();
  const result = await partners.getPartner(toStaffActor(session), partnerId);
  if (!result.success) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Edit {result.data.nameEn}</h1>
      <PartnerForm partner={result.data} />
    </div>
  );
}
