import { signInToDashboard } from '../../support/actions/dashboard-session.actions';
import {
  clickWhenHydrated,
  createProductThroughForm,
  uniqueCatalogName,
  uniqueSku,
  visitUntil,
  visitWhenServerRenders,
} from '../../support/admin-dashboard/catalog.actions';

const LOCALES = ['en', 'ar'] as const;

/** Each list renders the record under the name of the active locale. */
const localizedName = (name: { nameEn: string; nameAr: string }, locale: 'en' | 'ar') =>
  locale === 'en' ? name.nameEn : name.nameAr;

describe('Admin dashboard catalog management', () => {
  beforeEach(() => {
    signInToDashboard();
  });

  it('creates, updates and deletes a category with results persisted across reloads', () => {
    const name = uniqueCatalogName('category');
    const renamed = `${name.nameEn} renamed`;

    cy.visit('/en/categories');
    clickWhenHydrated(cy.contains('button', 'Add Category'));
    cy.get('input[placeholder="e.g. Writing Instruments"]').type(name.nameEn);
    cy.get('input[placeholder="مثال: أدوات الكتابة"]').type(name.nameAr);
    cy.contains('button', 'Save Category').click();

    for (const locale of LOCALES) {
      const shown = localizedName(name, locale);
      visitWhenServerRenders(`/${locale}/categories`, shown);
      cy.contains('span', shown).should('be.visible');
    }
    visitWhenServerRenders('/en/categories', name.nameEn);

    clickWhenHydrated(
      cy.contains('span', name.nameEn).closest('div.group').find('button:has(svg.lucide-pencil)'),
    );
    cy.get('input[placeholder="e.g. Writing Instruments"]').clear().type(renamed);
    cy.contains('button', 'Save Category').click();

    visitWhenServerRenders('/en/categories', renamed);
    cy.contains('span', renamed).should('be.visible');

    clickWhenHydrated(
      cy.contains('span', renamed).closest('div.group').find('button:has(svg.lucide-trash-2)'),
    );
    cy.contains('[role="dialog"] button', 'Delete Category').click();

    visitWhenServerRenders('/en/categories', renamed, { present: false });
    cy.contains('span', renamed).should('not.exist');
  });

  it('creates, updates, deactivates and deletes a brand with results persisted across reloads', () => {
    const name = uniqueCatalogName('brand');
    const renamed = `${name.nameEn} renamed`;

    cy.visit('/en/brands');
    clickWhenHydrated(cy.contains('button', 'Add Brand'));
    cy.get('input[placeholder="e.g. Faber-Castell"]').type(name.nameEn);
    cy.get('input[placeholder="مثلاً: فابر كاستل"]').type(name.nameAr);
    cy.contains('button', 'Save Brand').click();

    for (const locale of LOCALES) {
      const shown = localizedName(name, locale);
      visitWhenServerRenders(`/${locale}/brands`, shown);
      cy.contains(shown).should('be.visible');
    }
    visitWhenServerRenders('/en/brands', name.nameEn);

    clickWhenHydrated(cy.get(`button[aria-label="Edit ${name.nameEn}"]`));
    cy.get('input[placeholder="e.g. Faber-Castell"]').clear().type(renamed);
    cy.contains('button', 'Save Brand').click();

    visitWhenServerRenders('/en/brands', renamed);
    cy.contains(renamed).should('be.visible');

    clickWhenHydrated(
      cy.contains(renamed).closest('div.relative').find('button[aria-label="Set inactive"]'),
    );
    visitUntil(
      '/en/brands',
      `${renamed} to be inactive`,
      ($body) =>
        $body
          .find(`button[aria-label="Edit ${renamed}"]`)
          .closest('div.relative')
          .find('button[aria-label="Set active"]').length > 0,
    );

    clickWhenHydrated(
      cy.contains(renamed).closest('div.relative').find('button[aria-label="Delete brand"]'),
    );
    visitWhenServerRenders('/en/brands', renamed, { present: false });
    cy.contains(renamed).should('not.exist');
  });

  it('creates, filters, updates and deletes a product through the dashboard UI', () => {
    const name = uniqueCatalogName('product');
    const sku = uniqueSku();
    const renamed = `${name.nameEn} renamed`;
    const listPath = `/en/products?search=${sku}`;

    createProductThroughForm({ name, sku, price: '25' });
    cy.location('pathname').should('match', /\/en\/products\/\d+\/edit$/);

    // Persisted creation: the list reflects the record through server-driven search.
    for (const locale of LOCALES) {
      const shown = localizedName(name, locale);
      visitWhenServerRenders(`/${locale}/products?search=${sku}`, shown);
      cy.contains('tbody tr', shown).should('be.visible');
    }
    visitWhenServerRenders(listPath, name.nameEn);

    // Status filter is applied by the server and reflected in the URL: the new product is active.
    clickWhenHydrated(cy.contains('button', 'Inactive'));
    cy.location('search').should('include', 'status=inactive');
    cy.contains('tbody tr', name.nameEn).should('not.exist');
    clickWhenHydrated(cy.contains('button', 'Active'));
    cy.location('search').should('include', 'status=active');
    cy.contains('tbody tr', name.nameEn).should('be.visible');

    // Update through the edit form and verify the persisted value after reload.
    visitWhenServerRenders(listPath, name.nameEn);
    clickWhenHydrated(cy.contains('tbody tr', name.nameEn).find('a[href$="/edit"]'));
    cy.location('pathname').should('match', /\/en\/products\/\d+\/edit$/);
    cy.get('input[placeholder="e.g. Classic Ballpoint Pen"]')
      .filter(':visible')
      .clear()
      .type(renamed);
    cy.contains('button', 'Publish Product').click();
    cy.location('pathname').then((editPath) => {
      visitWhenServerRenders(editPath, renamed);
      cy.get('input[placeholder="e.g. Classic Ballpoint Pen"]')
        .filter(':visible')
        .should('have.value', renamed);
    });

    // Delete via the bulk action (window.confirm is auto-accepted) and verify persistence.
    visitWhenServerRenders(listPath, renamed);
    clickWhenHydrated(cy.contains('tbody tr', renamed).find('button[role="checkbox"]'));
    clickWhenHydrated(cy.contains('div.fixed', '1 selected').contains('button', 'Delete'));
    visitWhenServerRenders(listPath, renamed, { present: false });
    cy.contains('tbody tr', renamed).should('not.exist');
  });
});

for (const locale of ['en', 'ar']) {
  describe(`Admin dashboard product stock (${locale})`, () => {
    beforeEach(() => {
      signInToDashboard();
    });

    it('updates inventory for a new product and persists the stock level', () => {
      const name = uniqueCatalogName('stock');
      const sku = uniqueSku();

      createProductThroughForm({ name, sku, price: '10' });
      cy.location('pathname').should('match', /\/en\/products\/\d+\/edit$/);

      visitWhenServerRenders(`/${locale}/products?search=${sku}`, name.nameEn);
      cy.contains('tbody tr', name.nameEn).should('be.visible');

      visitWhenServerRenders(`/${locale}/inventory`, name.nameEn);
      cy.contains('tr', name.nameEn)
        .invoke('attr', 'data-testid')
        .then((testId) => {
          const productId = String(testId).replace('admin-inventory-row-', '');
          clickWhenHydrated(
            cy.get(`[data-testid="admin-inventory-edit-${productId}"]`).filter(':visible'),
          );
          cy.get(`[data-testid="admin-inventory-stock-input-${productId}"]`)
            .filter(':visible')
            .type('{selectall}37');
          cy.get(`[data-testid="admin-inventory-save-${productId}"]`).filter(':visible').click();

          // The product list derives its stock column from persisted inventory balances.
          const inStock = locale === 'en' ? '37 in stock' : '37 في المخزون';
          visitUntil(
            `/${locale}/products?search=${sku}`,
            `"${inStock}" for ${name.nameEn}`,
            ($body) =>
              $body
                .find('tbody tr')
                .filter((_, row) => row.textContent?.includes(name.nameEn) ?? false)
                .text()
                .includes(inStock),
          );
        });
    });
  });
}
