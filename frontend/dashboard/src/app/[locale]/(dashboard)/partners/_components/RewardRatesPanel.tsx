'use client';

import { useActionState } from 'react';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@findeg/ui';

export interface RewardRateItem {
  readonly id: number;
  readonly pointsPerEgp: string;
  readonly egpPerPoint: string;
  readonly createdAt: string;
}

export interface RewardRateFormState {
  readonly status: 'idle' | 'saved' | 'error';
  readonly message?: string;
}

export type SaveRewardRate = (
  previous: RewardRateFormState,
  formData: FormData,
) => Promise<RewardRateFormState>;

const initialState: RewardRateFormState = { status: 'idle' };

export function RewardRatesPanel({
  current,
  history,
  canManage,
  save,
}: {
  current: RewardRateItem | null;
  history: RewardRateItem[];
  canManage: boolean;
  save: SaveRewardRate;
}) {
  const [state, formAction, isPending] = useActionState(save, initialState);

  return (
    <div className="space-y-6" data-testid="reward-rates-panel">
      <Card>
        <CardHeader>
          <CardTitle>Current Reward Rate</CardTitle>
          <CardDescription>
            Reward Rates are independent conversion values and apply only to future Order
            Acceptances.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {current ? (
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-muted-foreground">Partner Points per EGP</dt>
                <dd className="font-mono text-lg font-semibold">{current.pointsPerEgp}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">EGP per Partner Point</dt>
                <dd className="font-mono text-lg font-semibold">{current.egpPerPoint}</dd>
              </div>
            </dl>
          ) : (
            <p className="text-sm text-muted-foreground">No Reward Rate has been configured.</p>
          )}
        </CardContent>
      </Card>

      {canManage && (
        <Card>
          <CardHeader>
            <CardTitle>Set a new Reward Rate</CardTitle>
            <CardDescription>
              Saving appends a new rate. Earlier rates remain in the history and cannot be edited.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={formAction} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="pointsPerEgp">Partner Points per EGP</Label>
                <Input
                  id="pointsPerEgp"
                  name="pointsPerEgp"
                  inputMode="decimal"
                  placeholder="1.250000"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="egpPerPoint">EGP per Partner Point</Label>
                <Input
                  id="egpPerPoint"
                  name="egpPerPoint"
                  inputMode="decimal"
                  placeholder="0.0125"
                  required
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                {state.message && (
                  <p
                    role={state.status === 'error' ? 'alert' : 'status'}
                    className={state.status === 'error' ? 'text-sm text-destructive' : 'text-sm'}
                  >
                    {state.message}
                  </p>
                )}
                <Button type="submit" disabled={isPending}>
                  Set Reward Rate
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Rate history</CardTitle>
          <CardDescription>Newest first. Every row is append-only.</CardDescription>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">No rate history yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Set at</TableHead>
                  <TableHead>Partner Points per EGP</TableHead>
                  <TableHead>EGP per Partner Point</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((rate) => (
                  <TableRow key={rate.id}>
                    <TableCell>{new Date(rate.createdAt).toLocaleString()}</TableCell>
                    <TableCell className="font-mono">{rate.pointsPerEgp}</TableCell>
                    <TableCell className="font-mono">{rate.egpPerPoint}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
