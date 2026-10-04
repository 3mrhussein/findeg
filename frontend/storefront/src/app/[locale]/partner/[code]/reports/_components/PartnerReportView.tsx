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
import { useTranslations } from 'next-intl';
import type { PartnerReportProps } from '../_lib/partnerReport';

/**
 * The Partner projection of monthly sales from the school's lists (ADR-0010, ADR-0013).
 * Server-renderable: the month picker is a plain GET form. Every figure arrives pre-formatted,
 * so nothing here computes money.
 */
export function PartnerReportView({
  report,
  minOrdersPerRow,
}: {
  report: PartnerReportProps;
  /** The suppression threshold, named in the "Other items" explanation. */
  minOrdersPerRow: number;
}) {
  const t = useTranslations('PartnerReports');
  const money = (egp: string) => t('egp', { amount: egp });
  const name = (value: string | null) => value ?? t('unnamed');

  if (report.months.length === 0) {
    return (
      <p className="text-sm text-muted-foreground" data-testid="partner-report-empty">
        {t('empty')}
      </p>
    );
  }

  return (
    <Card data-testid="sales-table">
      <CardHeader>
        <CardTitle>{t('salesTitle', { month: report.monthLabel })}</CardTitle>
        <CardDescription>{t('salesHint')}</CardDescription>
        <form method="get" className="flex items-end gap-2 pt-2">
          <label className="text-sm" htmlFor="report-month">
            {t('month')}
          </label>
          <select
            id="report-month"
            name="month"
            defaultValue={report.month}
            className="rounded-md border bg-background px-2 py-1 text-sm"
          >
            {report.months.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
          <button type="submit" className="rounded-md border px-3 py-1 text-sm">
            {t('show')}
          </button>
        </form>
      </CardHeader>
      <CardContent>
        {report.sales.length === 0 && !report.otherItems ? (
          <p className="text-sm text-muted-foreground">{t('noSales')}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('colList')}</TableHead>
                <TableHead>{t('colItem')}</TableHead>
                <TableHead>{t('colProduct')}</TableHead>
                <TableHead>{t('colVariant')}</TableHead>
                <TableHead>{t('colQuantity')}</TableHead>
                <TableHead>{t('colSales')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {report.sales.map((row) => (
                <TableRow key={row.key}>
                  <TableCell>{name(row.listName)}</TableCell>
                  <TableCell>{name(row.listItemLabel)}</TableCell>
                  <TableCell>{name(row.productName)}</TableCell>
                  <TableCell>{name(row.variantLabel)}</TableCell>
                  <TableCell dir="ltr">{row.quantity}</TableCell>
                  <TableCell dir="ltr">{money(row.egp)}</TableCell>
                </TableRow>
              ))}
              {report.otherItems && (
                <TableRow data-testid="other-items-row">
                  <TableCell colSpan={4}>
                    <span className="font-medium">{t('otherItems')}</span>
                    <span className="block text-xs text-muted-foreground">
                      {t('otherItemsHint', { count: minOrdersPerRow })}
                    </span>
                  </TableCell>
                  <TableCell dir="ltr">{report.otherItems.quantity}</TableCell>
                  <TableCell dir="ltr">{money(report.otherItems.egp)}</TableCell>
                </TableRow>
              )}
              <TableRow className="font-semibold" data-testid="sales-total-row">
                <TableCell colSpan={4}>{t('total')}</TableCell>
                <TableCell dir="ltr">{report.total.quantity}</TableCell>
                <TableCell dir="ltr">{money(report.total.egp)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        )}
        <p className="mt-2 text-xs text-muted-foreground">{t('asOf', { time: report.asOf })}</p>
      </CardContent>
    </Card>
  );
}
