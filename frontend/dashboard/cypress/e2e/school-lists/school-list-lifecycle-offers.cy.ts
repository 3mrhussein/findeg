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
  describe(`School supply list lifecycle, replacement, archiving, and offers (${locale})`, () => {
    beforeEach(() => {
      signInToDashboard();
      cy.task('setTestVariantStatus', { variantId: 13, isActive: true });
      cy.task('setTestVariantStock', { variantId: 13, onHand: 100 });
    });

    it('refuses publishing an empty list, then publish succeeds after adding items', () => {
      const tag = Math.random().toString(36).slice(2, 7);

      createPartnerViaUi(locale, `emp-${tag}`).then((partner) => {
        // Create an empty draft
        cy.task<{ id: number }>('createTestSupplyList', {
          partnerId: partner.id,
          grade: `Grade-${tag}`,
          academicYear: '2026-2027',
          status: 'draft',
          titleEn: `Empty Draft ${tag}`,
          titleAr: `مسودة فارغة ${tag}`,
        }).then(({ id }) => {
          cy.visit(`/${locale}/school-lists/${id}`);
          cy.get('[data-testid="empty-items-notice"]').should('be.visible');

          // Attempt to publish empty list
          cy.get('[data-testid="publish-list-btn"]')
            .should('be.visible')
            .and('not.be.disabled')
            .click();
          cy.get('[data-testid="editor-error-alert"]').should('be.visible');

          // Add an item with active default variant (variantId 13) via UI
          cy.task('setTestVariantStock', { variantId: 13, onHand: 50 });
          cy.task('setTestVariantStatus', { variantId: 13, isActive: true });

          cy.get('[data-testid="add-item-btn"]')
            .should('be.visible')
            .and('not.be.disabled')
            .click();
          cy.get('[data-testid="item-dialog"]').should('be.visible');
          cy.get('[data-testid="item-label-en"]').type('Notebook 100 pages');
          cy.get('[data-testid="item-label-ar"]').type('كشكول 100 صفحة');
          cy.get('[data-testid="item-quantity"]').clear().type('2');
          cy.get('[data-testid="item-type-exact"]').check();
          cy.get('[data-testid="item-variant-id"]').type('13');
          cy.get('[data-testid="dialog-save-btn"]').click();
          cy.get('[data-testid="item-dialog"]').should('not.exist');

          cy.get('[data-testid="item-row"]:visible').should('have.length', 1);

          // Publish succeeds now
          cy.get('[data-testid="publish-list-btn"]')
            .should('be.visible')
            .and('not.be.disabled')
            .click();
          cy.get('[data-testid="publish-list-btn"]').should('not.exist');
          cy.contains(locale === 'ar' ? 'منشور' : 'Published').should('be.visible');
        });
      });
    });

    it('performs a List Replacement: archives the old list and copies its List Offer', () => {
      const tag = Math.random().toString(36).slice(2, 7);

      createPartnerViaUi(locale, `rep-${tag}`).then((partner) => {
        // Ensure variant 13 is active with stock
        cy.task('setTestVariantStatus', { variantId: 13, isActive: true });
        cy.task('setTestVariantStock', { variantId: 13, onHand: 100 });

        // 1. Create published List A
        cy.task<{ id: number }>('createTestSupplyList', {
          partnerId: partner.id,
          grade: `Grade-${tag}`,
          academicYear: '2026-2027',
          status: 'draft',
          titleEn: `Original List ${tag}`,
          titleAr: `قائمة أصلية ${tag}`,
        }).then(({ id: listAId }) => {
          cy.task('addTestSupplyListItem', {
            listId: listAId,
            variantId: 13,
            exactItem: true,
            quantity: 3,
          });
          cy.task('setTestSupplyListStatus', { listId: listAId, status: 'published' });

          // Set 15% discount offer on List A
          cy.task('setTestSupplyListOffer', {
            listId: listAId,
            basisPoints: 1500,
            startsAt: '2026-10-01T00:00:00.000Z',
          });

          cy.visit(`/${locale}/school-lists/${listAId}`);
          cy.contains(locale === 'ar' ? 'منشور' : 'Published').should('be.visible');
          cy.get('[data-testid="clone-list-btn"]').should('be.visible');

          // 2. Clone List A to create Draft List B
          cy.get('[data-testid="clone-list-btn"]')
            .should('be.visible')
            .and('not.be.disabled')
            .click();

          // Redirects to new draft List B
          cy.location('pathname', { timeout: 15000 }).should(
            'not.eq',
            `/${locale}/school-lists/${listAId}`,
          );
          cy.location('pathname').then((pathname) => {
            const listBId = Number(pathname.split('/school-lists/')[1]);
            expect(listBId).not.to.eq(listAId);

            cy.get('[data-testid="publish-list-btn"]').should('be.visible').and('not.be.disabled');
            cy.get('[data-testid="item-row"]:visible').should('have.length', 1);

            // 3. Publish List B
            cy.get('[data-testid="publish-list-btn"]')
              .should('be.visible')
              .and('not.be.disabled')
              .click();
            cy.get('[data-testid="publish-list-btn"]').should('not.exist');
            cy.contains(locale === 'ar' ? 'منشور' : 'Published').should('be.visible');

            // Replaces notice appears on List B
            cy.get('[data-testid="replaces-list-notice"]').should('be.visible');

            // 4. Verify DB state: List A archived with replaced_by_id = List B
            cy.task<{ status: string; replacedById: number | null }>('getTestSupplyList', {
              listId: listAId,
            }).then((listA) => {
              expect(listA?.status).to.eq('archived');
              expect(listA?.replacedById).to.eq(listBId);
            });

            // List B published with replaces_list_id = List A
            cy.task<{ status: string; replacesListId: number | null }>('getTestSupplyList', {
              listId: listBId,
            }).then((listB) => {
              expect(listB?.status).to.eq('published');
              expect(listB?.replacesListId).to.eq(listAId);
            });

            // List B automatically inherited List A's offer (1500 basis points)
            cy.task<{ basisPoints: number } | null>('getTestSupplyListOffer', {
              listId: listBId,
            }).then((offerB) => {
              expect(offerB).not.to.be.null;
              expect(offerB?.basisPoints).to.eq(1500);
            });

            // Check List A page displays replaced-by notice
            cy.visit(`/${locale}/school-lists/${listAId}`);
            cy.get('[data-testid="replaced-by-list-notice"]').should('be.visible');
          });
        });
      });
    });

    it('refuses an out-of-range offer and saves a valid offer with time window and shared Money preview', () => {
      const tag = Math.random().toString(36).slice(2, 7);

      createPartnerViaUi(locale, `ofr-${tag}`).then((partner) => {
        cy.task<{ id: number }>('createTestSupplyList', {
          partnerId: partner.id,
          grade: `Grade-${tag}`,
          academicYear: '2026-2027',
          status: 'published',
        }).then(({ id }) => {
          cy.visit(`/${locale}/school-lists/${id}`);
          cy.get('[data-testid="offer-form"]').should('be.visible');

          // 1. Out of bounds discount (> 100%)
          cy.get('[data-testid="offer-percent-input"]').clear().type('150');
          cy.get('[data-testid="offer-starts-input"]').type('2026-10-15T10:00');
          cy.get('[data-testid="save-offer-btn"]').click();
          cy.get('[data-testid="offer-error-alert"]').should('be.visible');

          // 2. Invalid window: end date before start date
          cy.get('[data-testid="offer-percent-input"]').clear().type('25');
          cy.get('[data-testid="offer-starts-input"]').clear().type('2026-10-20T10:00');
          cy.get('[data-testid="offer-ends-input"]').clear().type('2026-10-10T10:00');
          cy.get('[data-testid="save-offer-btn"]').click();
          cy.get('[data-testid="offer-error-alert"]').should('be.visible');

          // 3. Valid open-ended offer (20%)
          cy.get('[data-testid="offer-percent-input"]').clear().type('20');
          cy.get('[data-testid="offer-starts-input"]').clear().type('2026-10-15T10:00');
          cy.get('[data-testid="offer-ends-input"]').clear();
          cy.get('[data-testid="save-offer-btn"]').click();

          // Verify offer saved
          cy.get('[data-testid="offer-saved-alert"]').should('be.visible');
          cy.get('[data-testid="current-offer-card"]').should('be.visible');
          cy.get('[data-testid="offer-money-example"]').should('be.visible');

          // In en & ar: shared formatEgp outputs ASCII digits 80.00
          cy.get('[data-testid="offer-money-example"]').contains('80.00');
        });
      });
    });

    it('covers clone from non-draft, and archive from published across partner statuses (active, suspended, closed)', () => {
      const tag = Math.random().toString(36).slice(2, 7);

      // 1. Active partner: Archive published list, then clone archived list
      createPartnerViaUi(locale, `act-${tag}`).then((partner) => {
        cy.task<{ id: number }>('createTestSupplyList', {
          partnerId: partner.id,
          grade: 'Grade 1',
          academicYear: '2026-2027',
          status: 'draft',
        }).then(({ id }) => {
          cy.task('addTestSupplyListItem', { listId: id, variantId: 13 });
          cy.task('setTestSupplyListStatus', { listId: id, status: 'published' });
          cy.visit(`/${locale}/school-lists/${id}`);
          cy.get('[data-testid="archive-list-btn"]')
            .should('be.visible')
            .and('not.be.disabled')
            .click();

          // Status becomes archived
          cy.contains(locale === 'ar' ? 'مؤرشف' : 'Archived').should('be.visible');

          // Clone from archived list (non-draft)
          cy.get('[data-testid="clone-list-btn"]')
            .should('be.visible')
            .and('not.be.disabled')
            .click();
          cy.location('pathname', { timeout: 15000 }).should(
            'not.eq',
            `/${locale}/school-lists/${id}`,
          );
          cy.contains(locale === 'ar' ? 'مسودة' : 'Draft').should('be.visible');
        });
      });

      // 2. Suspended partner: Archiving published list succeeds, cloning archived list succeeds
      createPartnerViaUi(locale, `sus-${tag}`).then((partner) => {
        cy.task('setTestPartnerStatus', { partnerId: partner.id, status: 'suspended' });
        cy.task<{ id: number }>('createTestSupplyList', {
          partnerId: partner.id,
          grade: 'Grade 2',
          academicYear: '2026-2027',
          status: 'draft',
        }).then(({ id }) => {
          cy.task('addTestSupplyListItem', { listId: id, variantId: 13 });
          cy.task('setTestSupplyListStatus', { listId: id, status: 'published' });
          cy.visit(`/${locale}/school-lists/${id}`);
          cy.get('[data-testid="archive-list-btn"]')
            .should('be.visible')
            .and('not.be.disabled')
            .click();
          cy.contains(locale === 'ar' ? 'مؤرشف' : 'Archived').should('be.visible');

          cy.get('[data-testid="clone-list-btn"]')
            .should('be.visible')
            .and('not.be.disabled')
            .click();
          cy.location('pathname', { timeout: 15000 }).should(
            'not.eq',
            `/${locale}/school-lists/${id}`,
          );
          cy.contains(locale === 'ar' ? 'مسودة' : 'Draft').should('be.visible');
        });
      });

      // 3. Closed partner: Archiving works in ANY partner status (ADR-0012); cloning is disabled
      createPartnerViaUi(locale, `cls-${tag}`).then((partner) => {
        cy.task('setTestPartnerStatus', { partnerId: partner.id, status: 'closed' });
        cy.task<{ id: number }>('createTestSupplyList', {
          partnerId: partner.id,
          grade: 'Grade 3',
          academicYear: '2026-2027',
          status: 'draft',
        }).then(({ id }) => {
          cy.task('addTestSupplyListItem', { listId: id, variantId: 13 });
          cy.task('setTestSupplyListStatus', { listId: id, status: 'published' });
          cy.visit(`/${locale}/school-lists/${id}`);

          // Archive works for closed partner!
          cy.get('[data-testid="archive-list-btn"]')
            .should('be.visible')
            .and('not.be.disabled')
            .click();
          cy.contains(locale === 'ar' ? 'مؤرشف' : 'Archived').should('be.visible');

          // Clone is disabled because partner is closed
          cy.get('[data-testid="clone-list-btn"]').should('be.disabled');
        });
      });
    });

    it('refuses inactive default variant, warns on out-of-stock default, and refuses older-copy replacement', () => {
      const tag = Math.random().toString(36).slice(2, 7);

      createPartnerViaUi(locale, `chk-${tag}`).then((partner) => {
        // 1. Inactive default variant refusal
        cy.task<{ id: number }>('createTestSupplyList', {
          partnerId: partner.id,
          grade: `Grade-A-${tag}`,
          academicYear: '2026-2027',
          status: 'draft',
        }).then(({ id: draftId }) => {
          cy.task('addTestSupplyListItem', { listId: draftId, variantId: 13 });
          cy.task('setTestVariantStatus', { variantId: 13, isActive: false });

          cy.visit(`/${locale}/school-lists/${draftId}`);
          cy.get('[data-testid="publish-list-btn"]')
            .should('be.visible')
            .and('not.be.disabled')
            .click();
          cy.get('[data-testid="editor-error-alert"]').should('be.visible');

          // Restore variant 13 to active
          cy.task('setTestVariantStatus', { variantId: 13, isActive: true });
        });

        // 2. Out-of-stock default variant warning
        cy.task<{ id: number }>('createTestSupplyList', {
          partnerId: partner.id,
          grade: `Grade-B-${tag}`,
          academicYear: '2026-2027',
          status: 'draft',
        }).then(({ id: draftId }) => {
          cy.task('addTestSupplyListItem', { listId: draftId, variantId: 13 });
          // Set stock to 0
          cy.task('setTestVariantStock', { variantId: 13, onHand: 0, reserved: 0 });

          cy.visit(`/${locale}/school-lists/${draftId}`);
          cy.get('[data-testid="publish-list-btn"]')
            .should('be.visible')
            .and('not.be.disabled')
            .click();

          // Publishes successfully AND displays out-of-stock warning
          cy.get('[data-testid="publish-list-btn"]').should('not.exist');
          cy.contains(locale === 'ar' ? 'منشور' : 'Published').should('be.visible');
          cy.get('[data-testid="out-of-stock-warning"]').should('be.visible');
        });

        // 3. Older-copy replacement refusal (slot-taken)
        // Create published List 1 in slot (Grade-C, 2026-2027)
        cy.task<{ id: number }>('createTestSupplyList', {
          partnerId: partner.id,
          grade: `Grade-C-${tag}`,
          academicYear: '2026-2027',
          status: 'draft',
        }).then(({ id: list1Id }) => {
          cy.task('addTestSupplyListItem', { listId: list1Id, variantId: 13 });
          cy.task('setTestSupplyListStatus', { listId: list1Id, status: 'published' });
          cy.task('setTestVariantStock', { variantId: 13, onHand: 50 });

          // Create Draft 2 (copy of List 1)
          cy.task<{ id: number }>('createTestSupplyList', {
            partnerId: partner.id,
            grade: `Grade-C-${tag}`,
            academicYear: '2026-2027',
            status: 'draft',
            sourceListId: list1Id,
          }).then(({ id: draft2Id }) => {
            cy.task('addTestSupplyListItem', { listId: draft2Id, variantId: 13 });

            // Create Draft 3 (also copy of List 1)
            cy.task<{ id: number }>('createTestSupplyList', {
              partnerId: partner.id,
              grade: `Grade-C-${tag}`,
              academicYear: '2026-2027',
              status: 'draft',
              sourceListId: list1Id,
            }).then(({ id: draft3Id }) => {
              cy.task('addTestSupplyListItem', { listId: draft3Id, variantId: 13 });

              // Publish Draft 2 -> replaces List 1 and becomes the new published incumbent in the slot
              cy.visit(`/${locale}/school-lists/${draft2Id}`);
              cy.get('[data-testid="publish-list-btn"]')
                .should('be.visible')
                .and('not.be.disabled')
                .click();
              cy.get('[data-testid="publish-list-btn"]').should('not.exist');
              cy.contains(locale === 'ar' ? 'منشور' : 'Published').should('be.visible');

              // Now attempt to publish Draft 3 (which was cloned from older List 1, not Draft 2)
              cy.visit(`/${locale}/school-lists/${draft3Id}`);
              cy.get('[data-testid="publish-list-btn"]')
                .should('be.visible')
                .and('not.be.disabled')
                .click();

              // Refused with slot-taken error
              cy.get('[data-testid="editor-error-alert"]').should('be.visible');
            });
          });
        });
      });
    });
  });
}
