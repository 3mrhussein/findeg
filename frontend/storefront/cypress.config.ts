import { DEFAULT_LOCALE, type Locale } from '@findeg/domain';
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
                localizedName: {
                  en: `PLP ${key} ${suffix}`,
                  ar: `PLP ${key} ${suffix}`,
                } satisfies Record<Locale, string | undefined>,
              })
              .returning();
            return row;
          };
          const category = async (key: string) => {
            const [row] = await db
              .insert(schema.categories)
              .values({
                slug: `cypress-plp-${key}-${suffix}`,
                localizedName: {
                  en: `PLP ${key} ${suffix}`,
                  ar: `PLP ${key} ${suffix}`,
                } satisfies Record<Locale, string | undefined>,
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
                localizedName: { en: input.name, ar: input.name } satisfies Record<
                  Locale,
                  string | undefined
                >,
                localizedDescription: { en: '', ar: '' } satisfies Record<Locale, string>,
                localizedLongDescription: { en: '', ar: '' } satisfies Record<Locale, string>,
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
            import('@findeg/school-lists'),
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
            schoolType: 'Private',
            academicSystem: 'National',
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
              localizedName: { en: 'Cypress pen', ar: 'قلم' } satisfies Record<
                Locale,
                string | undefined
              >,
              localizedDescription: { en: '', ar: '' } satisfies Record<Locale, string>,
              localizedLongDescription: { en: '', ar: '' } satisfies Record<Locale, string>,
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
                localizedTitle: { en: `Cypress ${grade} supplies`, ar: 'قائمة' } satisfies Record<
                  Locale,
                  string | undefined
                >,
              }),
            ) as { id: number };
            must(
              await service.addItem(staff, list.id, {
                variantId: defaultVariant.id,
                exactItem: false,
                specification: { categoryId: category.id, attributes: {} },
                quantity: 2,
                localizedLabel: { en: 'Cypress pen item', ar: 'قلم' } satisfies Record<
                  Locale,
                  string | undefined
                >,
              }),
            );
            must(
              await service.addItem(staff, list.id, {
                variantId: defaultVariant.id,
                exactItem: false,
                specification: { categoryId: category.id, attributes: {} },
                required: false,
                quantity: 1,
                localizedLabel: { en: 'Cypress optional item', ar: 'اختياري' } satisfies Record<
                  Locale,
                  string | undefined
                >,
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
        async createPartnerInvitation(options?: {
          expired?: boolean;
          partnerStatus?: 'onboarding' | 'active' | 'suspended' | 'closed';
        }) {
          const { randomUUID } = await import('node:crypto');
          const [{ db }, schema, { createPartnerMembershipServices }] = await Promise.all([
            import('../../db/src/connection'),
            import('../../db/src/schema/index'),
            import('@findeg/partners'),
          ]);
          const { eq } = await import('drizzle-orm');
          const suffix = randomUUID().slice(0, 8);
          const [staffUser] = await db
            .insert(schema.users)
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
          if (options?.partnerStatus) {
            await db
              .update(schema.businessPartners)
              .set({ status: options.partnerStatus })
              .where(eq(schema.businessPartners.id, partner.data.id));
          }
          const email = `cypress-invitee-${suffix}@findeg.test`;
          const invitation = await services.invitations.invite(actor, partner.data.id, {
            email,
            roles: ['partner-administrator'],
          });
          if (!invitation.success) throw new Error(invitation.error);
          if (options?.expired) {
            await db
              .update(schema.partnerInvitations)
              .set({ expiresAt: new Date(Date.now() - 3600000) })
              .where(eq(schema.partnerInvitations.id, invitation.data.id));
          }
          return {
            email,
            code: partner.data.code,
            url: `/en/partner/invitations/${invitation.data.token}`,
          };
        },
        async getVariantByProductSlug(slug: string) {
          const [{ db }, schema] = await Promise.all([
            import('../../db/src/connection'),
            import('../../db/src/schema/index'),
          ]);
          const { eq } = await import('drizzle-orm');
          const [product] = await db
            .select()
            .from(schema.products)
            .where(eq(schema.products.slug, slug));
          if (!product) return null;
          const [variant] = await db
            .select()
            .from(schema.productVariants)
            .where(eq(schema.productVariants.productId, product.id));
          return variant ?? null;
        },
        async setVariantPrice({ variantId, price }: { variantId: number; price: string }) {
          const [{ db }, schema] = await Promise.all([
            import('../../db/src/connection'),
            import('../../db/src/schema/index'),
          ]);
          const { eq } = await import('drizzle-orm');
          await db
            .update(schema.productVariants)
            .set({ basePrice: price })
            .where(eq(schema.productVariants.id, variantId));
          return null;
        },
        async setVariantStock({ variantId, onHand }: { variantId: number; onHand: number }) {
          const [{ db }, schema] = await Promise.all([
            import('../../db/src/connection'),
            import('../../db/src/schema/index'),
          ]);
          const { eq } = await import('drizzle-orm');
          await db
            .update(schema.inventoryBalances)
            .set({ onHand, reserved: 0 })
            .where(eq(schema.inventoryBalances.variantId, variantId));
          return null;
        },
        async getGuestAccessCode(orderReference: string) {
          const [{ db }, schema, { hashCode, mintCode }] = await Promise.all([
            import('../../db/src/connection'),
            import('../../db/src/schema/index'),
            import('@findeg/orders'),
          ]);
          const { eq, desc } = await import('drizzle-orm');
          const [request] = await db
            .select()
            .from(schema.guestOrderAccessRequests)
            .where(eq(schema.guestOrderAccessRequests.orderReference, orderReference))
            .orderBy(desc(schema.guestOrderAccessRequests.createdAt))
            .limit(1);
          if (!request) return null;
          const code = mintCode();
          const secret =
            process.env.GUEST_ACCESS_SECRET || 'test-guest-access-secret-1234567890123456';
          const hash = hashCode(request.id, code, secret);
          const currentHashes = Array.isArray(request.codeHashes) ? request.codeHashes : [];
          await db
            .update(schema.guestOrderAccessRequests)
            .set({ codeHashes: [...currentHashes, hash] })
            .where(eq(schema.guestOrderAccessRequests.id, request.id));
          return code;
        },
      });
      return config;
    },
  },
  env: {
    LOCALE: DEFAULT_LOCALE,
    ADMIN_EMAIL: 'admin@findeg.com',
    ADMIN_PASSWORD: 'admin',
  },
});
