for (const locale of ['en', 'ar']) {
  const text = (en, ar) => locale === 'en' ? en : ar;
  it(`${locale}: unlisted list choices resume and incomplete COD checkout stays separate from the Cart`, () => {
    cy.task('listFixture').then(({ code, listId, itemId, alternativeId, sku, zoneId }) => {
      cy.viewport(locale === 'ar' ? 390 : 1100, 900);
      cy.visit(`/${locale}`);
      cy.contains('li', sku).contains('button', text('Add to Cart', 'أضف إلى السلة')).click();
      cy.get(`section[aria-label="${text('Your Cart', 'سلة التسوق')}"] input`).should('have.value', '1');
      cy.visit(`/${locale}/lists`);
      cy.get('input[name="code"]').type(code);
      cy.contains('button', text('Open list', 'فتح القائمة')).click();
      cy.get(`[data-list-item="${itemId}"]`).within(() => {
        cy.get('input[type="number"]').should('have.value', '2');
        cy.contains(text('Alternative Brand', 'علامة البديل'));
        cy.contains('red');
        cy.get('select').select(String(alternativeId));
        cy.get('input[type="number"]').should('not.be.disabled').clear().type('1').blur();
      });
      cy.contains('button', text('Save choices', 'حفظ الاختيارات')).click();
      cy.contains(text('List incomplete — you can still checkout', 'القائمة غير مكتملة — يمكنك إتمام الطلب'));
      cy.contains('8.00 EGP');
      cy.reload();
      cy.get(`[data-list-item="${itemId}"] select`).should('have.value', String(alternativeId));
      cy.get(`[data-list-item="${itemId}"] input[type="number"]`).should('have.value', '1');
      cy.get('input[name="name"]').type('Test Customer');
      cy.get('input[name="email"]').type('customer@example.test');
      cy.get('input[name="phone"]').type('01012345678');
      cy.get('input[name="street"]').type('10 Test Street');
      cy.get('input[name="city"]').type('Cairo');
      cy.get('select[name="zoneId"]').select(String(zoneId));
      cy.contains('button', text('Review total', 'مراجعة الإجمالي')).click();
      cy.contains('28.00 EGP');
      cy.intercept('POST', `/api/v1/commerce/list-selections/${code}/checkout`).as('listCheckout');
      if (locale === 'en') {
        cy.intercept({ method: 'POST', url: `/api/v1/commerce/list-selections/${code}/checkout`, times: 1 }, request => request.continue(response => response.send({ statusCode: 503, body: {} }))).as('lostListCheckout');
      }
      cy.contains('button', text('Confirm Order', 'تأكيد الطلب')).click();
      if (locale === 'en') {
        cy.wait('@lostListCheckout').then(({ request }) => cy.wrap(request.body).as('original'));
        cy.contains('The checkout outcome is uncertain.');
        cy.reload();
        cy.contains('button', 'Retry same checkout').click();
      }
      cy.wait('@listCheckout').then(({ request, response }) => {
        if (locale === 'en') cy.get('@original').then(original => expect(request.body).to.deep.equal(original));
        expect(response.statusCode).to.equal(201);
        expect(response.body.total).to.equal('28.00');
        cy.contains(text('Order accepted', 'تم قبول الطلب'));
        cy.task('guestCode', response.body.accessReference).then(code => {
          cy.intercept('POST', '/api/v1/commerce/orders/access').as('access');
          cy.get('input[name="code"]').type(code);
          cy.contains('button', text('Retrieve Order', 'استرجاع الطلب')).click();
          cy.wait('@access').then(({ response }) => {
            expect(response.body.order.items[0].attribution.listId).to.equal(listId);
            expect(response.body.order.items[0].attribution.alternative).to.equal(true);
          });
        });
      });
      cy.task('archiveList', listId);
      cy.reload();
      cy.contains(text('Archived list', 'قائمة مؤرشفة'));
      cy.get(`[data-list-item="${itemId}"] input[type="checkbox"]`).should('be.disabled');
      cy.visit(`/${locale}`);
      cy.get(`section[aria-label="${text('Your Cart', 'سلة التسوق')}"] input`).should('have.value', '1');
    });
  });
  it(`${locale}: Customer can repair multiple stale choices and include an optional alternative without its default`, () => {
    cy.task('listFixture').then(({ code, itemId, variantId, alternativeId }) => {
      cy.visit(`/${locale}/lists/${code}`);
      cy.get('[data-list-item]').last().find('input[type="checkbox"]').check();
      cy.contains('button', text('Save choices', 'حفظ الاختيارات')).click();
      cy.contains('button', text('Save choices', 'حفظ الاختيارات')).should('be.disabled');
      cy.task('staleListDefaults', { variantId, alternativeId }).then(recoveryId => {
        cy.reload();
        cy.contains(text('Some choices are unavailable.', 'بعض الاختيارات غير متاحة.'));
        cy.get('[data-list-item] select').each(select => cy.wrap(select).select(String(recoveryId)));
        cy.contains('button', text('Save choices', 'حفظ الاختيارات')).click();
        cy.contains(text('List complete', 'القائمة مكتملة'));
        cy.get('[data-list-item]').last().find('input[type="checkbox"]').uncheck();
        cy.contains('button', text('Save choices', 'حفظ الاختيارات')).click();
        cy.contains('button', text('Save choices', 'حفظ الاختيارات')).should('be.disabled');
        cy.reload();
        cy.get('[data-list-item]').last().find('input[type="checkbox"]').should('be.disabled');
        cy.get('[data-list-item]').last().find('select').select(String(recoveryId));
        cy.get(`[data-list-item="${itemId}"] input[type="number"]`).clear().type('5').blur();
        cy.get('input[name="setCount"]').focus().blur();
        cy.get(`[data-list-item="${itemId}"] input[type="number"]`).should('have.value', '5');
        cy.contains('button', text('Save choices', 'حفظ الاختيارات')).click();
        cy.contains('button', text('Save choices', 'حفظ الاختيارات')).should('be.disabled');
        cy.reload();
        cy.get(`[data-list-item="${itemId}"] input[type="number"]`).should('have.value', '5');
        cy.get('[data-list-item]').last().find('select').should('have.value', String(recoveryId));
      });
    });
  });

}
