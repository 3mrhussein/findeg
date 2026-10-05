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

export interface SalesReportMessages {
  readonly empty: string;
  readonly title: (month: string) => string;
  readonly description: (minOrdersPerRow: number) => string;
  readonly month: string;
  readonly show: string;
  readonly noSales: string;
  readonly list: string;
  readonly listItem: string;
  readonly product: string;
  readonly variant: string;
  readonly orders: string;
  readonly units: string;
  readonly sales: string;
  readonly total: string;
  readonly asOf: (date: string) => string;
}

/**
 * The Staff projection of a Business Partner's monthly sales (ADR-0010, ADR-0013): every row,
 * with its Order count and no suppression. Server-renderable: the month picker is a plain GET form.
 */
export function SalesReportPanel({
  report,
  minOrdersPerRow,
  messages,
}: {
  report: SalesReportProps;
  /** The Business Partner projection's suppression threshold, named in the description. */
  minOrdersPerRow: number;
  messages: SalesReportMessages;
}) {
  if (report.months.length === 0) {
    return (
      <p className="text-sm text-muted-foreground" data-testid="sales-report-empty">
        {messages.empty}
      </p>
    );
  }

  return (
    <Card data-testid="sales-report">
      <CardHeader>
        <CardTitle>{messages.title(report.month)}</CardTitle>
        <CardDescription>{messages.description(minOrdersPerRow)}</CardDescription>
        <form method="get" className="flex items-end gap-2 pt-2">
          <label className="text-sm" htmlFor="sales-month">
            {messages.month}
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
            {messages.show}
          </button>
        </form>
      </CardHeader>
      <CardContent>
        {report.sales.length === 0 ? (
          <p className="text-sm text-muted-foreground">{messages.noSales}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{messages.list}</TableHead>
                <TableHead>{messages.listItem}</TableHead>
                <TableHead>{messages.product}</TableHead>
                <TableHead>{messages.variant}</TableHead>
                <TableHead>{messages.orders}</TableHead>
                <TableHead>{messages.units}</TableHead>
                <TableHead>{messages.sales}</TableHead>
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
                <TableCell colSpan={5}>{messages.total}</TableCell>
                <TableCell>{report.total.quantity}</TableCell>
                <TableCell className="font-mono">{report.total.egp} EGP</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        )}
        <p className="mt-2 text-xs text-muted-foreground">
          {messages.asOf(formatAsOf(report.asOf))}
        </p>
      </CardContent>
    </Card>
  );
}
