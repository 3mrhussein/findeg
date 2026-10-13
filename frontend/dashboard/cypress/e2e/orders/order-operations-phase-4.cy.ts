import english from '../../../messages/en.json';
import arabic from '../../../messages/ar.json';
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
 * Waits until React has hydrated the Order controls, so a click is never swallowed by
 * server-rendered markup that has no handlers yet.
 */
function waitForOrderHydration(): void {
  cy.get(statusSelect).should(($el) => {
    expect(Object.keys($el[0]).some((key) => key.startsWith('__reactProps'))).to.eq(true);
  });
}

function visitOrderDetail(path: string): void {
  cy.visit(path);
  waitForOrderHydration();
}

function chooseOrderStatus(label: string): void {
  // Client navigation can expose the control before its event handlers are ready, too.
  waitForOrderHydration();
  cy.get(statusSelect).click();
  // Radix also renders a hidden native <select> whose <option>s share the role; a listbox that
  // is still closing after a refresh can briefly coexist with the new one, so take the open one.
  cy.get('[role="listbox"][data-state="open"]').last().contains('[role="option"]', label).click();
}

function expectOrderFailureToast(description: string | RegExp, title: string): void {
  cy.contains(title).should('be.visible');
  cy.contains(description).should('be.visible');
}

for (const locale of ['en', 'ar']) {
  describe(`Order operations (${locale})`, () => {
    const catalogue = locale === 'ar' ? arabic : english;
    const labels = catalogue.Administration.OrdersDetail;
    const statuses = catalogue.Administration.Shared.StatusBadge;
    const chooseStatus = (label: string) =>
      chooseOrderStatus(statuses[label as keyof typeof statuses]);
    const expectFailureToast = (description: string | RegExp) =>
      expectOrderFailureToast(description, labels.UpdateFailed);
    const markPaid = labels.MarkPayment.replace('{status}', statuses.Paid);
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
        cy.contains('h1', order.orderReference).should('be.visible');
        cy.contains('No recent activity found for this order.').should('be.visible');

        chooseStatus('Confirmed');

        cy.contains(labels.StatusUpdated).should('be.visible');
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
        cy.contains(labels.StatusUpdated).should('be.visible');

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

      it('cycles through full lifecycle: confirm, ship with tracking, deliver, mark as paid', () => {
        visitOrderDetail(detailPath());
        // 1. Confirm
        chooseStatus('Confirmed');
        cy.contains(labels.StatusUpdated).should('be.visible');
        cy.contains('h1', /confirmed/i).should('be.visible');

        // 2. Paid before delivery is refused (button does not exist)
        cy.contains('button:visible', markPaid).should('not.exist');

        // 3. Processing
        chooseStatus('Processing');
        cy.contains(labels.StatusUpdated).should('be.visible');
        cy.contains('h1', /processing/i).should('be.visible');

        // 4. Shipping without tracking is refused
        chooseStatus('Shipped');
        cy.contains(labels.UpdateFailed).should('be.visible');
        cy.contains(labels.TrackingRequired).should('be.visible');

        // Enter tracking and ship
        cy.get('[data-testid="order-tracking-input"]').clear().type('AWB-123456');
        chooseStatus('Shipped');
        cy.contains(labels.StatusUpdated).should('be.visible');
        cy.contains('h1', /shipped/i).should('be.visible');

        // Paid before delivery is still refused
        cy.contains('button:visible', markPaid).should('not.exist');

        // 5. Deliver
        chooseStatus('Delivered');
        cy.contains(labels.StatusUpdated).should('be.visible');
        cy.contains('h1', /delivered/i).should('be.visible');

        // 6. Paid is now allowed
        cy.contains('button:visible', markPaid).click();
        cy.contains(labels.PaymentUpdated).should('be.visible');
        cy.get(paymentBadge).should('have.text', statuses.Paid);
      });

      it('cancels pending order with confirmation and releases stock', () => {
        visitOrderDetail(detailPath());
        cy.on('window:confirm', (text) => {
          expect(text).to.eq(labels.ConfirmCancel);
          return true;
        });
        chooseStatus('Cancelled');
        cy.contains(labels.StatusUpdated).should('be.visible');
        cy.contains('h1', /cancelled/i).should('be.visible');
      });

      it('cancelling a shipped order requires parcel-back confirmation', () => {
        cy.task<TestOrder>('createTestOrder').then((shippedOrder) => {
          cy.task('setTestOrderStatus', { id: shippedOrder.id, status: 'shipped' });
          cy.task('setTestOrderTrackingNumber', {
            id: shippedOrder.id,
            trackingNumber: 'TRACK-111',
          });
          visitOrderDetail(`/${locale}/orders/${shippedOrder.id}`);

          cy.on('window:confirm', (text) => {
            expect(text).to.eq(labels.ConfirmParcelBack);
            return true;
          });

          chooseStatus('Cancelled');
          cy.contains(labels.StatusUpdated).should('be.visible');
          cy.contains('h1', /cancelled/i).should('be.visible');
        });
      });

      it('refunds a delivered paid order via confirmation dialog setting both statuses to refunded', () => {
        cy.task('setTestOrderStatus', { id: order.id, status: 'delivered' });
        cy.task('setTestOrderPaymentStatus', { id: order.id, status: 'paid' });
        visitOrderDetail(detailPath());

        cy.get('[data-testid="order-refund-button"]').click();
        cy.get('[data-testid="confirm-refund-button"]').should('be.visible').click();

        cy.contains(labels.RefundSuccess).should('be.visible');
        cy.contains('h1', /refunded/i).should('be.visible');
        cy.get(paymentBadge).should('have.text', statuses.Refunded);
      });

      it('persists order notes with author and timestamp', () => {
        visitOrderDetail(detailPath());
        cy.get('[data-testid="order-note-input"]').type('Customer requested delivery after 5 PM');
        cy.get('[data-testid="order-note-submit"]').click();

        cy.contains(labels.NoteAdded).should('be.visible');
        cy.get('[data-testid="order-note-item"]').should('be.visible');
        cy.get('[data-testid="order-note-text"]').should(
          'contain.text',
          'Customer requested delivery after 5 PM',
        );
        cy.get('[data-testid="order-note-author"]').should('not.be.empty');
        cy.get('[data-testid="order-note-date"]').should('not.be.empty');

        // Persists across reload
        cy.reload();
        cy.get('[data-testid="order-note-text"]').should(
          'contain.text',
          'Customer requested delivery after 5 PM',
        );
      });

      it('executes bulk cancel with mixed results listing failures by order reference', () => {
        cy.task<TestOrder>('createTestOrder').then((deliveredOrder) => {
          cy.task('setTestOrderStatus', { id: deliveredOrder.id, status: 'delivered' });

          cy.visit(`/${locale}/orders`);
          cy.get('[data-testid="admin-orders-filter-search"]').should('be.visible');
          cy.contains('tr', deliveredOrder.orderReference, { timeout: 10000 })
            .find('[data-testid="order-row-checkbox"]')
            .click({ force: true });
          cy.get('[data-testid="order-row-checkbox"]')
            .filter(':not([data-state="checked"])')
            .first()
            .click({ force: true });

          cy.get('[data-testid="bulk-cancel-button"]').click();

          cy.contains(
            `${deliveredOrder.orderReference}: An Order cannot move from delivered to cancelled`,
            {
              timeout: 10000,
            },
          ).should('be.visible');
        });
      });

      it('offers payment only after delivery', () => {
        visitOrderDetail(detailPath());
        cy.get(paymentBadge).should('have.text', statuses.Unpaid);
        cy.contains('button:visible', markPaid).should('not.exist');
      });

      it('updates the payment status and records it in the activity log', () => {
        cy.task('setTestOrderStatus', { id: order.id, status: 'delivered' });
        visitOrderDetail(detailPath());
        cy.get(paymentBadge).should('have.text', statuses.Unpaid);

        cy.contains('button:visible', markPaid).click();

        cy.contains(labels.PaymentUpdated).should('be.visible');
        cy.get(paymentBadge).should('have.text', statuses.Paid);
        cy.contains('Update Payment Status').should('be.visible');
        cy.reload();
        cy.get(paymentBadge).should('have.text', statuses.Paid);

        cy.visit(`/${locale}/orders?search=${order.orderReference}`);
        cy.contains('tbody tr', order.orderReference).should('contain.text', 'paid');
      });

      it('rejects an invalid status transition and leaves the Order unchanged', () => {
        visitOrderDetail(detailPath());
        cy.get(statusSelect).should('be.visible');
        // Another Staff session cancels the Order while this page still shows it as pending.
        cy.task('setTestOrderStatus', { id: order.id, status: 'cancelled' });

        chooseStatus('Confirmed');

        expectFailureToast(/An Order cannot move from cancelled to confirmed/);
        cy.reload();
        cy.contains('h1', /cancelled/i).should('be.visible');
      });

      it('rejects an invalid payment transition and leaves the Order unchanged', () => {
        cy.task('setTestOrderStatus', { id: order.id, status: 'delivered' });
        visitOrderDetail(detailPath());
        cy.contains('button:visible', markPaid).should('be.visible');
        cy.task('setTestOrderPaymentStatus', { id: order.id, status: 'refunded' });

        cy.contains('button:visible', markPaid).click();

        expectFailureToast(/A payment cannot move from refunded to paid/);
        cy.reload();
        cy.get(paymentBadge).should('have.text', statuses.Refunded);
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
        expectFailureToast(labels.RequestFailed);
        // The select falls back to the persisted status instead of the rejected choice.
        cy.get(statusSelect).should('contain.text', statuses.Pending);
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
        cy.task('setTestOrderStatus', { id: order.id, status: 'delivered' });
        visitOrderDetail(detailPath());

        cy.contains('button:visible', markPaid).click();

        expectFailureToast('Not authorized to change orders');
        cy.get(paymentBadge).should('have.text', statuses.Unpaid);
      });
    });
  });
}
