import { adminSelectors } from "../selectors/admin.selectors";
import { localePath } from "../utils/url";
import { API_ROUTES, UI_ROUTES } from "../constants/routes";
import { fetchAdminToken } from "./auth.actions";

interface AdminInventoryUpdateInput {
  quantity: number;
  lowStockThreshold?: number;
}

/**
 *
 */
export function visitAdminInventoryList(): void {
  cy.visit(UI_ROUTES.adminInventory);
  cy.location("pathname", { timeout: 15000 }).should((pathname) => {
    const localizedPath = localePath(UI_ROUTES.adminInventory);
    const isInventoryPath =
      pathname === UI_ROUTES.adminInventory ||
      pathname.startsWith(`${UI_ROUTES.adminInventory}/`) ||
      pathname.startsWith(localizedPath);
    expect(isInventoryPath, `expected admin inventory path, got ${pathname}`).to.eq(true);
  });
}

/**
 *
 */
export function updateInventoryFromUiByProductId(productId: number, quantity: number): void {
  cy.get(adminSelectors.inventoryRowById(productId), { timeout: 15000 }).should("exist");

  cy.get(adminSelectors.inventoryEditById(productId), { timeout: 10000 })
    .should("be.visible")
    .click({ force: true });

  cy.get(adminSelectors.inventoryStockInputById(productId), { timeout: 10000 })
    .should("be.visible")
    .then(($input) => {
      const input = $input.get(0) as HTMLInputElement;
      const win = input.ownerDocument.defaultView;
      expect(win, "input window").to.exist;

      const valueSetter = Object.getOwnPropertyDescriptor(
        win!.HTMLInputElement.prototype,
        "value",
      )?.set;
      expect(valueSetter, "native input value setter").to.be.a("function");

      valueSetter!.call(input, String(quantity));
      input.dispatchEvent(new win!.Event("input", { bubbles: true }));
      input.dispatchEvent(new win!.Event("change", { bubbles: true }));
      input.dispatchEvent(new win!.Event("blur", { bubbles: true }));
    });

  cy.get(adminSelectors.inventoryStockInputById(productId))
    .invoke("val")
    .then((value) => {
      expect(Number(value ?? 0), "inventory numeric input value").to.eq(quantity);
    });

  cy.get(adminSelectors.inventorySaveById(productId), { timeout: 10000 })
    .should("be.visible")
    .and("not.be.disabled")
    .click({ force: true });

  cy.get(adminSelectors.inventoryStockInputById(productId), { timeout: 20000 }).should("not.exist");
}

/**
 *
 */
export function updateInventoryViaApiByProductId(
  productId: number,
  input: AdminInventoryUpdateInput,
): Cypress.Chainable<number> {
  return fetchAdminToken().then((token) =>
    cy
      .request({
        method: "PUT",
        url: API_ROUTES.adminInventoryByProductId(productId),
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: {
          quantity: input.quantity,
          lowStockThreshold: input.lowStockThreshold,
        },
      })
      .then((response) => {
        expect(response.status).to.eq(200);
        return response.status;
      }),
  );
}
