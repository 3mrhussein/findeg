'use client';
import { useActionError } from '@hooks/use-action-error';

import { useActionState, useEffect, useState } from 'react';
import { useRouter } from '@i18n/navigation';
import { useTranslations } from 'next-intl';
import { Button, Input, Label, Textarea } from '@findeg/ui';
import { createDraftAction, type ActionState } from '../_actions/lists';

interface PartnerOption {
  id: number;
  nameEn: string;
  nameAr: string;
  status: string;
}

interface NewDraftFormProps {
  partners: PartnerOption[];
  locale: string;
}

const initialState: ActionState<{ id: number }> = { status: 'idle' };

export function NewDraftForm({ partners, locale }: NewDraftFormProps) {
  const router = useRouter();
  const t = useTranslations('SchoolLists');
  const actionError = useActionError('SchoolLists.Errors');
  const [state, formAction, isPending] = useActionState(createDraftAction, initialState);
  const [clientError, setClientError] = useState<string | null>(null);

  useEffect(() => {
    if (state.status === 'success' && state.data?.id) {
      router.push(`/school-lists/${state.data.id}`);
    }
  }, [state, router]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const formData = new FormData(e.currentTarget);
    const titleEn = String(formData.get('titleEn') ?? '').trim();
    const titleAr = String(formData.get('titleAr') ?? '').trim();
    if (!titleEn && !titleAr) {
      e.preventDefault();
      setClientError('invalid-input');
      return;
    }
    setClientError(null);
  };

  return (
    <form
      action={formAction}
      onSubmit={handleSubmit}
      className="space-y-6 max-w-2xl"
      data-testid="new-draft-form"
    >
      {(clientError || state.status === 'error') && (
        <div
          className="rounded-md bg-destructive/15 p-4 text-sm text-destructive"
          data-testid="draft-error-alert"
        >
          {actionError(clientError || state.message)}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="businessPartnerId">{t('Partner')}</Label>
        <select
          id="businessPartnerId"
          name="businessPartnerId"
          required
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          data-testid="partner-select"
        >
          <option value="">{t('SelectPartner')}</option>
          {partners.map((partner) => {
            const name =
              locale === 'ar' ? partner.nameAr || partner.nameEn : partner.nameEn || partner.nameAr;
            return (
              <option key={partner.id} value={partner.id}>
                {name}
              </option>
            );
          })}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="academicYear">{t('AcademicYear')}</Label>
          <Input
            id="academicYear"
            name="academicYear"
            required
            placeholder="2026-2027"
            data-testid="academic-year-input"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="grade">{t('Grade')}</Label>
          <Input id="grade" name="grade" required placeholder="Grade 1" data-testid="grade-input" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="titleEn">{t('TitleEn')}</Label>
          <Input id="titleEn" name="titleEn" dir="ltr" data-testid="title-en-input" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="titleAr">{t('TitleAr')}</Label>
          <Input id="titleAr" name="titleAr" dir="rtl" data-testid="title-ar-input" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="descriptionEn">{t('DescriptionEn')}</Label>
        <Textarea id="descriptionEn" name="descriptionEn" dir="ltr" data-testid="desc-en-input" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="descriptionAr">{t('DescriptionAr')}</Label>
        <Textarea id="descriptionAr" name="descriptionAr" dir="rtl" data-testid="desc-ar-input" />
      </div>

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={isPending} data-testid="create-draft-submit-btn">
          {t('CreateDraft')}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/school-lists')}
          data-testid="cancel-btn"
        >
          {t('Cancel')}
        </Button>
      </div>
    </form>
  );
}
