import { defineConfig } from 'cypress';

export default defineConfig({
  reporter: 'spec',
  reporterOptions: {},
  allowCypressEnv: false,
  viewportWidth: 1280,
  viewportHeight: 800,
  e2e: {
    baseUrl: 'http://localhost:3000',
    defaultCommandTimeout: 10000,
    specPattern: 'cypress/e2e/**/*.cy.{ts,tsx}',
    supportFile: 'cypress/support/e2e.ts',
    video: true,
    screenshotOnRunFailure: true,
    trashAssetsBeforeRuns: true,
    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',
    downloadsFolder: 'cypress/downloads',
    setupNodeEvents(on, config) {
      on('task', {
        async createPartnerInvitation() {
          const { randomUUID } = await import('node:crypto');
          const [{ db }, { users }, { createPartnerMembershipServices }] = await Promise.all([
            import('@findeg/db/connection'),
            import('@findeg/db/schema'),
            import('@findeg/backend/features/partner-membership'),
          ]);
          const suffix = randomUUID().slice(0, 8);
          const [staffUser] = await db
            .insert(users)
            .values({ email: `cypress-staff-${suffix}@findeg.test`, portalRole: 'staff' })
            .returning();
          const services = createPartnerMembershipServices({ db });
          const actor = {
            kind: 'staff' as const,
            userId: staffUser.id,
            permissionCodes: ['partners.manage'],
          };
          const partner = await services.partners.createPartner(actor, {
            code: `cypress-partner-${suffix}`,
            nameEn: 'Cypress Partner School',
            nameAr: 'مدرسة سايبريس',
          });
          if (!partner.success) throw new Error(partner.error);
          const email = `cypress-invitee-${suffix}@findeg.test`;
          const invitation = await services.invitations.invite(actor, partner.data.id, {
            email,
            roles: ['partner-administrator'],
          });
          if (!invitation.success) throw new Error(invitation.error);
          return {
            email,
            code: partner.data.code,
            url: `/en/partner/invitations/${invitation.data.token}`,
          };
        },
      });
      return config;
    },
  },
  env: {
    LOCALE: 'en',
    ADMIN_EMAIL: 'admin@findeg.com',
    ADMIN_PASSWORD: 'admin',
  },
});
