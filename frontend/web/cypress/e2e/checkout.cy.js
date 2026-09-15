for (const locale of ['en', 'ar']) {
  const text = (en, ar) => locale === 'en' ? en : ar;
  it(`${locale}: Customer adds to Cart, confirms COD and verifies Guest Order Access`, () => {
    cy.task('checkoutFixture').then(({ sku, zoneId }) => {
      cy.viewport(locale === 'ar' ? 390 : 1100, 900);
      cy.visit(`/${locale}`);
      cy.contains('li', sku).contains('button', text('Add to Cart', 'أضف إلى السلة')).click();
      cy.get(`section[aria-label="${text('Your Cart', 'سلة التسوق')}"]`).within(() => {
        cy.contains('12.50 EGP');
        cy.get('input[type="number"]').should('have.value', '1');
      });
      cy.reload();
      cy.get(`section[aria-label="${text('Your Cart', 'سلة التسوق')}"] input`).should('have.value', '1');
      cy.get('input[name="name"]').type('Test Customer');
      cy.get('input[name="email"]').type('customer@example.test');
      cy.get('input[name="phone"]').type('01012345678');
      cy.get('input[name="street"]').type('10 Test Street');
      cy.get('input[name="city"]').type('Cairo');
      cy.get('select[name="zoneId"]').select(String(zoneId));
      cy.contains('button', text('Review total', 'مراجعة الإجمالي')).click();
      cy.contains('32.50 EGP');
      cy.intercept('POST', '/api/v1/commerce/checkout').as('checkout');
      if (locale === 'en') {
        cy.intercept({ method: 'POST', url: '/api/v1/commerce/checkout', times: 1 }, (request) => request.continue((response) => { response.send({ statusCode: 503, body: { status: 'temporarily-unavailable' } }); })).as('lostCheckout');
      }
      cy.contains('button', text('Confirm Order', 'تأكيد الطلب')).click();
      if (locale === 'en') {
        cy.wait('@lostCheckout').then(({ request }) => cy.wrap(request.body).as('originalCheckout'));
        cy.contains('The checkout outcome is uncertain.');
        cy.reload();
        cy.contains('button', 'Retry same checkout').click();
      }
      cy.wait('@checkout').then(({ request, response }) => {
        if (locale === 'en') cy.get('@originalCheckout').then((original) => expect(request.body).to.deep.equal(original));
        expect(response.statusCode).to.equal(201);
        expect(response.body.total).to.equal('32.50');
        cy.contains(text('Order accepted', 'تم قبول الطلب'));
        cy.task('guestCode', response.body.accessReference).then((code) => {
          cy.get('input[name="code"]').type(code);
          cy.contains('button', text('Retrieve Order', 'استرجاع الطلب')).click();
          cy.contains('h3', text('Your Order', 'طلبك'));
          cy.contains('button', text('Retrieve Order', 'استرجاع الطلب')).click();
          cy.contains(text('Verification failed.', 'فشل التحقق.'));
        });
      });
    });
  });
}
