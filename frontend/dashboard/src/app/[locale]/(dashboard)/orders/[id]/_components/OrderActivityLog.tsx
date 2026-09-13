'use client';

import { formatDistanceToNow } from 'date-fns';
import { CircleDot, History, Package, CreditCard, User, Settings, AlertCircle } from 'lucide-react';

interface AuditLogEntry {
  id: number;
  action: string;
  adminId?: number;
  adminName?: string;
  oldValue?: string;
  newValue?: string;
  createdAt: Date;
}

interface OrderActivityLogProps {
  logs: any[];
}

/**
 *
 */
const getActionIcon = (action: string) => {
  const lowerAction = action.toLowerCase();
  if (lowerAction.includes('status') || lowerAction.includes('update'))
    return <Package className="w-4 h-4" />;
  if (lowerAction.includes('payment')) return <CreditCard className="w-4 h-4" />;
  if (lowerAction.includes('customer')) return <User className="w-4 h-4" />;
  return <Settings className="w-4 h-4" />;
};

/**
 *
 */
export function OrderActivityLog({ logs }: OrderActivityLogProps) {
  if (!logs || logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border rounded-lg bg-muted/20 text-muted-foreground">
        <History className="w-8 h-8 mb-2 opacity-20" />
        <p className="text-sm">No recent activity found for this order.</p>
      </div>
    );
  }

  // Sort logs by createdAt descending
  const sortedLogs = [...logs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px before:h-full before:w-0.5 before:bg-linear-to-b before:from-muted before:via-muted before:to-transparent">
      {sortedLogs.map((log, index) => {
        const date = new Date(log.createdAt);
        const actionLabel = log.action
          .replace(/_/g, ' ')
          .replace(
            /\w\S*/g,
            (txt: string) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(),
          );

        return (
          <div key={log.id || index} className="relative flex items-start gap-6 group">
            <div className="absolute left-0 mt-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-background ring-4 ring-background border shadow-sm z-10 group-hover:border-primary transition-colors">
              {getActionIcon(log.action)}
            </div>

            <div className="bg-card border rounded-lg p-3 ml-2 flex-1 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-sm text-foreground">{actionLabel}</span>
                <span className="text-[10px] text-muted-foreground tabular-nums">
                  {formatDistanceToNow(date, { addSuffix: true })}
                </span>
              </div>

              <div className="text-sm text-muted-foreground">
                {log.oldValue && log.newValue ? (
                  <p>
                    Changed from <span className="font-medium text-foreground">{log.oldValue}</span>{' '}
                    to <span className="font-medium text-primary">{log.newValue}</span>
                  </p>
                ) : (
                  <p>{log.newValue || log.action}</p>
                )}
              </div>

              {log.adminName && (
                <div className="mt-2 pt-2 border-t border-dashed flex items-center gap-1.5 ">
                  <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-2.5 h-2.5 text-primary" />
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground">
                    Action by {log.adminName}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
