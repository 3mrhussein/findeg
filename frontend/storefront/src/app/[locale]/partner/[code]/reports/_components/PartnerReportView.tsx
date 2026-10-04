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
import type { AmountProps, PartnerReportProps } from '../_lib/partnerReport';

/**
 * The Partner projection of the monthly Reward Statement and sales (ADR-0010). Server-renderable:
 * the month picker is a plain GET form. Every figure arrives pre-formatted, so nothing here
 * computes money.
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
  const { statement } = report;
  const hasActivity = report.months.length > 0;
  const money = (egp: string) => t('egp', { amount: egp });
  const withPoints = ({ points, egp }: AmountProps) => `${money(egp)} (${t('points', { points })})`;
  const name = (value: string | null) => value ?? t('unnamed');

  return (
    <div className="space-y-6" data-testid="partner-report">
      <Card data-testid="available-balance">
        <CardHeader>
          <CardTitle>{t('balanceTitle')}</CardTitle>
          <CardDescription>{t('balanceHint')}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="font-mono text-2xl font-semibold" dir="ltr">
            {money(report.availableBalanceEgp)}
          </p>
          {report.balanceIsNegative && (
            <p role="note" className="mt-2 text-sm" data-testid="negative-balance-note">
              {t('negativeBalanceNote')}
            </p>
          )}
          <p className="mt-1 text-xs text-muted-foreground">{t('asOf', { time: report.asOf })}</p>
        </CardContent>
      </Card>

      {!hasActivity && <p className="text-sm text-muted-foreground">{t('empty')}</p>}

      {hasActivity && (
        <>
          <Card data-testid="reward-statement">
            <CardHeader>
              <CardTitle>{t('statementTitle', { month: report.monthLabel })}</CardTitle>
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
              <Table>
                <TableBody>
                  <StatementRow label={t('opening')} value={money(statement.openingEgp)} />
                  <StatementRow label={t('earned')} value={withPoints(statement.earned)} />
                  <StatementRow label={t('reversed')} value={withPoints(statement.reversed)} />
                  <StatementRow label={t('adjustments')} value={money(statement.adjustmentsEgp)} />
                  <StatementRow label={t('settled')} value={money(statement.settledEgp)} />
                  <StatementRow label={t('closing')} value={money(statement.closingEgp)} strong />
                </TableBody>
              </Table>
              <p className="mt-4 text-sm">
                <span className="font-medium">{t('pending')}: </span>
                <span dir="ltr">{withPoints(report.pending)}</span>
              </p>
              <p className="text-xs text-muted-foreground">{t('pendingHint')}</p>
            </CardContent>
          </Card>

          <Card data-testid="settlement-history">
            <CardHeader>
              <CardTitle>{t('settlementsTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              {report.settlements.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t('noSettlements')}</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {report.settlements.map((line) => (
                    <li key={line.id} className="flex flex-wrap justify-between gap-2">
                      <span>
                        {line.voided && (
                          <strong className="me-2" data-testid="voided-label">
                            {t('voided')}
                          </strong>
                        )}
                        {line.voided && line.voidsReference
                          ? `${t('voidsReference', { reference: line.voidsReference })} · `
                          : ''}
                        {line.paidAt
                          ? t('paidOn', { date: line.paidAt })
                          : t('recordedAt', { time: line.recordedAt })}
                        {line.transferReference
                          ? ` · ${t('reference', { reference: line.transferReference })}`
                          : ''}
                      </span>
                      <span className="font-mono" dir="ltr">
                        {money(line.egp)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card data-testid="sales-table">
            <CardHeader>
              <CardTitle>{t('salesTitle')}</CardTitle>
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
                      <TableHead>{t('colEarned')}</TableHead>
                      <TableHead>{t('colReversed')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.sales.map((row) => (
                      <TableRow key={row.key}>
                        <TableCell>{name(row.listName)}</TableCell>
                        <TableCell>{name(row.listItemLabel)}</TableCell>
                        <TableCell>{name(row.productName)}</TableCell>
                        <TableCell>{name(row.variantLabel)}</TableCell>
                        <TableCell dir="ltr">{withPoints(row.earned)}</TableCell>
                        <TableCell dir="ltr">{withPoints(row.reversed)}</TableCell>
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
                        <TableCell dir="ltr">{withPoints(report.otherItems.earned)}</TableCell>
                        <TableCell dir="ltr">{withPoints(report.otherItems.reversed)}</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function StatementRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <TableRow className={strong ? 'font-semibold' : undefined}>
      <TableCell>{label}</TableCell>
      <TableCell className="text-end font-mono" dir="ltr">
        {value}
      </TableCell>
    </TableRow>
  );
}
