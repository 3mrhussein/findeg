for (const locale of ['en', 'ar']) {
  const text = (en, ar) => (locale === 'en' ? en : ar);
  it(`${locale}: staff and Partner authorization preserve the Current Session`, () => {
    cy.task('operatorFixture').then(({ email, password, partnerId, otherPartnerId }) => {
      cy.visit(`/${locale}/back-office`);
      cy.location('pathname').should('equal', `/${locale}/back-office/sign-in`);
      cy.get('input[name="email"]').type(email);
      cy.get('input[name="password"]').type(password);
      cy.get('button[type="submit"]').click();
      cy.contains(text('You cannot manage the catalog.', 'ليس لديك صلاحية إدارة الكتالوج.'));
      cy.getCookie('findeg_session').then((session) => {
        expect(session).not.to.equal(null);
        cy.visit(`/${locale}/partner/${partnerId}`);
        cy.contains('h2', `${text('Business Partner', 'الشريك')} #${partnerId}`);
        cy.contains(text('Report Viewer', 'عارض التقارير'));
        cy.visit(`/${locale}/partner/${otherPartnerId}`);
        cy.location('pathname').should('equal', `/${locale}`);
        cy.getCookie('findeg_session').its('value').should('equal', session.value);
        cy.visit(`/${locale}/partner/${partnerId}`);
        cy.contains('h2', `#${partnerId}`);
      });
    });
  });

  it(`${locale}: an operator observes exhausted delivery and recovery through worker readiness`, () => {
    cy.visit(`/${locale}`);
    cy.task('failedWorkerFixture').then(({ base }) => {
      function readiness(expected, attempt = 0) {
        return cy
          .request({ url: `${base}/health/ready`, failOnStatusCode: false })
          .then((response) => {
            if (
              (response.status !== expected ||
                (expected === 200 && response.body.delivered !== 1)) &&
              attempt < 50
            ) {
              return cy.wait(100).then(() => readiness(expected, attempt + 1));
            }
            expect(response.status).to.equal(expected);
            return response.body;
          });
      }
      readiness(503).then((body) => {
        expect(body.status).to.equal('exhausted-failures');
        expect(body.exhausted).to.equal(1);
      });
      cy.task('recoverWorker');
      readiness(200).then((body) => {
        expect(body.exhausted).to.equal(0);
        expect(body.delivered).to.equal(1);
      });
      cy.task('workerReceipts').should('deep.equal', ['operator-journey']);
    });
  });
}
