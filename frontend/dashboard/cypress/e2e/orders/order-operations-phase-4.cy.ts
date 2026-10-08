import {
  signInToDashboard,
  signInToDashboardAsReadOnlyStaff,
} from '../../support/actions/dashboard-session.actions';

interface TestOrder {
  id: number;
  orderReference: string;
}

// Streaming SSR briefly holds a hidden copy of the page next to the live one, so only the
// visible control counts.
const statusSelect = '[data-testid="order-status-select"]:visible';
const paymentBadge = '[data-testid="order-payment-badge"]:visible';

/**
 * Opens an Order detail page and waits until React has hydrated it, so a click is never
 * swallowed by server-rendered markup that has no handlers yet.
 */
function visitOrderDetail(path: string): void {
  cy.visit(path);
  cy.get(statusSelect).should(($el) => {
    expect(Object.keys($el[0]).some((key) => key.startsWith('__reactProps'))).to.eq(true);
  });
}

function chooseStatus(label: string): void {
  cy.get(statusSelect).click();
  // Radix also renders a hidden native <select> whose <option>s share the role; a listbox that
  // is still closing after a refresh can briefly coexist with the new one, so take the open one.
  cy.get('[role="listbox"][data-state="open"]').last().contains('[role="option"]', label).click();
}

function expectFailureToast(description: string | RegExp): void {
  cy.contains('Update failed').should('be.visible');
  cy.contains(description).should('be.visible');
}

for (const locale of ['en', 'ar']) {
  describe(`Order operations (${locale})`, () => {
    let order: TestOrder;
    const detailPath = () => `/${locale}/orders/${order.id}`;

    beforeEach(() => {
      // Every test works on its own Order, never a seeded one.
      cy.task<TestOrder>('createTestOrder').then((created) => {
        order = created;
      });
    });

    describe('as Staff with order-write access', () => {
      beforeEach(() => {
        signInToDashboard();
      });

      it('updates the status, records it in the activity log and persists it', () => {
        visitOrderDetail(detailPath());
        cy.contains('h1', `Order #FE-${String(order.id).padStart(5, '0')}`).should('be.visible');
        cy.contains('No recent activity found for this order.').should('be.visible');

        chooseStatus('Confirmed');

        cy.contains('Order status updated').should('be.visible');
        cy.contains('h1', /confirmed/i).should('be.visible');
        cy.contains('Update Status').should('be.visible');
        cy.contains('Changed from').should('contain.text', 'pending');
        cy.reload();
        cy.contains('h1', /confirmed/i).should('be.visible');
        cy.contains('Update Status').should('be.visible');
      });

      it('shows the new status in the Order list after the update', () => {
        cy.visit(`/${locale}/orders?search=${order.orderReference}`);
        cy.contains('tbody tr', order.orderReference).should('contain.text', 'pending');

        cy.contains('tbody a', order.orderReference).click();
        cy.location('pathname').should('eq', detailPath());
        chooseStatus('Confirmed');
        cy.contains('Order status updated').should('be.visible');

        // Client-side navigation back to the list must not serve the pre-update row.
        cy.contains('a', 'Back to Orders').click();
        cy.location('pathname').should('eq', `/${locale}/orders`);
        cy.get('[data-testid="admin-orders-filter-search"]')
          .filter(':visible')
          .clear()
          .type(order.orderReference, { delay: 0 });
        cy.contains('tbody tr', order.orderReference)
          .should('contain.text', 'confirmed')
          .and('not.contain.text', 'pending');
      });

      it('updates the payment status and records it in the activity log', () => {
        visitOrderDetail(detailPath());
        cy.get(paymentBadge).should('have.text', 'unpaid');

        cy.contains('button:visible', 'Mark as paid').click();

        cy.contains('Payment status updated').should('be.visible');
        cy.get(paymentBadge).should('have.text', 'paid');
        cy.contains('Update Payment Status').should('be.visible');
        cy.reload();
        cy.get(paymentBadge).should('have.text', 'paid');

        cy.visit(`/${locale}/orders?search=${order.orderReference}`);
        cy.contains('tbody tr', order.orderReference).should('contain.text', 'paid');
      });

      it('rejects an invalid status transition and leaves the Order unchanged', () => {
        visitOrderDetail(detailPath());
        cy.get(statusSelect).should('be.visible');
        // Another Staff session cancels the Order while this page still shows it as pending.
        cy.task('setTestOrderStatus', { id: order.id, status: 'cancelled' });

        chooseStatus('Confirmed');

        expectFailureToast(/Invalid status transition from cancelled to confirmed/);
        cy.reload();
        cy.contains('h1', /cancelled/i).should('be.visible');
      });

      it('rejects an invalid payment transition and leaves the Order unchanged', () => {
        visitOrderDetail(detailPath());
        cy.contains('button:visible', 'Mark as paid').should('be.visible');
        cy.task('setTestOrderPaymentStatus', { id: order.id, status: 'refunded' });

        cy.contains('button:visible', 'Mark as paid').click();

        expectFailureToast(/Invalid payment status transition from refunded to paid/);
        cy.reload();
        cy.get(paymentBadge).should('have.text', 'refunded');
      });

      it('reports a failed server action request instead of crashing the page', () => {
        visitOrderDetail(detailPath());
        cy.get(statusSelect).should('be.visible');
        cy.intercept({ method: 'POST', url: `**/orders/${order.id}*` }, (req) => {
          if (req.headers['next-action']) req.destroy();
          else req.continue();
        }).as('serverAction');

        chooseStatus('Confirmed');

        cy.wait('@serverAction');
        expectFailureToast('The update request failed.');
        // The select falls back to the persisted status instead of the rejected choice.
        cy.get(statusSelect).should('contain.text', 'Pending');
        cy.reload();
        cy.contains('h1', /pending/i).should('be.visible');
      });
    });

    describe('without order-write access', () => {
      it('redirects an unauthenticated visitor to login', () => {
        cy.visit(detailPath());
        cy.location('pathname').should('eq', `/${locale}/login`);
      });

      it('refuses a status change from Staff who can only read Orders', () => {
        signInToDashboardAsReadOnlyStaff();
        visitOrderDetail(detailPath());
        cy.contains('h1', /pending/i).should('be.visible');

        chooseStatus('Confirmed');

        expectFailureToast('Not authorized to change orders');
        cy.reload();
        cy.contains('h1', /pending/i).should('be.visible');
      });

      it('refuses a payment change from Staff who can only read Orders', () => {
        signInToDashboardAsReadOnlyStaff();
        visitOrderDetail(detailPath());

        cy.contains('button:visible', 'Mark as paid').click();

        expectFailureToast('Not authorized to change orders');
        cy.get(paymentBadge).should('have.text', 'unpaid');
      });
    });
  });
}
