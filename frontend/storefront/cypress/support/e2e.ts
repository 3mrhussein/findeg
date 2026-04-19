import "./commands";

Cypress.on("uncaught:exception", () => {
  // Keep e2e stable while app still emits known runtime warnings in dev.
  return false;
});

// Inject CSS to disable animations globally in Cypress tests
Cypress.Commands.add("disableAnimations", () => {
  cy.document().then((doc) => {
    const style = doc.createElement("style");
    style.innerHTML = `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
      }
    `;
    doc.head.appendChild(style);
  });
});
