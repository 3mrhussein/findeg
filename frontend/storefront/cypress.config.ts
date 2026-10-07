import { defineConfig } from 'cypress';

export default defineConfig({
  reporter: 'spec',
  reporterOptions: {
    reportDir: 'cypress/coverage/reports',
  },
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
    screenshotsFolder: 'cypress/coverage/screenshots',
    videosFolder: 'cypress/coverage/videos',
    downloadsFolder: 'cypress/coverage/downloads',
    setupNodeEvents(on, config) {
      on('task', {
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
