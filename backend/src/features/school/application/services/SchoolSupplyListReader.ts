import {
  findVariantCandidates,
  getAvailableQuantities,
  getListOffer,
  getPublicSupplyListByCode,
  getVariantDisplayDetails,
  type SchoolSupplyListDatabase,
  type VariantCandidateRow,
} from '@findeg/db/queries/school-supply-lists';
import { eligibleVariants } from '../../domain/eligibleVariants';
import type {
  ISchoolSupplyListReader,
  PublicSupplyListItem,
  PublicSupplyListOffer,
  PublicSupplyListResult,
  PublicSupplyListVariant,
} from '../interfaces/ISchoolSupplyListReader';

import { PUBLIC_CODE_PATTERN, listOfferBasisPointsAt } from '@findeg/domain';

function differingAttributes(
  candidate: Record<string, string>,
  reference: Record<string, string>,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(candidate).filter(([key, value]) => reference[key] !== value),
  );
}

/**
 * Possession of the public code is the only gate. Reads are always live; the
 * caller decides whether to cache.
 */
export class SchoolSupplyListReader implements ISchoolSupplyListReader {
  constructor(private readonly getDb: () => Promise<SchoolSupplyListDatabase>) {}

  async getByPublicCode(publicCode: string): Promise<PublicSupplyListResult> {
    if (!PUBLIC_CODE_PATTERN.test(publicCode)) return { success: false, error: 'not-found' };
    const db = await this.getDb();
    // One snapshot so items, candidates and stock agree with each other.
    return db.transaction(
      async (tx): Promise<PublicSupplyListResult> => {
        const found = await getPublicSupplyListByCode(tx, publicCode);
        if (!found) return { success: false, error: 'not-found' };
        const { list, school, replacementPublicCode } = found;
        // A published default is frozen, so a null variant only means the variant was deleted.
        const items = found.items.flatMap((item) =>
          item.variantId === null ? [] : [{ ...item, variantId: item.variantId }],
        );

        const defaultIds = [...new Set(items.map((item) => item.variantId))];
        const categoryIds = new Set(
          items.flatMap((item) =>
            !item.exactItem && item.specification ? [item.specification.categoryId] : [],
          ),
        );
        const pools = new Map<number, VariantCandidateRow[]>();
        for (const categoryId of categoryIds) {
          pools.set(categoryId, await findVariantCandidates(tx, { categoryId }));
        }
        const defaults = new Map(
          (await findVariantCandidates(tx, { variantIds: defaultIds })).map((c) => [
            c.variantId,
            c,
          ]),
        );

        const perItem = items.map((item) => {
          const pool =
            !item.exactItem && item.specification
              ? (pools.get(item.specification.categoryId) ?? [])
              : [...defaults.values()];
          return { item, eligible: eligibleVariants(item, pool) };
        });

        const variantIds = [
          ...new Set([
            ...defaultIds,
            ...perItem.flatMap((p) => p.eligible.map((c) => c.variantId)),
          ]),
        ];
        const [details, availability] = await Promise.all([
          getVariantDisplayDetails(tx, variantIds),
          getAvailableQuantities(tx, variantIds),
        ]);
        const detailsById = new Map(details.map((d) => [d.variantId, d]));
        const toVariant = (variantId: number): PublicSupplyListVariant => {
          const d = detailsById.get(variantId);
          if (!d) throw new Error(`Variant ${variantId} is missing from the list read`);
          return {
            variantId,
            sku: d.sku,
            name: d.productName,
            variantLabel: d.variantLabel,
            brand: d.brandName,
            price: d.price,
            inStock: (availability.get(variantId) ?? 0) >= 1,
          };
        };

        const publicItems: PublicSupplyListItem[] = perItem.map(({ item, eligible }) => {
          const reference = defaults.get(item.variantId)?.attributes ?? {};
          return {
            id: item.id,
            required: item.required,
            quantity: item.quantity,
            exactItem: item.exactItem,
            specification: item.exactItem ? null : item.specification,
            label: item.localizedLabel,
            note: item.localizedNote,
            defaultVariant: toVariant(item.variantId),
            eligibleVariants: eligible.map((c) => ({
              ...toVariant(c.variantId),
              differingAttributes: differingAttributes(c.attributes, reference),
            })),
          };
        });

        const offerRow = await getListOffer(tx, list.id);
        const activeBasisPoints = offerRow ? listOfferBasisPointsAt(offerRow, new Date()) : null;
        const offer: PublicSupplyListOffer | null =
          activeBasisPoints !== null && offerRow
            ? {
                basisPoints: activeBasisPoints,
                startsAt: offerRow.startsAt.toISOString(),
                endsAt: offerRow.endsAt ? offerRow.endsAt.toISOString() : null,
              }
            : null;

        return {
          success: true,
          data: {
            publicCode,
            status: list.status === 'archived' ? 'archived' : 'published',
            grade: list.grade,
            academicYear: list.academicYear,
            title: list.localizedTitle,
            description: list.localizedDescription,
            heroImageUrl: list.heroImageUrl,
            school,
            replacementPublicCode,
            offer,
            items: publicItems,
          },
        };
      },
      { isolationLevel: 'repeatable read', accessMode: 'read only' },
    );
  }
}
