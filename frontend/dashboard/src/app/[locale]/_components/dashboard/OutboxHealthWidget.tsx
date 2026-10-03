'use client';

import * as React from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@findeg/ui';
import { useTranslations } from 'next-intl';
import { retryOutboxAction } from '@actions/outbox-actions';

export interface ExhaustedOutboxRow {
  id: string;
  kind: string;
  lastError: string | null;
}

interface OutboxHealthWidgetProps {
  exhaustedCount: number;
  rows: ExhaustedOutboxRow[];
}

export function OutboxHealthWidget({ exhaustedCount, rows }: OutboxHealthWidgetProps) {
  const t = useTranslations('Administration.Dashboard');
  const [pending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);

  const retry = (id: string) =>
    startTransition(async () => {
      const result = await retryOutboxAction(id);
      setError(result.success ? null : t('OutboxRetryFailed'));
    });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('OutboxTitle')}</CardTitle>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t('OutboxExhausted', { count: exhaustedCount })}
        </p>
      </CardHeader>
      {rows.length > 0 && (
        <CardContent className="space-y-2">
          {rows.map((row) => (
            <div key={row.id} className="flex items-center justify-between gap-3 text-sm">
              <div className="min-w-0">
                <p className="truncate font-mono">{row.id}</p>
                {row.lastError && (
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                    {row.lastError}
                  </p>
                )}
              </div>
              <Button size="sm" variant="outline" disabled={pending} onClick={() => retry(row.id)}>
                {t('OutboxRetry')}
              </Button>
            </div>
          ))}
          {error && <p className="text-xs text-red-600">{error}</p>}
        </CardContent>
      )}
    </Card>
  );
}
