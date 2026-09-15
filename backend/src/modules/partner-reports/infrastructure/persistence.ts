import { and, eq, lt, gte } from 'drizzle-orm';
import type { TransactionDatabase } from '@findeg/db/transactions';
import { partnerReportEvents, partnerReportSales } from '@findeg/db/modules/partner-reports';
import type { PartnerReportStore } from '../public.js';
import { toValuedRewardEvent } from '../../partner-rewards/public.js';

export function bindPartnerReportStore(database: TransactionDatabase): PartnerReportStore {
  return {
    async eventsThrough(partnerId, before) {
      const rows = await database
        .select()
        .from(partnerReportEvents)
        .where(
          and(
            eq(partnerReportEvents.businessPartnerId, partnerId),
            lt(partnerReportEvents.createdAt, before),
          ),
        )
        .orderBy(partnerReportEvents.id);
      return rows.map(toValuedRewardEvent);
    },
    async salesDuring(partnerId, start, end) {
      return database
        .select({
          day: partnerReportSales.day,
          listId: partnerReportSales.listId,
          listItemId: partnerReportSales.listItemId,
          variantId: partnerReportSales.variantId,
          count: partnerReportSales.count,
          subtotal: partnerReportSales.subtotal,
        })
        .from(partnerReportSales)
        .where(
          and(
            eq(partnerReportSales.businessPartnerId, partnerId),
            gte(partnerReportSales.day, start),
            lt(partnerReportSales.day, end),
          ),
        )
        .orderBy(
          partnerReportSales.day,
          partnerReportSales.listId,
          partnerReportSales.listItemId,
          partnerReportSales.variantId,
        );
    },
  };
}
