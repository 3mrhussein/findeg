'use client';
import { useActionError } from '@hooks/use-action-error';
import type { Locale } from '@findeg/domain';
import { GOVERNORATES, SCHOOL_TYPES, ACADEMIC_SYSTEMS } from '@findeg/domain';

import { useActionState, useEffect } from 'react';
import { Button, Input, Label } from '@findeg/ui';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@i18n/navigation';
import { savePartnerAction, type PartnerFormState } from '../_actions/partners';

interface PartnerFormProps {
  partner?: { id: number; code: string; nameEn: string; nameAr: string; status: string };
  profile?: {
    governorate: string | null;
    area: string | null;
    schoolType: string | null;
    academicSystem: string | null;
    logoUrl: string | null;
  } | null;
}

const initialState: PartnerFormState = { status: 'idle' };

/**
 * Create / edit form for a Business Partner and its Partner School Profile.
 * The code is read-only once the partner has left onboarding.
 */
export function PartnerForm({ partner, profile }: PartnerFormProps) {
  const router = useRouter();
  const locale = useLocale() as Locale;
  const t = useTranslations('Partners');
  const actionError = useActionError('Partners.Errors');
  const [state, formAction, isPending] = useActionState(
    savePartnerAction.bind(null, locale, partner?.id ?? null),
    initialState,
  );
  const codeLocked = partner !== undefined && partner.status !== 'onboarding';

  useEffect(() => {
    if (state.status === 'saved') router.push('/partners');
  }, [state, router]);

  return (
    <form action={formAction} className="max-w-xl space-y-6" data-testid="partner-form">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">{t('BasicDetails')}</h2>
        <div className="space-y-2">
          <Label htmlFor="code">{t('Code')}</Label>
          <Input
            id="code"
            name="code"
            defaultValue={partner?.code}
            readOnly={codeLocked}
            required
            dir="ltr"
            placeholder="nile-school"
          />
          <p className="text-sm text-muted-foreground">
            {t('CodeHelp')} {codeLocked ? t('CodeLocked') : t('CodeOnboarding')}
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="nameEn">{t('NameEn')}</Label>
          <Input id="nameEn" name="nameEn" defaultValue={partner?.nameEn} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nameAr">{t('NameAr')}</Label>
          <Input id="nameAr" name="nameAr" defaultValue={partner?.nameAr} required dir="rtl" />
        </div>
      </div>

      <div className="space-y-4 rounded-lg border p-4" data-testid="school-profile-section">
        <h2 className="text-lg font-semibold">{t('SchoolProfile')}</h2>
        <p className="text-sm text-muted-foreground">{t('SchoolProfileHelp')}</p>

        <div className="space-y-2">
          <Label htmlFor="governorate">{t('Governorate')}</Label>
          <select
            id="governorate"
            name="governorate"
            defaultValue={profile?.governorate ?? 'Cairo'}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            {GOVERNORATES.map((gov) => (
              <option key={gov} value={gov}>
                {gov}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="area">{t('Area')}</Label>
          <Input
            id="area"
            name="area"
            defaultValue={profile?.area ?? ''}
            placeholder="e.g. Maadi, New Cairo"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="schoolType">{t('SchoolType')}</Label>
            <select
              id="schoolType"
              name="schoolType"
              defaultValue={profile?.schoolType ?? 'Private'}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              {SCHOOL_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="academicSystem">{t('AcademicSystem')}</Label>
            <select
              id="academicSystem"
              name="academicSystem"
              defaultValue={profile?.academicSystem ?? 'National'}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              {ACADEMIC_SYSTEMS.map((system) => (
                <option key={system} value={system}>
                  {system}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="logoUrl">{t('LogoUrl')}</Label>
          <Input
            id="logoUrl"
            name="logoUrl"
            defaultValue={profile?.logoUrl ?? ''}
            placeholder="https://... or /logo.png"
            dir="ltr"
          />
        </div>
      </div>

      {state.status === 'error' && (
        <p role="alert" className="text-sm text-red-600">
          {actionError(state.message)}
        </p>
      )}
      <Button type="submit" disabled={isPending}>
        {partner ? t('SaveChanges') : t('New')}
      </Button>
    </form>
  );
}
