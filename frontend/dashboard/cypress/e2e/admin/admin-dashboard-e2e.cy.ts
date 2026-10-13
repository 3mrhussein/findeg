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

/**
 * Brands render the name of the active locale; the category and product admin lists render the
 * English name in every locale, so only the brand check uses the Arabic name.
 */
const brandName = (name: { nameEn: string; nameAr: string }, locale: 'en' | 'ar') =>
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
      visitWhenServerRenders(`/${locale}/categories`, name.nameEn);
      cy.contains('span', name.nameEn).should('be.visible');
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
      const shown = brandName(name, locale);
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

  it('refuses deleting a brand in use with a message', () => {
    cy.visit('/en/brands');
    cy.contains('div.group', 'Faber-Castell').within(() => {
      cy.contains(/products/i).should('be.visible');
      clickWhenHydrated(cy.get('button[aria-label="Delete brand"]'));
    });

    cy.contains('Cannot delete "Faber-Castell"').should('be.visible');
    cy.contains(/products assigned/i).should('be.visible');
    cy.contains('Faber-Castell').should('be.visible');
  });

  it('creates, updates and deletes a collection with tags', () => {
    const name = uniqueCatalogName('col');
    const renamed = `${name.nameEn} Renamed`;

    cy.visit('/en/catalog/collections/new');
    cy.get('input[placeholder="e.g. Back to School"]').type(name.nameEn);
    cy.get('input[placeholder="مثلاً: العودة للمدارس"]').type(name.nameAr);

    clickWhenHydrated(cy.contains('button[role="tab"]', 'Tags Selection'));
    cy.get('button[role="checkbox"]').first().click();

    clickWhenHydrated(cy.contains('button', 'Create Collection'));

    visitWhenServerRenders('/en/catalog/collections', name.nameEn);
    cy.contains(name.nameEn).should('be.visible');

    clickWhenHydrated(cy.contains('div.group', name.nameEn).find('a:has(svg.lucide-pencil)'));

    cy.contains('h2', 'Edit Collection').should('be.visible');
    cy.get('input[placeholder="e.g. Back to School"]').clear().type(renamed);
    clickWhenHydrated(cy.contains('button', 'Save Changes'));

    visitWhenServerRenders('/en/catalog/collections', renamed);
    cy.contains(renamed).should('be.visible');

    clickWhenHydrated(
      cy.contains('div.group', renamed).find('button[aria-label="Delete collection"]'),
    );
    clickWhenHydrated(cy.contains('[role="dialog"] button', 'Delete'));

    visitWhenServerRenders('/en/catalog/collections', renamed, { present: false });
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
      visitWhenServerRenders(`/${locale}/products?search=${sku}`, name.nameEn);
      cy.contains('tbody tr', name.nameEn).should('be.visible');
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

  it('creates and edits a product with attributes, compare-at, default variant, and bulk activates', () => {
    const name = uniqueCatalogName('variant-test');
    const sku = uniqueSku();
    const listPath = `/en/products?search=${sku}`;

    cy.visit('/en/products/new');
    cy.get('input[placeholder="e.g. Classic Ballpoint Pen"]')
      .filter(':visible')
      .should(($el) => {
        expect(Object.keys($el[0]).some((key) => key.startsWith('__reactProps$'))).to.equal(true);
      });
    cy.get('input[placeholder="e.g. Classic Ballpoint Pen"]').filter(':visible').type(name.nameEn);
    cy.get('input[placeholder="مثال: قلم جاف كلاسيك"]').filter(':visible').type(name.nameAr);

    // Variants Tab
    cy.contains('button', 'Variants').click();
    cy.contains('New Variant').click();
    cy.get('input[placeholder="e.g. STA-PEN-BLUE"]').type(sku);

    // Set prices: basePrice 50, strikePrice (compare-at) 75
    cy.get('input[placeholder="0.00"]').eq(0).clear().type('50');
    cy.get('input[placeholder="0.00"]').eq(1).clear().type('75');

    // Add Attribute
    cy.contains('button', 'Add Attribute').click();
    cy.get('input[placeholder="Attribute Name"]').type('Color');
    cy.get('input[placeholder="Value"]').type('Navy');

    // Set inactive to test bulk activate later
    cy.contains('label', 'Inactive').click();

    clickWhenHydrated(cy.contains('button', 'Publish Product'));
    cy.location('pathname').should('match', /\/en\/products\/\d+\/edit$/);

    // Verify persisted edit view shows compare-at price and attribute
    cy.contains('button', 'Variants').click();
    cy.contains(sku).click();
    cy.get('input[placeholder="0.00"]').eq(1).should('have.value', '75');
    cy.get('input[placeholder="Attribute Name"]').should('have.value', 'Color');
    cy.get('input[placeholder="Value"]').should('have.value', 'Navy');

    // Verify product list shows formatted price EGP 50.00, SKU, and Inactive status
    visitWhenServerRenders(`${listPath}&status=all`, name.nameEn);
    cy.contains('tbody tr', name.nameEn).within(() => {
      cy.contains('Inactive').should('be.visible');
      cy.contains('EGP 50.00').should('be.visible');
      cy.contains(sku).should('be.visible');
    });

    // Bulk activate
    clickWhenHydrated(cy.contains('tbody tr', name.nameEn).find('button[role="checkbox"]'));
    clickWhenHydrated(cy.contains('div.fixed', '1 selected').contains('button', 'Activate'));

    // Verify status changed to Active
    visitWhenServerRenders(listPath, name.nameEn);
    cy.contains('tbody tr', name.nameEn).within(() => {
      cy.contains('Active').should('be.visible');
    });

    // Cleanup: delete the product
    clickWhenHydrated(cy.contains('tbody tr', name.nameEn).find('button[role="checkbox"]'));
    clickWhenHydrated(cy.contains('div.fixed', '1 selected').contains('button', 'Delete'));
    visitWhenServerRenders(listPath, name.nameEn, { present: false });
    cy.contains('tbody tr', name.nameEn).should('not.exist');
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
