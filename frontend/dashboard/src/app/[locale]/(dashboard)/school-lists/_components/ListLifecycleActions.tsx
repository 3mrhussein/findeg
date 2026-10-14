'use client';
import { useActionError } from '@hooks/use-action-error';

import { useEffect, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@i18n/navigation';
import { Button } from '@findeg/ui';
import { Copy, Archive } from 'lucide-react';
import type { SupplyListStatus } from '@findeg/domain';
import { cloneListAction, archiveListAction } from '../_actions/lists';

interface ListLifecycleActionsProps {
  listId: number;
  status: SupplyListStatus;
  partnerStatus: string;
  canEdit: boolean;
}

export function ListLifecycleActions({
  listId,
  status,
  partnerStatus,
  canEdit,
}: ListLifecycleActionsProps) {
  const t = useTranslations('SchoolLists');
  const translateError = useActionError('SchoolLists.Errors');
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isPartnerClosed = partnerStatus === 'closed';

  const handleClone = () => {
    setActionError(null);
    startTransition(async () => {
      const res = await cloneListAction(listId);
      if (res.status === 'error') {
        setActionError(res.message || 'unknown');
      } else if (res.status === 'success' && res.data) {
        router.push(`/school-lists/${res.data.id}`);
      }
    });
  };

  const handleArchive = () => {
    setActionError(null);
    startTransition(async () => {
      const res = await archiveListAction(listId);
      if (res.status === 'error') {
        setActionError(res.message || 'unknown');
      } else if (res.status === 'success') {
        router.refresh();
      }
    });
  };

  if (!canEdit || status === 'draft') {
    return actionError ? (
      <div
        className="rounded-md bg-destructive/15 p-4 text-sm text-destructive"
        data-testid="lifecycle-error-alert"
      >
        {translateError(actionError)}
      </div>
    ) : null;
  }

  return (
    <div
      className="flex flex-col gap-2"
      data-testid="list-lifecycle-actions"
      data-hydrated={mounted ? 'true' : 'false'}
    >
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleClone}
          disabled={!mounted || isPending || isPartnerClosed}
          data-testid="clone-list-btn"
        >
          <Copy className="me-1 h-4 w-4" />
          {isPending ? t('Cloning') : t('Clone')}
        </Button>

        {status === 'published' && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleArchive}
            disabled={!mounted || isPending}
            data-testid="archive-list-btn"
          >
            <Archive className="me-1 h-4 w-4" />
            {isPending ? t('Archiving') : t('Archive')}
          </Button>
        )}
      </div>

      {actionError && (
        <div
          className="rounded-md bg-destructive/15 p-4 text-sm text-destructive"
          data-testid="lifecycle-error-alert"
        >
          {translateError(actionError)}
        </div>
      )}
    </div>
  );
}
