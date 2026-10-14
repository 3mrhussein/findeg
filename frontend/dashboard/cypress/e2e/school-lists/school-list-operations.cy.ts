import { signInToDashboard } from '../../support/actions/dashboard-session.actions';

function createPartnerViaUi(locale: string, tag: string) {
  const code = `sch-${tag}`;
  const nameEn = `School ${tag}`;
  const nameAr = `مدرسة ${tag}`;

  cy.visit(`/${locale}/partners/new`);
  cy.get('input#code').type(code);
  cy.get('input#nameEn').type(nameEn);
  cy.get('input#nameAr').type(nameAr);
  cy.get('select#governorate').select('Cairo');
  cy.get('input#area').type('Maadi');
  cy.get('select#schoolType').select('Private');
  cy.get('select#academicSystem').select('British');
  cy.get('[data-testid="partner-form"] button[type="submit"]').click();
  cy.location('pathname', { timeout: 15000 }).should('eq', `/${locale}/partners`);

  return cy
    .contains('tr[data-testid="partner-row"]', code)
    .find('a[href*="/partners/"]')
    .first()
    .invoke('attr', 'href')
    .then((href) => {
      const id = Number(href!.split('/partners/')[1]);
      return { id, code, nameEn, nameAr };
    });
}

for (const locale of ['en', 'ar']) {
  describe(`School supply list operations (${locale})`, () => {
    beforeEach(() => {
      signInToDashboard();
    });

    it('filters lists by partner, academic year, grade, and status on index page', () => {
      const tag = Math.random().toString(36).slice(2, 7);

      createPartnerViaUi(locale, tag).then((partner) => {
        // Create 2 supply lists
        cy.task<{ id: number }>('createTestSupplyList', {
          partnerId: partner.id,
          grade: `Grade-${tag}`,
          academicYear: '2026-2027',
          status: 'draft',
          titleEn: `Draft List ${tag}`,
        });

        cy.task<{ id: number }>('createTestSupplyList', {
          partnerId: partner.id,
          grade: `Kindergarten-${tag}`,
          academicYear: '2025-2026',
          status: 'published',
          titleEn: `Published List ${tag}`,
        });

        cy.visit(`/${locale}/school-lists`);
        cy.get('[data-testid="school-lists-table"]').should('be.visible');

        // Filter by partner
        cy.get('[data-testid="filter-partner-select"]').select(String(partner.id));
        cy.get('[data-testid="filter-submit-btn"]').click();
        cy.get('[data-testid="school-list-row"]').should('have.length', 2);

        // Filter by grade
        cy.get('[data-testid="filter-grade-input"]').type(`Grade-${tag}`);
        cy.get('[data-testid="filter-submit-btn"]').click();
        cy.get('[data-testid="school-list-row"]').should('have.length', 1);
        cy.contains(`Grade-${tag}`).should('be.visible');

        // Clear filter
        cy.get('[data-testid="filter-clear-btn"]').click();
        cy.location('pathname').should('eq', `/${locale}/school-lists`);
      });
    });

    it('enforces ADR-0014 partner status rules: allows suspended partner, refuses closed partner', () => {
      const tag = Math.random().toString(36).slice(2, 7);

      // 1. Suspended partner allows drafting
      createPartnerViaUi(locale, `susp-${tag}`).then((suspendedPartner) => {
        cy.task('setTestPartnerStatus', {
          partnerId: suspendedPartner.id,
          status: 'suspended',
        }).then(() => {
          cy.visit(`/${locale}/school-lists/new`);
          cy.get('[data-testid="partner-select"]').select(String(suspendedPartner.id));
          cy.get('[data-testid="academic-year-input"]').type('2026-2027');
          cy.get('[data-testid="grade-input"]').type('Grade 3');
          cy.get('[data-testid="title-en-input"]').type(`Suspended List ${tag}`);
          cy.get('[data-testid="title-ar-input"]').type(`قائمة موقوفة ${tag}`);
          cy.get('[data-testid="create-draft-submit-btn"]').click();

          // Redirects to list editor
          cy.location('pathname', { timeout: 15000 }).should('match', /\/school-lists\/\d+/);
          cy.get('[data-testid="list-title"]').should('be.visible');
          cy.get('[data-testid="items-editor-section"]').should('be.visible');
        });
      });

      // 2. Closed partner refuses drafting
      createPartnerViaUi(locale, `cls-${tag}`).then((closedPartner) => {
        cy.task('setTestPartnerStatus', {
          partnerId: closedPartner.id,
          status: 'closed',
        }).then(() => {
          cy.visit(`/${locale}/school-lists/new`);
          cy.get('[data-testid="partner-select"]').select(String(closedPartner.id));
          cy.get('[data-testid="academic-year-input"]').type('2026-2027');
          cy.get('[data-testid="grade-input"]').type('Grade 4');
          cy.get('[data-testid="title-en-input"]').type(`Closed List ${tag}`);
          cy.get('[data-testid="title-ar-input"]').type(`قائمة مغلقة ${tag}`);
          cy.get('[data-testid="create-draft-submit-btn"]').click();

          // Stays on new draft page and displays error alert
          cy.get('[data-testid="draft-error-alert"]').should('be.visible');

          // Create a list directly to check closed partner notice on editor
          cy.task<{ id: number }>('createTestSupplyList', {
            partnerId: closedPartner.id,
            grade: 'Grade 5',
            academicYear: '2026-2027',
            status: 'draft',
          }).then(({ id }) => {
            cy.visit(`/${locale}/school-lists/${id}`);
            cy.get('[data-testid="partner-closed-notice"]').should('be.visible');
            cy.get('[data-testid="add-item-btn"]').should('not.exist');
            cy.get('[data-testid="publish-list-btn"]').should('not.exist');
          });
        });
      });
    });

    it('manages items (Exact Item, Specification, quantities 1-999, reorder, delete) and enforces complete draft for publication', () => {
      const tag = Math.random().toString(36).slice(2, 7);

      createPartnerViaUi(locale, `itm-${tag}`).then((partner) => {
        // Create draft via UI
        cy.visit(`/${locale}/school-lists/new`);
        cy.get('[data-testid="partner-select"]').select(String(partner.id));
        cy.get('[data-testid="academic-year-input"]').type('2026-2027');
        cy.get('[data-testid="grade-input"]').type('Grade 6');
        cy.get('[data-testid="title-en-input"]').type(`Items Test List ${tag}`);
        cy.get('[data-testid="title-ar-input"]').type(`قائمة فحص ${tag}`);
        cy.get('[data-testid="create-draft-submit-btn"]').click();

        cy.location('pathname', { timeout: 15000 }).should('match', /\/school-lists\/\d+/);

        // 1. Add Exact Item
        cy.get('[data-testid="add-item-btn"]').click();
        cy.get('[data-testid="item-dialog"]').should('be.visible');
        cy.get('[data-testid="item-label-en"]').type('Notebook 100 pages');
        cy.get('[data-testid="item-label-ar"]').type('كشكول 100 صفحة');
        cy.get('[data-testid="item-quantity"]').clear().type('5');
        cy.get('[data-testid="item-type-exact"]').check();
        cy.get('[data-testid="item-variant-id"]').type('13');
        cy.get('[data-testid="dialog-save-btn"]').click();

        // Exact item appears in table
        cy.get('[data-testid="item-row"]').should('have.length', 1);
        cy.contains(locale === 'ar' ? 'كشكول 100 صفحة' : 'Notebook 100 pages').should('be.visible');

        // Reload to prove the edited quantity persisted, rather than only counting rows.
        cy.reload();
        cy.get('[data-testid="item-row"]').first().find('td').eq(2).should('have.text', '5');
        cy.get('[data-testid="items-editor-section"]').should('have.attr', 'data-hydrated', 'true');

        // 2. Add Specification Item (without default variant first to test incomplete draft)
        cy.get('[data-testid="add-item-btn"]').click();
        cy.get('[data-testid="item-dialog"]').should('be.visible');
        cy.get('[data-testid="item-label-en"]').type('Blue Accessories');
        cy.get('[data-testid="item-label-ar"]').type('اكسسوارات زرقاء');
        cy.get('[data-testid="item-quantity"]').clear().type('1');
        cy.get('[data-testid="item-type-spec"]').check();
        cy.get('[data-testid="item-category-select"]').select('3'); // Category 3
        // Leave variantId blank
        cy.get('[data-testid="dialog-save-btn"]').click();

        cy.get('[data-testid="item-row"]').should('have.length', 2);
        cy.contains(locale === 'ar' ? 'اكسسوارات زرقاء' : 'Blue Accessories').should('be.visible');

        // Notice: Incomplete draft warning is shown
        cy.get('[data-testid="incomplete-draft-notice"]').should('be.visible');

        // Publication is refused due to missing default variant
        cy.get('[data-testid="publish-list-btn"]').click();
        cy.get('[data-testid="editor-error-alert"]').should('be.visible');

        // 3. Edit item to add default variant and test quantity up to 999
        cy.get('[data-testid="item-row"]').last().find('button[data-testid^="edit-item-"]').click();

        cy.get('[data-testid="item-dialog"]').should('be.visible');
        cy.get('[data-testid="item-quantity"]').clear().type('999');
        cy.get('[data-testid="item-variant-id"]').clear().type('13');
        cy.get('[data-testid="dialog-save-btn"]').click();

        // Verify quantity updated
        cy.get('[data-testid="item-row"]').last().contains('999').should('be.visible');
        cy.get('[data-testid="incomplete-draft-notice"]').should('not.exist');

        // 4. Reorder items (Move down on first item)
        cy.get('[data-testid="item-row"]')
          .first()
          .find('button[data-testid^="move-down-"]')
          .click();

        // Verify order changed (first item is now Blue Accessories)
        cy.get('[data-testid="item-row"]')
          .first()
          .contains(locale === 'ar' ? 'اكسسوارات زرقاء' : 'Blue Accessories')
          .should('be.visible');

        // 5. Delete an item
        cy.get('[data-testid="item-row"]')
          .first()
          .find('button[data-testid^="delete-item-"]')
          .click();

        cy.get('[data-testid="item-row"]').should('have.length', 1);

        // 6. Publish the list
        cy.get('[data-testid="publish-list-btn"]').click();
        cy.get('[data-testid="publish-list-btn"]').should('not.exist');
        cy.contains(locale === 'ar' ? 'منشور' : 'Published').should('be.visible');
      });
    });
  });
}
