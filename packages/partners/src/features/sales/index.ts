import type { PartnerSalesDatabase } from '@findeg/db/queries/partner-sales';
import { AttributedOrderService, type IAttributedOrderService } from '../attributed-orders/index';
import { PartnerReportService, type IPartnerReportService } from '../partner-report/index';

export interface PartnerSalesServices {
  attributedOrders: IAttributedOrderService;
  partnerReports: IPartnerReportService;
}

export interface PartnerSalesDependencies {
  /** Defaults to the application's shared database connection. */
  db?: PartnerSalesDatabase;
  /** Defaults to the system clock. Tests pin it to place the current Cairo month. */
  now?: () => Date;
}

export function createPartnerSalesServices(
  dependencies: PartnerSalesDependencies = {},
): PartnerSalesServices {
  const getDb = dependencies.db
    ? async () => dependencies.db as PartnerSalesDatabase
    : async () => (await import('@findeg/db/connection')).db as PartnerSalesDatabase;
  return {
    attributedOrders: new AttributedOrderService(getDb),
    partnerReports: new PartnerReportService(getDb, dependencies.now),
  };
}
