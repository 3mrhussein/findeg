export interface RewardRateInput {
  readonly pointsPerEgp: string;
  readonly egpPerPoint: string;
}

export interface RewardValuationInput extends RewardRateInput {
  readonly chargedLineTotalPiasters: bigint;
}

export interface RewardValuation {
  readonly points: bigint;
  readonly egpValuePiasters: bigint;
}

const POINTS_PER_EGP_SCALE = 6;
const EGP_PER_POINT_SCALE = 4;

function parseDecimal(
  value: unknown,
  integerDigits: number,
  scale: number,
): { canonical: string; units: bigint } | undefined {
  if (typeof value !== 'string') return undefined;

  const match = new RegExp(
    `^(0|[1-9][0-9]{0,${integerDigits - 1}})(?:\\.([0-9]{1,${scale}}))?$`,
  ).exec(value);
  if (!match) return undefined;

  const fraction = (match[2] ?? '').padEnd(scale, '0');
  const units = BigInt(`${match[1]}${fraction}`);
  if (units <= 0n) return undefined;

  return { canonical: `${match[1]}.${fraction}`, units };
}

/** Parses Reward Rates without ever coercing them through a JavaScript number. */
export function parseRewardRateInput(input: unknown): RewardRateInput | undefined {
  if (!input || typeof input !== 'object') return undefined;

  const record = input as Record<string, unknown>;
  const pointsPerEgp = parseDecimal(record.pointsPerEgp, 6, POINTS_PER_EGP_SCALE);
  const egpPerPoint = parseDecimal(record.egpPerPoint, 8, EGP_PER_POINT_SCALE);
  if (!pointsPerEgp || !egpPerPoint) return undefined;

  return {
    pointsPerEgp: pointsPerEgp.canonical,
    egpPerPoint: egpPerPoint.canonical,
  };
}

/**
 * Values one charged order line exactly: Partner Points are floored and their
 * EGP value is rounded half-up to one piaster.
 */
export function calculateReward(input: RewardValuationInput): RewardValuation {
  if (input.chargedLineTotalPiasters < 0n) {
    throw new RangeError('chargedLineTotalPiasters must not be negative');
  }

  const pointsRate = parseDecimal(input.pointsPerEgp, 6, POINTS_PER_EGP_SCALE);
  const egpRate = parseDecimal(input.egpPerPoint, 8, EGP_PER_POINT_SCALE);
  if (!pointsRate || !egpRate) throw new RangeError('Invalid Reward Rate');

  const points =
    (input.chargedLineTotalPiasters * pointsRate.units) /
    (100n * 10n ** BigInt(POINTS_PER_EGP_SCALE));
  const egpValuePiasters =
    (points * egpRate.units + 10n ** BigInt(EGP_PER_POINT_SCALE - 2) / 2n) /
    10n ** BigInt(EGP_PER_POINT_SCALE - 2);

  return { points, egpValuePiasters };
}
