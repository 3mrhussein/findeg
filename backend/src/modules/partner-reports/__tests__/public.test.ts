import { describe, expect, it } from 'vitest';
import {
  buildAuthorizedPartnerReports,
  buildPartnerReports,
  sanitizePartnerReportRow,
} from '../public.js';

describe('Partner reports', () => {
  it('suppresses low-count breakdowns and strips customer or delivery details from partner statements', () => {
    const rows = [
      {
        partnerId: 12,
        period: '2026-09',
        count: 2,
        totalPoints: 100,
        customerName: 'Alice',
        email: 'alice@example.test',
        phone: '01012345678',
        deliveryStreet: '7 Garden St',
        deliveryCity: 'Cairo',
      },
      {
        partnerId: 12,
        period: '2026-09',
        count: 5,
        totalPoints: 250,
        customerName: 'Bob',
        email: 'bob@example.test',
        phone: '01087654321',
        deliveryStreet: '15 Market Rd',
        deliveryCity: 'Alexandria',
      },
    ];

    expect(sanitizePartnerReportRow(rows[0])).toEqual({
      partnerId: 12,
      period: '2026-09',
      count: 2,
      totalPoints: 100,
    });

    expect(buildPartnerReports(rows, { minimumCount: 3 })).toEqual({
      rows: [
        {
          partnerId: 12,
          period: '2026-09',
          count: 5,
          totalPoints: 250,
        },
      ],
      suppressed: true,
    });
  });

  it('limits reports to the selected partner and report-authorized roles', async () => {
    const report = await buildAuthorizedPartnerReports(
      {
        userId: 7,
        email: 'viewer@example.test',
        emailVerified: true,
        activePortal: 'partner',
        authorizationVersion: 1,
        staffRoles: [],
        permissions: [],
        partner: {
          businessPartnerId: 12,
          membershipId: 4,
          roles: ['report-viewer'],
          authorizationVersion: 1,
        },
      },
      12,
      [{ partnerId: 12, period: '2026-09', count: 3, totalPoints: 100 }],
    );

    expect(report).toEqual({
      status: 'authorized',
      report: {
        rows: [{ partnerId: 12, period: '2026-09', count: 3, totalPoints: 100 }],
        suppressed: false,
      },
    });
  });
});
