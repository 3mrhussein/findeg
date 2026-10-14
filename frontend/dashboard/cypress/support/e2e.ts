import './commands';

// Inject CSS to disable animations globally in Cypress tests
Cypress.Commands.add('disableAnimations', () => {
  cy.document().then((doc) => {
    const style = doc.createElement('style');
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

Cypress.on('uncaught:exception', (err) => {
  console.error('CYPRESS UNCAUGHT EXCEPTION:', err);
  // Ignore React hydration mismatch errors
  if (
    err.message.includes('Minified React error #418') ||
    err.message.includes('Minified React error #423') ||
    err.message.includes('Minified React error #425') ||
    err.message.includes('Hydration failed')
  ) {
    return false;
  }
});
