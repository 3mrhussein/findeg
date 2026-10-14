import { describe, expect, it } from 'vitest';
import { DomainError } from '@findeg/domain/common';
import {
  BUSINESS_PARTNER_STATUSES,
  PARTNER_INVITATION_STATUSES,
  acceptPartnerInvitation,
  isPartnerInvitationExpired,
  issuePartnerInvitation,
  partnerInvitationExpiresAt,
  partnerInvitationState,
  resendPartnerInvitation,
  revokePartnerInvitation,
  type PartnerInvitationStatus,
  type PartnerRole,
} from '@findeg/domain/partners';

function codeOf(run: () => unknown): string | undefined {
  try {
    run();
    return undefined;
  } catch (error) {
    if (error instanceof DomainError) return error.code as string;
    throw error;
  }
}

const DAY = 24 * 60 * 60 * 1000;
const SENT = new Date('2026-05-10T09:00:00Z');
const at = (ms: number) => new Date(SENT.getTime() + ms);

const invitation = (status: PartnerInvitationStatus = 'pending', expiresAt = at(7 * DAY)) => ({
  email: 'head@school.eg',
  roles: ['partner-administrator'] as readonly PartnerRole[],
  status,
  expiresAt,
});

const open = { partnerStatus: 'active' as const };

// Ported from partner-membership's invitation, partner-invitation and acceptance tests (PA-9).
describe('Partner Invitation expiry', () => {
  it('expires 7 days after it is sent', () => {
    expect(partnerInvitationExpiresAt(SENT)).toEqual(new Date('2026-05-17T09:00:00Z'));
  });

  it('is expired exactly at expiresAt, not a moment before', () => {
    const sent = invitation();
    expect(isPartnerInvitationExpired(sent, at(7 * DAY - 1))).toBe(false);
    expect(isPartnerInvitationExpired(sent, at(7 * DAY))).toBe(true);
  });

  it.each([
    ['pending', at(7 * DAY - 1), 'pending'],
    ['pending', at(7 * DAY), 'expired'],
    ['accepted', at(8 * DAY), 'accepted'],
    ['revoked', at(8 * DAY), 'revoked'],
  ] as const)('reads a %s invitation at %s as %s', (status, now, state) => {
    expect(partnerInvitationState(invitation(status), now)).toBe(state);
  });
});

describe('issuing a Partner Invitation', () => {
  const facts = { ...open, now: SENT, alreadyMember: false };

  it('is pending and expires 7 days after it is sent', () => {
    expect(
      issuePartnerInvitation({ email: 'head@school.eg', roles: ['partner-administrator'] }, facts),
    ).toEqual({
      email: 'head@school.eg',
      roles: ['partner-administrator'],
      status: 'pending',
      expiresAt: new Date('2026-05-17T09:00:00Z'),
    });
  });

  it('trims and lowercases the email', () => {
    expect(
      issuePartnerInvitation({ email: '  Head@School.EG ', roles: ['report-viewer'] }, facts).email,
    ).toBe('head@school.eg');
  });

  it('removes repeated roles', () => {
    expect(
      issuePartnerInvitation(
        { email: 'a@school.eg', roles: ['report-viewer', 'report-viewer'] },
        facts,
      ).roles,
    ).toEqual(['report-viewer']);
  });

  it.each([
    ['an empty role list', 'a@school.eg', [], 'PARTNER_ROLE_REQUIRED'],
    ['an unknown role', 'a@school.eg', ['root'], 'UNKNOWN_PARTNER_ROLE'],
    ['an invalid email', 'nope', ['list-manager'], 'INVALID_INVITATION_EMAIL'],
    [
      'an email over 255 characters',
      `${'a'.repeat(251)}@x.eg`,
      ['list-manager'],
      'INVALID_INVITATION_EMAIL',
    ],
  ])('refuses %s', (_name, email, roles, code) => {
    expect(
      codeOf(() => issuePartnerInvitation({ email, roles: roles as PartnerRole[] }, facts)),
    ).toBe(code);
  });

  it.each(BUSINESS_PARTNER_STATUSES)('follows the partner status: %s', (partnerStatus) => {
    const allowed = partnerStatus === 'onboarding' || partnerStatus === 'active';
    expect(
      codeOf(() =>
        issuePartnerInvitation(
          { email: 'a@school.eg', roles: ['list-manager'] },
          { ...facts, partnerStatus },
        ),
      ),
    ).toBe(allowed ? undefined : 'PARTNER_NOT_OPEN');
  });

  it('refuses to invite a current member', () => {
    expect(
      codeOf(() =>
        issuePartnerInvitation(
          { email: 'a@school.eg', roles: ['list-manager'] },
          { ...facts, alreadyMember: true },
        ),
      ),
    ).toBe('ALREADY_PARTNER_MEMBER');
  });
});

describe('Partner Invitation transitions', () => {
  // Resend, revoke and accept each need a pending invitation.
  const unexpired = at(DAY);
  const accept = (status: PartnerInvitationStatus) =>
    acceptPartnerInvitation(invitation(status), {
      ...open,
      email: 'head@school.eg',
      now: unexpired,
      alreadyMember: false,
    });

  it.each(PARTNER_INVITATION_STATUSES)('resends a %s invitation only when pending', (status) => {
    expect(
      codeOf(() => resendPartnerInvitation(invitation(status), { ...open, now: unexpired })),
    ).toBe(status === 'pending' ? undefined : 'INVITATION_NOT_PENDING');
  });

  it.each(PARTNER_INVITATION_STATUSES)('revokes a %s invitation only when pending', (status) => {
    expect(codeOf(() => revokePartnerInvitation(invitation(status), open))).toBe(
      status === 'pending' ? undefined : 'INVITATION_NOT_PENDING',
    );
  });

  it.each(PARTNER_INVITATION_STATUSES)('accepts a %s invitation only when pending', (status) => {
    expect(codeOf(() => accept(status))).toBe(
      status === 'pending' ? undefined : 'INVITATION_NOT_PENDING',
    );
  });

  it('revokes a pending invitation', () => {
    expect(revokePartnerInvitation(invitation(), open).status).toBe('revoked');
  });

  it.each(BUSINESS_PARTNER_STATUSES)(
    'resends and revokes only while the partner allows membership changes: %s',
    (partnerStatus) => {
      const allowed = partnerStatus === 'onboarding' || partnerStatus === 'active';
      const expected = allowed ? undefined : 'PARTNER_NOT_OPEN';
      expect(
        codeOf(() => resendPartnerInvitation(invitation(), { partnerStatus, now: unexpired })),
      ).toBe(expected);
      expect(codeOf(() => revokePartnerInvitation(invitation(), { partnerStatus }))).toBe(expected);
    },
  );

  it('checks the partner status before the invitation status', () => {
    expect(
      codeOf(() => revokePartnerInvitation(invitation('revoked'), { partnerStatus: 'closed' })),
    ).toBe('PARTNER_NOT_OPEN');
  });
});

describe('resending a Partner Invitation', () => {
  it('resets the expiry to 7 days after the resend', () => {
    const resent = resendPartnerInvitation(invitation(), { ...open, now: at(3 * DAY) });
    expect(resent).toEqual(invitation('pending', at(10 * DAY)));
  });

  it('revives an expired pending invitation', () => {
    const now = at(8 * DAY);
    expect(partnerInvitationState(invitation(), now)).toBe('expired');
    expect(
      partnerInvitationState(resendPartnerInvitation(invitation(), { ...open, now }), now),
    ).toBe('pending');
  });
});

describe('accepting a Partner Invitation', () => {
  const facts = {
    ...open,
    email: 'head@school.eg',
    now: at(DAY),
    alreadyMember: false,
  };

  it('accepts it and grants an active membership with the invited roles', () => {
    expect(acceptPartnerInvitation(invitation(), facts)).toEqual({
      invitation: invitation('accepted'),
      membership: { roles: ['partner-administrator'], status: 'active' },
    });
  });

  it('matches the signed-in email after trimming and lowercasing it', () => {
    expect(
      acceptPartnerInvitation(invitation(), { ...facts, email: ' Head@School.EG ' }).invitation
        .status,
    ).toBe('accepted');
  });

  it.each(['onboarding', 'active'] as const)('accepts while the partner is %s', (partnerStatus) => {
    expect(
      acceptPartnerInvitation(invitation(), { ...facts, partnerStatus }).invitation.status,
    ).toBe('accepted');
  });

  it.each([
    ['another email', { email: 'other@school.eg' }, 'INVITATION_EMAIL_MISMATCH'],
    ['an expired invitation', { now: at(7 * DAY) }, 'INVITATION_EXPIRED'],
    ['a suspended partner', { partnerStatus: 'suspended' }, 'PARTNER_NOT_OPEN'],
    ['a closed partner', { partnerStatus: 'closed' }, 'PARTNER_NOT_OPEN'],
    ['a current member', { alreadyMember: true }, 'ALREADY_PARTNER_MEMBER'],
  ] as const)('refuses %s', (_name, override, code) => {
    expect(codeOf(() => acceptPartnerInvitation(invitation(), { ...facts, ...override }))).toBe(
      code,
    );
  });

  it('checks the email first, so another person learns nothing about the invitation', () => {
    expect(
      codeOf(() =>
        acceptPartnerInvitation(invitation('revoked'), { ...facts, email: 'other@school.eg' }),
      ),
    ).toBe('INVITATION_EMAIL_MISMATCH');
  });

  it('checks pending before expiry, and expiry before the partner status', () => {
    expect(
      codeOf(() => acceptPartnerInvitation(invitation('accepted'), { ...facts, now: at(9 * DAY) })),
    ).toBe('INVITATION_NOT_PENDING');
    expect(
      codeOf(() =>
        acceptPartnerInvitation(invitation(), {
          ...facts,
          now: at(9 * DAY),
          partnerStatus: 'closed',
        }),
      ),
    ).toBe('INVITATION_EXPIRED');
  });

  it('checks the partner status before an existing membership', () => {
    expect(
      codeOf(() =>
        acceptPartnerInvitation(invitation(), {
          ...facts,
          partnerStatus: 'closed',
          alreadyMember: true,
        }),
      ),
    ).toBe('PARTNER_NOT_OPEN');
  });
});
