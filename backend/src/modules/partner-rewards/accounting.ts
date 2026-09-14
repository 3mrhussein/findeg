import type { PartnerRewardEvent, PartnerRewardSummary, RewardStatement } from './contracts.js';

type AmountEvent = Pick<PartnerRewardEvent, 'partnerId' | 'orderReference' | 'eventType'> & {
  amount: bigint;
  pendingAmount?: bigint;
  earnedAmount?: bigint;
};
const floor = (amount: bigint) => (amount > 0n ? amount : 0n);
function summarize(events: readonly AmountEvent[]) {
  const pendingByOrder = new Map<string, bigint>();
  let earned = 0n,
    reversed = 0n,
    settled = 0n;
  for (const event of events) {
    const { amount } = event;
    const key = JSON.stringify([event.partnerId, event.orderReference]);
    const pending = pendingByOrder.get(key) ?? 0n;
    switch (event.eventType) {
      case 'accepted':
        pendingByOrder.set(key, pending + (event.pendingAmount ?? amount));
        break;
      case 'paid': {
        const value = event.earnedAmount ?? amount;
        earned += value;
        pendingByOrder.set(key, floor(pending - value));
        break;
      }
      case 'cancellation': {
        const cancelled = floor(-amount) < pending ? floor(-amount) : pending;
        pendingByOrder.set(key, pending - cancelled);
        reversed += floor(-amount);
        earned += amount + cancelled;
        break;
      }
      case 'refund':
      case 'reversal':
        reversed += floor(-amount);
        earned += amount;
        break;
      case 'adjustment':
        earned += amount;
        break;
      case 'settlement':
        settled += floor(amount);
        break;
    }
  }
  return {
    pending: [...pendingByOrder.values()].reduce((total, value) => total + value, 0n),
    earned: floor(earned),
    reversed: floor(reversed),
    settled: floor(settled),
    available: floor(earned - settled),
  };
}
const pointAmount = (value: number) => (Number.isSafeInteger(value) ? BigInt(value) : 0n);
function pointEvents(events: readonly PartnerRewardEvent[]): AmountEvent[] {
  return events.map((event) => ({
    ...event,
    amount: pointAmount(event.points),
    pendingAmount: event.pendingPoints === undefined ? undefined : pointAmount(event.pendingPoints),
    earnedAmount: event.earnedPoints === undefined ? undefined : pointAmount(event.earnedPoints),
  }));
}
export function summarizeRewardLedger(events: readonly PartnerRewardEvent[]): PartnerRewardSummary {
  const totals = summarize(pointEvents(events));
  return {
    pending: Number(totals.pending),
    earned: Number(totals.earned),
    reversed: Number(totals.reversed),
    settled: Number(totals.settled),
    available: Number(totals.available),
  };
}
const egp = (value: bigint) => `${value / 100n}.${String(value % 100n).padStart(2, '0')}`;
function display(totals: ReturnType<typeof summarize>, format: (value: bigint) => string) {
  return {
    pending: format(totals.pending),
    earned: format(totals.earned),
    reversed: format(totals.reversed),
    settled: format(totals.settled),
    available: format(totals.available),
  };
}
export function summarizeRewardStatement(
  events: readonly (PartnerRewardEvent & { readonly value: string | null })[],
): RewardStatement {
  const points = display(summarize(pointEvents(events)), String);
  if (events.some((event) => event.value === null || !/^-?\d+\.\d{2}$/.test(event.value)))
    return { points, value: null };
  const values = events.map((event) => ({
    ...event,
    amount: BigInt(event.value!.replace('.', '')),
  }));
  return { points, value: display(summarize(values), egp) };
}
