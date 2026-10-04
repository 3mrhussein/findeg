import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@findeg/ui';
import type { SalesReportProps } from '../_lib/salesReport';

const formatAsOf = (iso: string) => iso.slice(0, 16).replace('T', ' ');

/**
 * The Staff projection of a Business Partner's monthly sales (ADR-0010, ADR-0013): every row,
 * with its Order count and no suppression. Server-renderable: the month picker is a plain GET form.
 */
export function SalesReportPanel({
  report,
  minOrdersPerRow,
}: {
  report: SalesReportProps;
  /** The Partner projection's suppression threshold, named in the description. */
  minOrdersPerRow: number;
}) {
  if (report.months.length === 0) {
    return (
      <p className="text-sm text-muted-foreground" data-testid="sales-report-empty">
        No Attributed Orders yet. Sales appear after the first Order from one of this partner’s
        lists.
      </p>
    );
  }

  return (
    <Card data-testid="sales-report">
      <CardHeader>
        <CardTitle>Sales for {report.month}</CardTitle>
        <CardDescription>
          Attributed Orders by the month they were accepted, in Cairo time. Cancelled and refunded
          Orders are not counted. The Partner sees rows under {minOrdersPerRow} Orders combined as
          “Other items”.
        </CardDescription>
        <form method="get" className="flex items-end gap-2 pt-2">
          <label className="text-sm" htmlFor="sales-month">
            Month
          </label>
          <select
            id="sales-month"
            name="month"
            defaultValue={report.month}
            className="rounded-md border bg-background px-2 py-1 text-sm"
          >
            {report.months.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
          <button type="submit" className="rounded-md border px-3 py-1 text-sm">
            Show
          </button>
        </form>
      </CardHeader>
      <CardContent>
        {report.sales.length === 0 ? (
          <p className="text-sm text-muted-foreground">No sales this month.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>List</TableHead>
                <TableHead>List item</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Variant</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Units</TableHead>
                <TableHead>Sales</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {report.sales.map((row) => (
                <TableRow key={row.key}>
                  <TableCell>{row.listName ?? '—'}</TableCell>
                  <TableCell>{row.listItemLabel ?? '—'}</TableCell>
                  <TableCell>{row.productName ?? '—'}</TableCell>
                  <TableCell>{row.variantLabel ?? '—'}</TableCell>
                  <TableCell>{row.orderCount}</TableCell>
                  <TableCell>{row.quantity}</TableCell>
                  <TableCell className="font-mono">{row.egp} EGP</TableCell>
                </TableRow>
              ))}
              <TableRow className="font-semibold" data-testid="sales-report-total">
                <TableCell colSpan={5}>Total</TableCell>
                <TableCell>{report.total.quantity}</TableCell>
                <TableCell className="font-mono">{report.total.egp} EGP</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        )}
        <p className="mt-2 text-xs text-muted-foreground">As of {formatAsOf(report.asOf)} UTC.</p>
      </CardContent>
    </Card>
  );
}
