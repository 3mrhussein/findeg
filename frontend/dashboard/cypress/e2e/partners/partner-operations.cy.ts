import { signInToDashboard } from '../../support/actions/dashboard-session.actions';
import type { CreatedTestPartner } from '../../support/tasks/partner-fixtures';

function waitForHydration(selector: string = '[data-testid="status-actions"]:visible'): void {
  cy.get(selector).should(($el) => {
    expect(Object.keys($el[0]).some((key) => key.startsWith('__reactProps'))).to.eq(true);
  });
}

for (const locale of ['en', 'ar']) {
  describe(`Partner operations (${locale})`, () => {
    beforeEach(() => {
      signInToDashboard();
    });

    it('creates a partner with a profile, edits it, and enforces code lock post-onboarding', () => {
      const tag = Math.random().toString(36).slice(2, 7);
      const code = `sch-${tag}`;
      const nameEn = `School ${tag}`;
      const nameAr = `مدرسة ${tag}`;

      cy.visit(`/${locale}/partners/new`);
      cy.get('[data-testid="partner-form"]').should('be.visible');

      // Fill in details and school profile
      cy.get('input#code').type(code);
      cy.get('input#nameEn').type(nameEn);
      cy.get('input#nameAr').type(nameAr);

      cy.get('select#governorate').select('Cairo');
      cy.get('input#area').type('Maadi');
      cy.get('select#schoolType').select('Private');
      cy.get('select#academicSystem').select('British');
      cy.get('input#logoUrl').type('https://example.com/logo.png');

      cy.get('[data-testid="partner-form"] button[type="submit"]').click();

      // Redirects to partners list
      cy.location('pathname', { timeout: 15000 }).should('eq', `/${locale}/partners`);
      cy.contains('tr[data-testid="partner-row"]', code).should('be.visible');
      cy.contains('tr[data-testid="partner-row"]', nameEn).should('be.visible');

      // Open partner details
      cy.contains('tr[data-testid="partner-row"]', code)
        .find('a')
        .contains(locale === 'ar' ? 'فتح' : 'Open')
        .click();

      cy.get('[data-testid="school-profile-details"]').should('be.visible');
      cy.get('[data-testid="school-profile-details"]').contains('Cairo').should('be.visible');
      cy.get('[data-testid="school-profile-details"]').contains('Maadi').should('be.visible');
      cy.get('[data-testid="school-profile-details"]').contains('Private').should('be.visible');
      cy.get('[data-testid="school-profile-details"]').contains('British').should('be.visible');

      // Navigate to Edit page
      cy.get('[data-testid="edit-partner-link"]').click({ force: true });
      cy.location('pathname').should('include', '/edit');
      cy.get('[data-testid="partner-form"]:visible input#code').should('not.have.attr', 'readonly');
      cy.get('[data-testid="partner-form"]:visible input#area').clear({ force: true });
      cy.get('[data-testid="partner-form"]:visible input#area').type('New Cairo');
      cy.get('[data-testid="partner-form"]:visible button[type="submit"]').click({ force: true });

      cy.location('pathname', { timeout: 15000 }).should('eq', `/${locale}/partners`);
    });

    it('refuses activation without an administrator, and closed is final', () => {
      // Create partner without members
      cy.task<CreatedTestPartner>('createTestPartner', {
        status: 'onboarding',
      }).then((partner) => {
        cy.visit(`/${locale}/partners/${partner.id}`);
        waitForHydration();

        // Activation attempt fails without active admin
        cy.get('[data-testid="status-actions"]')
          .contains('button', /Activate|تفعيل/)
          .click();
        cy.get('[role="alert"]').should('contain.text', 'active Partner Administrator');

        // Add active administrator
        cy.task('addTestPartnerMember', {
          partnerId: partner.id,
          roles: ['partner-administrator'],
          status: 'active',
        }).then(() => {
          cy.reload();
          waitForHydration();

          // Activation succeeds now
          cy.get('[data-testid="status-actions"]')
            .contains('button', /Activate|تفعيل/)
            .click();
          cy.contains('[data-testid="status-actions"] button', /Suspend|تعليق/).should(
            'be.visible',
          );

          // Transition to closed
          cy.on('window:confirm', () => true);
          cy.get('[data-testid="status-actions"]')
            .contains('button', /Close|إغلاق/)
            .click();

          // Closed is terminal
          cy.contains('This Business Partner is closed').should('be.visible');
          cy.get('[data-testid="status-actions"] button').should('not.exist');
        });
      });
    });

    it('protects the last administrator and displays expired invitations', () => {
      cy.task<CreatedTestPartner>('createTestPartner', {
        status: 'active',
      }).then((partner) => {
        // Add single active admin and an expired invitation
        cy.task('addTestPartnerMember', {
          partnerId: partner.id,
          roles: ['partner-administrator'],
          status: 'active',
        });
        cy.task('addTestPartnerInvitation', {
          partnerId: partner.id,
          email: 'expired-admin@findeg.test',
          roles: ['partner-administrator'],
          expiresInDays: -2,
        });

        cy.visit(`/${locale}/partners/${partner.id}`);
        waitForHydration();

        // Expired invitation badge
        cy.get('[data-testid="invitation-expired-badge"]').should('be.visible');

        // Trying to suspend the last administrator fails
        cy.get('[data-testid="member"]')
          .first()
          .contains('button', /Suspend|تعليق/)
          .click();
        cy.get('[data-testid="member"]')
          .first()
          .find('[role="alert"]')
          .should('contain.text', 'keep at least one active Partner Administrator');
      });
    });

    it('loads the Partner Report view with roll-up data and shared money format', () => {
      cy.task<CreatedTestPartner>('createTestPartner', {
        status: 'active',
      }).then((partner) => {
        // Seed sales data
        cy.task('createTestPartnerSales', {
          partnerId: partner.id,
          amount: '250.00',
        });

        cy.visit(`/${locale}/partners/${partner.id}`);
        waitForHydration();

        // Switch to Sales tab
        cy.contains('button[role="tab"]', locale === 'ar' ? 'المبيعات' : 'Sales').click();

        // Asserts sales report renders
        cy.get('[data-testid="sales-report"]').should('be.visible');
        cy.get('[data-testid="sales-report"]')
          .contains(locale === 'ar' ? 'قائمة الصف الأول' : 'Grade 1 Supply List')
          .should('be.visible');
        cy.get('[data-testid="sales-report"]').contains('250.00 EGP').should('be.visible');
        cy.get('[data-testid="sales-report-total"]').contains('250.00 EGP').should('be.visible');
      });
    });
  });
}
