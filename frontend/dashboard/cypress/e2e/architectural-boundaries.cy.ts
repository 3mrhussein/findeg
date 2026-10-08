/**
 * Architectural boundaries: the production dashboard's real client bundles
 * must not contain server-only infrastructure. Assertions fetch the actual
 * `/_next/static` chunks referenced by rendered pages and scan their contents.
 *
 * Decision (#347): static-import and bundle assertions stay in this dashboard spec; they are
 * not moved to a separate build-verification seam. The storefront's retained boundary
 * scenarios remain quarantined (see frontend/storefront/cypress/README.md).
 *
 * Besides the public login pages, one backend-backed localized page (/en/products, behind
 * sign-in) is scanned, since it is the page that actually pulls backend feature code.
 */
import { signInToDashboard } from '../support/actions/dashboard-session.actions';

const FORBIDDEN_IN_CLIENT_BUNDLES: Array<[label: string, pattern: RegExp]> = [
  ['postgres driver', /from\s*["']postgres["']|require\(["']postgres["']\)|node_modules\/postgres/],
  ['drizzle-orm', /drizzle-orm/],
  ['node:fs', /require\(["'](?:node:)?fs["']\)|from\s*["'](?:node:)?fs["']/],
  ['node:net', /require\(["'](?:node:)?net["']\)|from\s*["'](?:node:)?net["']/],
  ['node:tls', /require\(["'](?:node:)?tls["']\)|from\s*["'](?:node:)?tls["']/],
  ['@findeg/db', /@findeg\/db/],
];

/**
 * `allowed` lists forbidden-bundle labels a page may legitimately contain. The `@findeg/db`
 * root entry point deliberately ships table definitions (and so drizzle-orm's schema helpers)
 * to Client Components for Zod schemas; the product forms import through it. The database
 * driver, connection string and Node built-ins remain forbidden everywhere.
 */
const PAGES: Array<{ path: string; signedIn?: boolean; allowed?: string[] }> = [
  { path: '/en/login' },
  { path: '/ar/login' },
  { path: '/en/products', signedIn: true, allowed: ['drizzle-orm'] },
];

function collectClientChunkUrls(): Cypress.Chainable<string[]> {
  return cy.document().then((doc) => {
    const urls = Array.from(doc.querySelectorAll<HTMLScriptElement>('script[src]'))
      .map((script) => new URL(script.src, doc.baseURI))
      .filter((url) => url.pathname.startsWith('/_next/static/') && url.pathname.endsWith('.js'))
      .map((url) => url.pathname);
    return Array.from(new Set(urls));
  });
}

describe('Dashboard client bundle boundaries', () => {
  for (const { path: page, signedIn, allowed = [] } of PAGES) {
    describe(`${page} client chunks`, () => {
      let chunkBodies: Array<{ url: string; body: string }> = [];

      before(() => {
        chunkBodies = [];
        if (signedIn) signInToDashboard();
        cy.visit(page);
        collectClientChunkUrls().then((urls) => {
          expect(urls, 'client chunks referenced by the page').to.have.length.greaterThan(0);
          urls.forEach((url) => {
            cy.request(url).then((response) => {
              expect(response.status).to.eq(200);
              chunkBodies.push({ url, body: String(response.body) });
            });
          });
        });
      });

      it('serves non-trivial client JavaScript to scan', () => {
        const total = chunkBodies.reduce((sum, chunk) => sum + chunk.body.length, 0);
        expect(total, 'bytes of client JavaScript scanned').to.be.greaterThan(10_000);
        expect(chunkBodies.some((chunk) => /react/i.test(chunk.body))).to.eq(true);
      });

      for (const [label, pattern] of FORBIDDEN_IN_CLIENT_BUNDLES) {
        if (allowed.includes(label)) continue;
        it(`does not bundle ${label}`, () => {
          const offenders = chunkBodies
            .filter((chunk) => pattern.test(chunk.body))
            .map((chunk) => chunk.url);
          expect(offenders, `chunks containing ${label}`).to.deep.eq([]);
        });
      }
    });
  }

  it('does not expose a database connection string in rendered HTML', () => {
    cy.request('/en/login').then((response) => {
      expect(String(response.body)).not.to.match(/postgres(?:ql)?:\/\//);
    });
  });
});
