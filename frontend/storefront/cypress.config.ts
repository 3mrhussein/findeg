import path from 'node:path';
import { defineConfig } from 'cypress';

const artifactsBase = process.env.TEST_ARTIFACTS_DIR
  ? path.join(process.env.TEST_ARTIFACTS_DIR, 'storefront')
  : 'cypress/coverage';

export default defineConfig({
  reporter: 'spec',
  allowCypressEnv: false,
  viewportWidth: 1280,
  viewportHeight: 800,
  e2e: {
    baseUrl: 'http://localhost:3000',
    defaultCommandTimeout: 10000,
    specPattern: 'cypress/e2e/**/*.cy.{ts,tsx}',
    supportFile: 'cypress/support/e2e.ts',
    video: true,
    screenshotOnRunFailure: true,
    trashAssetsBeforeRuns: true,
    screenshotsFolder: path.join(artifactsBase, 'screenshots'),
    videosFolder: path.join(artifactsBase, 'videos'),
    downloadsFolder: path.join(artifactsBase, 'downloads'),
    setupNodeEvents(on, config) {
      on('task', {
        /**
         * Isolated PLP catalog: a category with two brands, a fixed price ladder and
         * one inactive product, plus a 25-product category for pagination.
         */
        async createPlpCatalog() {
          const { randomUUID } = await import('node:crypto');
          const [{ db }, schema] = await Promise.all([
            import('../../db/src/connection'),
            import('../../db/src/schema/index'),
          ]);
          const suffix = randomUUID().slice(0, 8);
          const brand = async (key: string) => {
            const [row] = await db
              .insert(schema.brands)
              .values({
                slug: `cypress-plp-${key}-${suffix}`,
                localizedName: { en: `PLP ${key} ${suffix}`, ar: `PLP ${key} ${suffix}` },
              })
              .returning();
            return row;
          };
          const category = async (key: string) => {
            const [row] = await db
              .insert(schema.categories)
              .values({
                slug: `cypress-plp-${key}-${suffix}`,
                localizedName: { en: `PLP ${key} ${suffix}`, ar: `PLP ${key} ${suffix}` },
              })
              .returning();
            return row;
          };
          const product = async (input: {
            name: string;
            categoryId: number;
            price: number;
            brandId?: number;
            isActive?: boolean;
          }) => {
            const [row] = await db
              .insert(schema.products)
              .values({
                slug: `cypress-plp-${input.name.toLowerCase()}-${suffix}`,
                localizedName: { en: input.name, ar: input.name },
                localizedDescription: { en: '' },
                localizedLongDescription: { en: '' },
                categoryId: input.categoryId,
                brandId: input.brandId,
                isActive: input.isActive ?? true,
              })
              .returning();
            await db.insert(schema.productVariants).values({
              productId: row.id,
              variantKey: 'default',
              sku: `CY-PLP-${input.name}-${suffix}`,
              basePrice: input.price.toFixed(2),
              isDefault: true,
            });
          };

          const [alpha, beta] = [await brand('alpha'), await brand('beta')];
          const listing = await category('listing');
          for (const [name, price, brandId] of [
            ['A10', 10, alpha.id],
            ['B20', 20, beta.id],
            ['A30', 30, alpha.id],
            ['B40', 40, beta.id],
            ['A50', 50, alpha.id],
            ['N60', 60, undefined],
          ] as const) {
            await product({ name, price, brandId, categoryId: listing.id });
          }
          await product({ name: 'Inactive', price: 15, categoryId: listing.id, isActive: false });

          const paged = await category('paged');
          for (let price = 1; price <= 25; price += 1) {
            await product({
              name: `P${String(price).padStart(2, '0')}`,
              price,
              categoryId: paged.id,
            });
          }

          return {
            listingUrl: `/en/shop/${listing.slug}`,
            pagedUrl: `/en/shop/${paged.slug}`,
            alpha: { id: alpha.id, name: `PLP alpha ${suffix}` },
            beta: { id: beta.id, name: `PLP beta ${suffix}` },
          };
        },
        async createSupplyLists() {
          const { randomUUID } = await import('node:crypto');
          const [{ db }, schema, { createSchoolSupplyListService }] = await Promise.all([
            import('../../db/src/connection'),
            import('../../db/src/schema/index'),
            import('@findeg/backend/features/school'),
          ]);
          const suffix = randomUUID().slice(0, 8);
          const [staffUser] = await db
            .insert(schema.users)
            .values({ email: `cypress-lists-${suffix}@findeg.test`, portalRole: 'staff' })
            .returning();
          const staff = {
            kind: 'staff' as const,
            userId: staffUser.id,
            activeRoleIds: ['system_admin'],
          };
          const service = createSchoolSupplyListService({ db });
          const must = <T>(result: { success: boolean; data?: T; error?: string }): T => {
            if (!result.success) throw new Error(result.error);
            return result.data as T;
          };

          const [partner] = await db
            .insert(schema.businessPartners)
            .values({
              code: `cypress-list-school-${suffix}`,
              nameEn: 'Cypress School',
              nameAr: 'مدرسة',
            })
            .returning();
          await db.insert(schema.partnerSchoolProfiles).values({
            businessPartnerId: partner.id,
            governorate: 'Cairo',
            area: 'Maadi',
            schoolType: 'private',
            academicSystem: 'national',
            logoUrl: '/school.png',
          });
          const [category] = await db
            .insert(schema.categories)
            .values({ slug: `cypress-list-category-${suffix}` })
            .returning();
          const [warehouse] = await db
            .insert(schema.warehouses)
            .values({ code: `cypress-list-wh-${suffix}`, name: 'Main' })
            .returning();
          const [product] = await db
            .insert(schema.products)
            .values({
              slug: `cypress-list-product-${suffix}`,
              localizedName: { en: 'Cypress pen', ar: 'قلم' },
              localizedDescription: { en: '' },
              localizedLongDescription: { en: '' },
              categoryId: category.id,
            })
            .returning();
          const makeVariant = async (key: string, price: string) => {
            const [variant] = await db
              .insert(schema.productVariants)
              .values({
                productId: product.id,
                variantKey: key,
                sku: `CY-${key}-${suffix}`,
                basePrice: price,
              })
              .returning();
            await db.insert(schema.inventoryBalances).values({
              variantId: variant.id,
              warehouseId: warehouse.id,
              onHand: 100,
              reserved: 0,
            });
            return variant;
          };
          const defaultVariant = await makeVariant('default', '10.00');
          const substitute = await makeVariant('substitute', '12.00');

          const publishedList = async (grade: string) => {
            const list = must(
              await service.createDraft(staff, {
                businessPartnerId: partner.id,
                grade,
                academicYear: '2026/2027',
                localizedTitle: { en: `Cypress ${grade} supplies`, ar: 'قائمة' },
              }),
            ) as { id: number };
            must(
              await service.addItem(staff, list.id, {
                variantId: defaultVariant.id,
                exactItem: false,
                specification: { categoryId: category.id, attributes: {} },
                quantity: 2,
                localizedLabel: { en: 'Cypress pen item', ar: 'قلم' },
              }),
            );
            must(
              await service.addItem(staff, list.id, {
                variantId: defaultVariant.id,
                exactItem: false,
                specification: { categoryId: category.id, attributes: {} },
                required: false,
                quantity: 1,
                localizedLabel: { en: 'Cypress optional item', ar: 'اختياري' },
              }),
            );
            const published = must(await service.publish(staff, list.id)) as {
              list: { id: number; publicCode: string };
            };
            return published.list;
          };

          const open = await publishedList('Grade 1');
          const retired = await publishedList('Grade 2');
          must(await service.archive(staff, retired.id));
          return {
            publishedUrl: `/en/lists/${open.publicCode}`,
            archivedUrl: `/en/lists/${retired.publicCode}`,
            substitutePrice: substitute.basePrice,
          };
        },
        async createPartnerInvitation() {
          const { randomUUID } = await import('node:crypto');
          const [{ db }, { users }, { createPartnerMembershipServices }] = await Promise.all([
            import('../../db/src/connection'),
            import('../../db/src/schema/index'),
            import('@findeg/backend/features/partner-membership'),
          ]);
          const suffix = randomUUID().slice(0, 8);
          const [staffUser] = await db
            .insert(users)
            .values({ email: `cypress-staff-${suffix}@findeg.test`, portalRole: 'staff' })
            .returning();
          const services = createPartnerMembershipServices({ db });
          const actor = {
            kind: 'staff' as const,
            userId: staffUser.id,
            permissionCodes: ['partners.manage'],
          };
          const partner = await services.partners.createPartner(actor, {
            code: `cypress-partner-${suffix}`,
            nameEn: 'Cypress Partner School',
            nameAr: 'مدرسة سايبريس',
          });
          if (!partner.success) throw new Error(partner.error);
          const email = `cypress-invitee-${suffix}@findeg.test`;
          const invitation = await services.invitations.invite(actor, partner.data.id, {
            email,
            roles: ['partner-administrator'],
          });
          if (!invitation.success) throw new Error(invitation.error);
          return {
            email,
            code: partner.data.code,
            url: `/en/partner/invitations/${invitation.data.token}`,
          };
        },
      });
      return config;
    },
  },
  env: {
    LOCALE: 'en',
    ADMIN_EMAIL: 'admin@findeg.com',
    ADMIN_PASSWORD: 'admin',
  },
});
