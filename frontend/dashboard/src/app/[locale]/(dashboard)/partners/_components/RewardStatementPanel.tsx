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
import type { AmountProps, RewardReportProps } from '../_lib/rewardReport';

const when = (iso: string) => iso.slice(0, 16).replace('T', ' ');
const money = (egp: string) => `${egp} EGP`;
const withPoints = ({ points, egp }: AmountProps) => `${money(egp)} (${points} pts)`;

function Empty({ children }: { children: string }) {
  return <p className="text-sm text-muted-foreground">{children}</p>;
}

/**
 * The Staff projection of the monthly Reward Statement and sales (ADR-0010), on a Business
 * Partner's Rewards tab. Server-renderable: the month picker is a plain GET form.
 */
export function RewardStatementPanel({ report }: { report: RewardReportProps }) {
  const { statement } = report;
  const hasActivity = report.months.length > 0;

  return (
    <div className="space-y-6" data-testid="reward-statement-panel">
      <Card data-testid="available-balance">
        <CardHeader>
          <CardTitle>Available Balance</CardTitle>
          <CardDescription>
            Earned − reversed ± adjustments − settled, in EGP. Pending never counts. Negative when
            reversals followed a settlement; later earnings offset it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="font-mono text-2xl font-semibold">{money(report.availableBalanceEgp)}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            As of {when(report.asOf)} UTC. Months follow Cairo time.
          </p>
        </CardContent>
      </Card>

      {!hasActivity && (
        <Empty>No rewards activity yet. Figures appear after the first Reward Event.</Empty>
      )}

      {hasActivity && (
        <>
          <Card data-testid="reward-statement">
            <CardHeader>
              <CardTitle>Statement for {report.month}</CardTitle>
              <CardDescription>
                Each movement is placed in the month it was recorded, never by a date Staff enter.
              </CardDescription>
              <form method="get" className="flex items-end gap-2 pt-2">
                <label className="text-sm" htmlFor="reward-month">
                  Month
                </label>
                <select
                  id="reward-month"
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
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell>Opening balance</TableCell>
                    <TableCell className="text-right font-mono">
                      {money(statement.openingEgp)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Earned</TableCell>
                    <TableCell className="text-right font-mono">
                      {withPoints(statement.earned)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Reversed</TableCell>
                    <TableCell className="text-right font-mono">
                      {withPoints(statement.reversed)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Adjustments</TableCell>
                    <TableCell className="text-right font-mono">
                      {money(statement.adjustmentsEgp)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Settled</TableCell>
                    <TableCell className="text-right font-mono">
                      {money(statement.settledEgp)}
                    </TableCell>
                  </TableRow>
                  <TableRow className="font-semibold">
                    <TableCell>Closing balance</TableCell>
                    <TableCell className="text-right font-mono">
                      {money(statement.closingEgp)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <p className="mt-4 text-sm" data-testid="statement-pending">
                Pending now: {withPoints(report.pending)}. Not part of any month or the balance.
              </p>
            </CardContent>
          </Card>

          <Card data-testid="reward-sales">
            <CardHeader>
              <CardTitle>Sales in {report.month}</CardTitle>
              <CardDescription>
                Earned and reversed per list item and variant. Staff see every row, unsuppressed.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {report.sales.length === 0 ? (
                <Empty>No earned or reversed rewards this month.</Empty>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>List</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Variant</TableHead>
                      <TableHead className="text-right">Earned</TableHead>
                      <TableHead className="text-right">Reversed</TableHead>
                      <TableHead className="text-right">Orders</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.sales.map((row) => (
                      <TableRow key={row.key}>
                        <TableCell>{row.listName}</TableCell>
                        <TableCell>{row.listItemLabel}</TableCell>
                        <TableCell>{row.productName}</TableCell>
                        <TableCell>{row.variantLabel}</TableCell>
                        <TableCell className="text-right font-mono">
                          {withPoints(row.earned)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {withPoints(row.reversed)}
                        </TableCell>
                        <TableCell className="text-right">{row.orderCount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card data-testid="reward-activity">
            <CardHeader>
              <CardTitle>Order activity in {report.month}</CardTitle>
              <CardDescription>
                Entitlements with an event this month, with every event they have. Staff only.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {report.entitlements.length === 0 ? (
                <Empty>No Order activity this month.</Empty>
              ) : (
                <ul className="divide-y">
                  {report.entitlements.map((entitlement) => (
                    <li key={entitlement.id} className="space-y-1 py-3">
                      <p className="font-medium">
                        <span className="font-mono">{entitlement.orderReference}</span>
                        {entitlement.productName ? ` · ${entitlement.productName}` : ''} ·{' '}
                        {withPoints(entitlement)}
                      </p>
                      <ul className="text-sm text-muted-foreground">
                        {entitlement.events.map((event) => (
                          <li key={`${event.type}-${event.recordedAt}`}>
                            {when(event.recordedAt)} UTC · {event.type} · {withPoints(event)}
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card data-testid="reward-adjustments">
            <CardHeader>
              <CardTitle>Adjustments in {report.month}</CardTitle>
            </CardHeader>
            <CardContent>
              {report.adjustments.length === 0 ? (
                <Empty>No adjustments this month.</Empty>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Recorded</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Staff</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.adjustments.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>{when(row.recordedAt)} UTC</TableCell>
                        <TableCell className="text-right font-mono">{money(row.egp)}</TableCell>
                        <TableCell>{row.reason}</TableCell>
                        <TableCell>{row.actor}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card data-testid="reward-settlements">
            <CardHeader>
              <CardTitle>Settlement history</CardTitle>
              <CardDescription>
                Settlements, voids and debt forgiveness, newest first. A line is placed in the month
                it was recorded; paid-at is shown here only.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {report.settlements.length === 0 ? (
                <Empty>No settlements recorded.</Empty>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Recorded</TableHead>
                      <TableHead>Kind</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Paid at</TableHead>
                      <TableHead>Transfer reference</TableHead>
                      <TableHead>Notes / reason</TableHead>
                      <TableHead>Staff</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.settlements.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>{when(row.recordedAt)} UTC</TableCell>
                        <TableCell>{row.kind}</TableCell>
                        <TableCell className="text-right font-mono">{money(row.egp)}</TableCell>
                        <TableCell>{row.paidAt}</TableCell>
                        <TableCell className="font-mono">{row.transferReference}</TableCell>
                        <TableCell>{row.reason ?? row.notes}</TableCell>
                        <TableCell>{row.actor}</TableCell>
                      </TableRow>
                    ))}
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
