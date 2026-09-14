import {
  createIdentityAccess,
  type SessionStore,
  type SessionSecurity,
} from '@findeg/backend/modules/identity-access/public';
import {
  createPartnerManagement,
  type PartnerStore,
  type PartnerSecurity,
} from '@findeg/backend/modules/partner-management/public';
import {
  readPartnerStatement,
  type PartnerReportStore,
} from '@findeg/backend/modules/partner-reports/public';
export function createPartnerReportOperations(
  stores: { identity: SessionStore; partners: PartnerStore; reports: PartnerReportStore },
  security: SessionSecurity & PartnerSecurity,
) {
  return {
    async read(token: string | undefined, partnerId: number, period: string) {
      const identity = await createIdentityAccess(stores.identity, security).currentSession(
        token,
        'storefront',
      );
      if (identity.status !== 'authenticated') return identity;
      if (
        !Number.isSafeInteger(partnerId) ||
        partnerId < 1 ||
        !/^(20\d{2})-(0[1-9]|1[0-2])$/.test(period)
      )
        return { status: 'invalid-input' } as const;
      const access = await createPartnerManagement(stores.partners, security).workspace(
        { ...identity.session, activePortal: 'partner' },
        partnerId,
      );
      if (access.status !== 'authenticated') return access;
      if (
        !access.session.partner.roles.some(
          (role) => role === 'partner-administrator' || role === 'report-viewer',
        )
      )
        return { status: 'authorization-denied', session: access.session } as const;
      return {
        status: 'found',
        report: await readPartnerStatement(stores.reports, partnerId, period),
      } as const;
    },
  };
}
