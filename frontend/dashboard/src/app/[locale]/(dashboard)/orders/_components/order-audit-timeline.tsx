import { Link } from '@i18n/navigation';
import type { AuditLogEntry } from '@findeg/backend/features/administration';
import { Card, CardContent, CardHeader, CardTitle } from '@findeg/ui';
import { Badge } from '@findeg/ui';
import { getOrderStatusLabel, normalizeOrderStatus } from '@findeg/backend/features/order';

interface OrderAuditTimelineProps {
  orderId: number | string;
  logs: AuditLogEntry[];
}

/**
 *
 */
function formatDate(value: Date): string {
  return new Date(value).toLocaleString();
}

/**
 *
 */
function safeJson(value: unknown): string {
  try {
    return JSON.stringify(value ?? {}, null, 2);
  } catch {
    return '{}';
  }
}

/**
 *
 */
function maybeOrderStatus(value: unknown): string | undefined {
  if (typeof value !== 'string' || value.length === 0) return undefined;
  return getOrderStatusLabel(normalizeOrderStatus(value));
}

/**
 *
 */
export function OrderAuditTimeline({ orderId, logs }: OrderAuditTimelineProps) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Audit Timeline</CardTitle>
        <Link
          href={`/audit-log?entityType=order&entityId=${orderId}`}
          className="text-xs text-primary underline-offset-4 hover:underline"
        >
          Open full audit log
        </Link>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No audit entries recorded for this order yet.
          </p>
        ) : (
          <div className="space-y-4">
            {logs.slice(0, 20).map((log) => {
              const oldStatus = maybeOrderStatus(log.oldValues?.status);
              const newStatus = maybeOrderStatus(log.newValues?.status);
              const trackingNumber =
                typeof log.newValues?.trackingNumber === 'string'
                  ? log.newValues.trackingNumber
                  : '';

              return (
                <div key={log.id} className="rounded-md border p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <Badge variant="outline">{log.action}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(log.createdAt)}
                    </span>
                  </div>

                  <div className="space-y-1 text-sm">
                    {oldStatus && newStatus ? (
                      <p>
                        Status: <span className="font-medium">{oldStatus}</span> to{' '}
                        <span className="font-medium">{newStatus}</span>
                      </p>
                    ) : null}
                    {trackingNumber ? (
                      <p>
                        Tracking: <span className="font-medium">{trackingNumber}</span>
                      </p>
                    ) : null}
                  </div>

                  <details className="mt-2">
                    <summary className="cursor-pointer text-xs text-muted-foreground">
                      View payload
                    </summary>
                    <div className="mt-2 grid gap-2 md:grid-cols-2">
                      <pre className="overflow-x-auto rounded bg-muted p-2 text-xs">
                        {safeJson(log.oldValues)}
                      </pre>
                      <pre className="overflow-x-auto rounded bg-muted p-2 text-xs">
                        {safeJson(log.newValues)}
                      </pre>
                    </div>
                  </details>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
