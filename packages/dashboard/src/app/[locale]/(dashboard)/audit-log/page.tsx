/**
 * Admin Dashboard - Audit Log
 */

import { getAuditLogs } from "@data/admin/queries";
import { format } from "date-fns";
import { Link } from "@i18n/navigation";
import { Input } from "@ui";
import { Button } from "@ui";
import { Badge } from "@ui";

const LIMIT = 50;

/**
 *
 */
function buildEntityHref(entityType: string, entityId: string): string | null {
  switch (entityType) {
    case "product":
      return `/products/${entityId}/edit`;
    case "category":
      return `/categories/${entityId}/edit`;
    case "order":
      return `/orders/${entityId}`;
    case "brand":
      return "/brands";
    default:
      return null;
  }
}

/**
 *
 */
function safeJson(value: unknown): string {
  try {
    const json = JSON.stringify(value ?? {}, null, 2);
    if (json.length > 1200) return `${json.slice(0, 1200)}\n...`;
    return json;
  } catch {
    return "{}";
  }
}

/**
 *
 */
export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    entityType?: string;
    action?: string;
    entityId?: string;
  }>;
}) {
  const { page: pageParam, entityType = "", action = "", entityId = "" } = await searchParams;
  const page = Number(pageParam) || 1;

  const { data: logs, total } = await getAuditLogs({
    entityType: entityType || undefined,
    action: action || undefined,
    entityId: entityId || undefined,
    limit: LIMIT,
    offset: (page - 1) * LIMIT,
  });

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Audit Log</h1>

      <form className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-4">
        <Input
          name="entityType"
          placeholder="Entity type (product/order/...)"
          defaultValue={entityType}
        />
        <Input name="action" placeholder="Action (create/update/delete)" defaultValue={action} />
        <Input name="entityId" placeholder="Entity ID" defaultValue={entityId} />
        <div className="flex gap-2">
          <Button type="submit" className="flex-1">
            Apply Filters
          </Button>
          <Button asChild type="button" variant="outline" className="flex-1">
            <Link href="/audit-log">Reset</Link>
          </Button>
        </div>
      </form>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Timestamp
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Admin
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Entity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Link
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {logs.map((log) => (
              <tr key={log.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(log.createdAt), "yyyy-MM-dd HH:mm:ss")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {log.adminUserId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                  <Badge variant="outline">{log.action}</Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {log.entityType} #{log.entityId}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <details>
                    <summary className="cursor-pointer underline decoration-dotted">
                      View Changes
                    </summary>
                    <div className="mt-2 space-y-2">
                      <div>
                        <div className="text-xs uppercase text-gray-400">Old</div>
                        <pre className="max-w-[480px] overflow-x-auto rounded bg-gray-50 p-2 text-xs">
                          {safeJson(log.oldValues)}
                        </pre>
                      </div>
                      <div>
                        <div className="text-xs uppercase text-gray-400">New</div>
                        <pre className="max-w-[480px] overflow-x-auto rounded bg-gray-50 p-2 text-xs">
                          {safeJson(log.newValues)}
                        </pre>
                      </div>
                    </div>
                  </details>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {buildEntityHref(log.entityType, log.entityId) ? (
                    <Link
                      href={buildEntityHref(log.entityType, log.entityId)!}
                      className="text-blue-600 hover:underline"
                    >
                      Open
                    </Link>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            ))}
            {logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-500">
                  No audit entries found for current filters.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Showing {(page - 1) * LIMIT + 1}-{Math.min(page * LIMIT, total)} of {total}
        </p>
        <div className="flex gap-2">
          {page <= 1 ? (
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
          ) : (
            <Button asChild variant="outline" size="sm">
              <Link
                href={{
                  pathname: "/audit-log",
                  query: {
                    page: Math.max(1, page - 1).toString(),
                    entityType: entityType || undefined,
                    action: action || undefined,
                    entityId: entityId || undefined,
                  },
                }}
              >
                Previous
              </Link>
            </Button>
          )}
          {page >= totalPages ? (
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          ) : (
            <Button asChild variant="outline" size="sm">
              <Link
                href={{
                  pathname: "/audit-log",
                  query: {
                    page: Math.min(totalPages, page + 1).toString(),
                    entityType: entityType || undefined,
                    action: action || undefined,
                    entityId: entityId || undefined,
                  },
                }}
              >
                Next
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
