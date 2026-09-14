import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { createHash, randomUUID } from 'node:crypto';
import { cp, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runMigrations } from '../db/dist/runtime/migrations.js';
import { launchWeb } from './support/web-process.mjs';
import { createWebRuntime } from '../runtime/dist/index.js';
import { assertContractResponse } from './support/http-contract.mjs';
const postgres = createRequire(new URL('../db/package.json', import.meta.url))('postgres');
const { drizzle } = createRequire(new URL('../db/package.json', import.meta.url))(
  'drizzle-orm/postgres-js',
);
const { migrate } = createRequire(new URL('../db/package.json', import.meta.url))(
  'drizzle-orm/postgres-js/migrator',
);

test('dedicated List Selections preserve list choices and accepted attribution', async (t) => {
  const admin = postgres(process.env.MIGRATION_TEST_DATABASE_URL, { max: 1 });
  const name = `findeg_lists_${randomUUID().replaceAll('-', '')}`;
  const url = new URL(process.env.MIGRATION_TEST_DATABASE_URL);
  url.pathname = `/${name}`;
  await admin`CREATE DATABASE ${admin(name)}`;
  let sql, runtime;
  t.after(async () => {
    await runtime?.close();
    await sql?.end();
    await admin`DROP DATABASE ${admin(name)}`;
    await admin.end();
  });
  // Seed real publications on the pre-class/section schema to exercise an additive upgrade.
  const migrationsFolder = await mkdtemp(join(tmpdir(), 'findeg-list-upgrade-'));
  t.after(() => rm(migrationsFolder, { recursive: true, force: true }));
  await cp(new URL('../db/migrations/', import.meta.url), migrationsFolder, { recursive: true });
  const journalPath = join(migrationsFolder, 'meta/_journal.json');
  const journal = JSON.parse(await readFile(journalPath, 'utf8'));
  journal.entries = journal.entries.filter((entry) => entry.idx < 14);
  await writeFile(journalPath, JSON.stringify(journal));
  const migrationConnection = postgres(url.toString(), { max: 1, onnotice: () => {} });
  try {
    await migrate(drizzle(migrationConnection), { migrationsFolder });
  } finally {
    await migrationConnection.end();
  }
  sql = postgres(url.toString(), { max: 2 });
  const environment = { RELEASE_REVISION: 'a'.repeat(40), DATABASE_URL: url.toString() };
  runtime = createWebRuntime(environment);
  const [user] =
    await sql`INSERT INTO identity.users(email) VALUES ('list@example.test') RETURNING id`;
  const [partner] =
    await sql`INSERT INTO identity.business_partners(code, name_en, name_ar, status) VALUES ('school', 'School', 'مدرسة', 'active') RETURNING id`;
  await sql`INSERT INTO identity.partner_reward_rates(business_partner_id,points_per_egp,egp_per_point,actor_id,request_key) VALUES (${partner.id},'1.000000','0.0100',${user.id},'list-fixture')`;
  const [product] =
    await sql`INSERT INTO catalog.products(localized_name, localized_description, localized_long_description) VALUES ('{"en":"Notebook","ar":"دفتر"}', '{}', '{}') RETURNING id`;
  const [variant] =
    await sql`INSERT INTO catalog.product_variants(product_id, sku, variant_key, base_price, is_default) VALUES (${product.id}, 'NOTE', 'default', '12.50', true) RETURNING id`;
  const [warehouse] =
    await sql`INSERT INTO inventory.warehouses(code, name) VALUES ('MAIN', 'Main') RETURNING id`;
  await sql`INSERT INTO inventory.inventory_balances(variant_id, warehouse_id, on_hand) VALUES (${variant.id}, ${warehouse.id}, 100)`;
  const [zone] =
    await sql`INSERT INTO sales.delivery_zones(name, fee) VALUES ('{"en":"Cairo","ar":"القاهرة"}', '20.00') RETURNING id`;
  async function list(code) {
    const [row] =
      await sql`INSERT INTO school_engine.school_supply_lists(business_partner_id, created_by, status, academic_year, school_name, grade, title_en, title_ar, public_code) VALUES (${partner.id}, ${user.id}, 'draft', '2026', 'School', ${code}, 'School list', 'قائمة المدرسة', ${code}) RETURNING id`;
    const [item] =
      await sql`INSERT INTO school_engine.school_supply_list_items(list_id, variant_id, quantity, label_en, label_ar) VALUES (${row.id}, ${variant.id}, 2, 'Notebook', 'دفتر') RETURNING id`;
    await sql`UPDATE school_engine.school_supply_lists SET status = 'published' WHERE id = ${row.id}`;
    return { ...row, itemId: item.id, code };
  }
  const first = await list('a'.repeat(32));
  const second = await list('b'.repeat(32));
  await runMigrations({ url: url.toString(), ssl: false });
  const historical = await runtime.schoolSupplyLists.readUnlisted(first.code);
  assert.equal(historical.status, 'found');
  assert.equal(historical.list.classSection, undefined);
  const owner = 'a'.repeat(64);
  await t.test(
    'required defaults resume across runtimes independently of the Cart and other lists',
    async () => {
      await runtime.commerce.replaceCart(owner, {
        items: [{ variantId: variant.id, quantity: 4 }],
      });
      const opened = await runtime.listCommerce.read(owner, first.code);
      assert.equal(opened.status, 'found');
      assert.deepEqual(opened.selection, {
        setCount: 1,
        items: [{ listItemId: first.itemId, variantId: variant.id, quantity: 2 }],
      });
      assert.equal(
        (await runtime.listCommerce.replace(owner, first.code, { setCount: 1, items: [] })).status,
        'found',
      );
      const other = createWebRuntime(environment);
      try {
        assert.deepEqual((await other.listCommerce.read(owner, first.code)).selection.items, []);
        assert.equal(
          (await other.listCommerce.read(owner, second.code)).selection.items[0].quantity,
          2,
        );
        assert.equal((await other.commerce.readCart(owner)).quote.items[0].quantity, 4);
        assert.equal(
          (await other.listCommerce.read('b'.repeat(64), first.code)).selection.items[0].quantity,
          2,
        );
      } finally {
        await other.close();
      }
    },
  );
  await t.test(
    'an incomplete purchase receives the offer every time and keeps immutable line attribution',
    async () => {
      await sql`INSERT INTO sales.list_offers(list_id, basis_points, starts_at) VALUES (${first.id}, 2000, now() - interval '1 day') ON CONFLICT (list_id) DO UPDATE SET basis_points = 2000, starts_at = EXCLUDED.starts_at`;
      const selection = {
        setCount: 1,
        items: [{ listItemId: first.itemId, variantId: variant.id, quantity: 1 }],
      };
      const selected = await runtime.listCommerce.replace(owner, first.code, selection);
      assert.equal(selected.status, 'found');
      assert.equal(selected.pricing.completeness.complete, false);
      assert.equal(selected.pricing.subtotal, '10.00');
      const quote = await runtime.listCommerce.quoteCheckout(owner, first.code, zone.id);
      assert.equal(quote.status, 'quoted');
      assert.equal(quote.total, '30.00');
      const input = {
        key: randomUUID(),
        confirmation: quote.confirmation,
        address: {
          name: 'Customer',
          email: 'customer@example.test',
          phone: '01012345678',
          street: '10 Test Street',
          city: 'Cairo',
          zoneId: zone.id,
        },
        paymentMethod: 'cash-on-delivery',
        deliveryMethod: 'home-delivery',
      };
      const [accepted, replay] = await Promise.all([
        runtime.listCommerce.acceptCheckout(owner, first.code, input),
        runtime.listCommerce.acceptCheckout(owner, first.code, input),
      ]);
      assert.equal(accepted.status, 'accepted');
      assert.deepEqual(replay, accepted);
      const [message] =
        await sql`SELECT payload FROM system.checkout_outbox WHERE payload->>'reference' = ${accepted.accessReference}`;
      const verified = await runtime.commerce.verifyGuestOrder(
        accepted.accessReference,
        message.payload.code,
      );
      assert.equal(verified.order.items[0].lineTotal, '10.00');
      assert.deepEqual(verified.order.items[0].attribution, {
        listId: first.id,
        businessPartnerId: partner.id,
        listItemId: first.itemId,
        defaultVariantId: variant.id,
        alternative: false,
        catalogUnitPrice: '12.50',
        offerBasisPoints: 2000,
        discountAmount: '2.50',
      });
      assert.equal((await runtime.commerce.readCart(owner)).quote.items[0].quantity, 4);
      assert.deepEqual((await runtime.listCommerce.read(owner, first.code)).selection.items, []);
      await runtime.listCommerce.replace(owner, first.code, selection);
      const again = await runtime.listCommerce.quoteCheckout(owner, first.code, zone.id);
      assert.equal(again.total, '30.00');
      assert.equal(
        (
          await runtime.listCommerce.acceptCheckout(owner, first.code, {
            ...input,
            key: randomUUID(),
            confirmation: again.confirmation,
          })
        ).status,
        'accepted',
      );
      assert.equal(
        (
          await runtime.listCommerce.acceptCheckout(owner, first.code, {
            ...input,
            address: { ...input.address, street: 'changed' },
          })
        ).status,
        'idempotency-conflict',
      );
    },
  );

  await t.test(
    'optional choices use only matching alternatives and reject cross-list or Exact Item substitution',
    async () => {
      const [category] =
        await sql`INSERT INTO catalog.categories(slug) VALUES ('notebooks') RETURNING id`;
      await sql`UPDATE catalog.products SET category_id = ${category.id} WHERE id = ${product.id}`;
      const [attribute] =
        await sql`INSERT INTO catalog.attributes(key, data_type, localized_label) VALUES ('ruling', 'text', '{"en":"Ruling","ar":"تسطير"}') RETURNING id`;
      await sql`INSERT INTO catalog.variant_attributes(variant_id, attribute_id, value_text) VALUES (${variant.id}, ${attribute.id}, 'lined')`;
      const [alternative] =
        await sql`INSERT INTO catalog.product_variants(product_id, sku, variant_key, base_price) VALUES (${product.id}, 'ALT', 'alt', '10.00') RETURNING id`;
      await sql`INSERT INTO catalog.variant_attributes(variant_id, attribute_id, value_text) VALUES (${alternative.id}, ${attribute.id}, 'lined')`;
      await sql`INSERT INTO inventory.inventory_balances(variant_id, warehouse_id, on_hand) VALUES (${alternative.id}, ${warehouse.id}, 50)`;
      const [draft] =
        await sql`INSERT INTO school_engine.school_supply_lists(business_partner_id, created_by, academic_year, school_name, grade, title_en, title_ar) VALUES (${partner.id}, ${user.id}, '2026', 'School', 'Optional', 'Optional list', 'قائمة اختيارية') RETURNING id`;
      const spec = { categoryId: category.id, attributes: { ruling: 'lined' } };
      const [optional] =
        await sql`INSERT INTO school_engine.school_supply_list_items(list_id, variant_id, quantity, label_en, label_ar, required, specification) VALUES (${draft.id}, ${variant.id}, 1, 'Optional notebook', 'دفتر اختياري', false, ${sql.json(spec)}) RETURNING id`;
      const [exact] =
        await sql`INSERT INTO school_engine.school_supply_list_items(list_id, variant_id, quantity, label_en, label_ar, exact_item) VALUES (${draft.id}, ${variant.id}, 1, 'Exact notebook', 'دفتر محدد', 1) RETURNING id`;
      const code = 'c'.repeat(32);
      await sql`UPDATE school_engine.school_supply_lists SET status = 'published', public_code = ${code} WHERE id = ${draft.id}`;
      const read = await runtime.listCommerce.read(owner, code);
      assert.equal(read.selection.items.length, 1);
      assert.equal(read.selection.items[0].listItemId, exact.id);
      assert.deepEqual(
        read.options
          .find((option) => option.listItemId === optional.id)
          .variants.map((value) => value.id),
        [variant.id, alternative.id],
      );
      const choice = {
        setCount: 1,
        items: [{ listItemId: optional.id, variantId: alternative.id, quantity: 1 }],
      };
      assert.equal(
        (await runtime.listCommerce.replace(owner, code, choice)).pricing.subtotal,
        '10.00',
      );
      assert.equal(
        (
          await runtime.listCommerce.replace(owner, code, {
            ...choice,
            items: [{ ...choice.items[0], listItemId: exact.id }],
          })
        ).status,
        'selection-unavailable',
      );
      assert.equal(
        (
          await runtime.listCommerce.replace(owner, code, {
            ...choice,
            items: [{ ...choice.items[0], listItemId: first.itemId }],
          })
        ).status,
        'selection-unavailable',
      );
      await sql`UPDATE catalog.variant_attributes SET value_text = 'plain' WHERE variant_id = ${alternative.id}`;
      assert.equal(
        (await runtime.listCommerce.quoteCheckout(owner, code, zone.id)).status,
        'selection-unavailable',
      );
      await assert.rejects(
        sql`UPDATE school_engine.school_supply_list_items SET required = true WHERE id = ${optional.id}`,
        /immutable/,
      );
    },
  );

  const address = {
    name: 'Customer',
    email: 'customer@example.test',
    phone: '01012345678',
    street: '10 Test Street',
    city: 'Cairo',
    zoneId: zone.id,
  };
  const chosen = {
    setCount: 1,
    items: [{ listItemId: first.itemId, variantId: variant.id, quantity: 1 }],
  };
  const checkoutInput = (quote) => ({
    key: randomUUID(),
    confirmation: quote.confirmation,
    address,
    paymentMethod: 'cash-on-delivery',
    deliveryMethod: 'home-delivery',
  });
  await t.test(
    'changed prices, List Offers, or set counts require explicit reconfirmation',
    async () => {
      await runtime.listCommerce.replace(owner, first.code, chosen);
      for (const change of [
        () =>
          sql`UPDATE catalog.product_variants SET base_price = '15.00' WHERE id = ${variant.id}`,
        () => sql`UPDATE sales.list_offers SET basis_points = 3000 WHERE list_id = ${first.id}`,
        () => runtime.listCommerce.replace(owner, first.code, { ...chosen, setCount: 2 }),
      ]) {
        const input = checkoutInput(
          await runtime.listCommerce.quoteCheckout(owner, first.code, zone.id),
        );
        await change();
        assert.equal(
          (await runtime.listCommerce.acceptCheckout(owner, first.code, input)).status,
          'reconfirmation-required',
        );
      }
    },
  );
  await t.test(
    'outbox failure rolls back the list Order, reservations, and selection clearing',
    async () => {
      const input = checkoutInput(
        await runtime.listCommerce.quoteCheckout(owner, first.code, zone.id),
      );
      const [before] = await sql`SELECT count(*)::int AS count FROM sales.accepted_orders`;
      const [stock] =
        await sql`SELECT reserved FROM inventory.inventory_balances WHERE variant_id = ${variant.id}`;
      await sql`CREATE FUNCTION system.list_test_failure() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'outbox unavailable'; END; $$`;
      await sql`CREATE TRIGGER list_test_failure BEFORE INSERT ON system.checkout_outbox FOR EACH ROW EXECUTE FUNCTION system.list_test_failure()`;
      try {
        await assert.rejects(runtime.listCommerce.acceptCheckout(owner, first.code, input));
        assert.equal(
          (await sql`SELECT count(*)::int AS count FROM sales.accepted_orders`)[0].count,
          before.count,
        );
        assert.equal(
          (
            await sql`SELECT reserved FROM inventory.inventory_balances WHERE variant_id = ${variant.id}`
          )[0].reserved,
          stock.reserved,
        );
        assert.equal(
          (await runtime.listCommerce.read(owner, first.code)).selection.items.length,
          1,
        );
      } finally {
        await sql`DROP TRIGGER list_test_failure ON system.checkout_outbox`;
        await sql`DROP FUNCTION system.list_test_failure()`;
      }
      assert.equal(
        (await runtime.listCommerce.acceptCheckout(owner, first.code, input)).status,
        'accepted',
      );
    },
  );
  await t.test(
    'expired selections reset required defaults after thirty days of inactivity',
    async () => {
      await runtime.listCommerce.replace(owner, second.code, { setCount: 3, items: [] });
      await sql`UPDATE sales.list_selections SET updated_at = now() - interval '31 days' WHERE owner_digest = ${owner} AND list_id = ${second.id}`;
      const resumed = await runtime.listCommerce.read(owner, second.code);
      assert.equal(resumed.selection.setCount, 1);
      assert.equal(resumed.selection.items[0].quantity, 2);
    },
  );
  await t.test(
    'archived sources and their saved selections stay viewable but cannot change or checkout',
    async () => {
      await runtime.listCommerce.replace(owner, first.code, chosen);
      const input = checkoutInput(
        await runtime.listCommerce.quoteCheckout(owner, first.code, zone.id),
      );
      await sql`UPDATE school_engine.school_supply_lists SET status = 'archived', replaced_by_id = ${second.id} WHERE id = ${first.id}`;
      const viewed = await runtime.listCommerce.read(owner, first.code);
      assert.equal(viewed.status, 'found');
      assert.equal(viewed.list.replacedById, second.id);
      assert.deepEqual(viewed.selection, chosen);
      assert.equal((await runtime.schoolSupplyLists.readUnlisted(first.code)).status, 'found');
      assert.equal(
        (await runtime.listCommerce.replace(owner, first.code, { setCount: 1, items: [] })).status,
        'list-unavailable',
      );
      assert.equal(
        (await runtime.listCommerce.quoteCheckout(owner, first.code, zone.id)).status,
        'list-unavailable',
      );
      assert.equal(
        (await runtime.listCommerce.acceptCheckout(owner, first.code, input)).status,
        'list-unavailable',
      );
      assert.equal(
        (await runtime.listCommerce.read(owner, second.code)).selection.items[0].quantity,
        2,
      );
    },
  );

  await t.test(
    'Partner List mutations authenticate current credentials, enforce scope and freeze published specifications',
    async (t) => {
      const [invitation] =
        await sql`INSERT INTO identity.partner_invitations(business_partner_id, email, roles, token_digest, inviter_id, expires_at, status) VALUES (${partner.id}, 'list@example.test', ARRAY['list-manager'], ${'9'.repeat(64)}, ${user.id}, now() + interval '1 day', 'accepted') RETURNING id`;
      await sql`INSERT INTO identity.partner_memberships(business_partner_id, user_id, invitation_id, roles) VALUES (${partner.id}, ${user.id}, ${invitation.id}, ARRAY['list-manager'])`;
      const session = {
        userId: user.id,
        email: 'list@example.test',
        emailVerified: true,
        activePortal: 'partner',
        authorizationVersion: 1,
        staffRoles: [],
        permissions: [],
        partner: {
          businessPartnerId: partner.id,
          membershipId: 1,
          roles: ['list-manager'],
          authorizationVersion: 1,
        },
      };
      assert.equal(
        (
          await runtime.schoolSupplyLists.createDraft(session, partner.id, {
            academicYear: '2026',
            schoolName: 'School',
            grade: '6',
            title: { en: 'Forged list', ar: 'قائمة مزورة' },
          })
        ).status,
        'authentication-required',
        'caller-constructed Current Sessions cannot authorize a mutation',
      );
      const token = 'f'.repeat(64);
      const digest = createHash('sha256').update(token).digest('hex');
      await sql`UPDATE identity.users SET email_verified = now() WHERE id = ${user.id}`;
      await sql`INSERT INTO identity.sessions(token_digest, user_id, authorization_version, expires_at) SELECT ${digest}, id, authorization_version, now() + interval '1 day' FROM identity.users WHERE id = ${user.id}`;
      const historicalClone = await runtime.schoolSupplyLists.clone(token, partner.id, second.id);
      assert.equal(historicalClone.status, 'created');
      assert.equal(historicalClone.list.classSection, undefined);
      const created = await runtime.schoolSupplyLists.createDraft(token, partner.id, {
        academicYear: '2026',
        schoolName: 'School',
        grade: '6',
        classSection: '  6 أ  ',
        title: { en: 'Published list', ar: 'قائمة منشورة' },
      });
      assert.equal(created.status, 'created');
      assert.equal(created.list.classSection, '6 أ');
      const [category] =
        await sql`SELECT category_id FROM catalog.products WHERE id = ${product.id}`;
      const specification = { categoryId: category.category_id, attributes: { ruling: 'lined' } };
      const item = {
        variantId: variant.id,
        quantity: 2,
        required: true,
        exactItem: false,
        label: { en: 'Notebook', ar: 'دفتر' },
        specification,
      };
      assert.equal(
        (await runtime.schoolSupplyLists.replaceDraft(token, partner.id, created.list.id, [item]))
          .status,
        'updated',
      );
      const published = await runtime.schoolSupplyLists.publish(token, partner.id, created.list.id);
      assert.equal(published.status, 'published');
      assert.equal(published.list.classSection, '6 أ');
      assert.equal(
        (await runtime.schoolSupplyLists.readUnlisted(published.list.publicCode)).list.classSection,
        '6 أ',
      );
      // Compare the HTTP rejection with the same authorized application's outcome.
      const server = await launchWeb(t, environment);
      try {
        const endpoint = `${server.base}/api/v1/partner/${partner.id}/school-supply-lists`;
        const headers = {
          origin: server.base,
          cookie: `findeg_session=${token}`,
          'content-type': 'application/json',
        };
        async function mutate(body, expectedStatus = 200) {
          const response = await fetch(endpoint, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
          });
          assert.equal(response.status, expectedStatus);
          return assertContractResponse(
            '/partner/{partnerId}/school-supply-lists',
            'post',
            response,
          );
        }
        await t.test(
          'class/section rejects blank and non-string input at application and HTTP seams',
          async () => {
            for (const classSection of ['', '  \t ', null, 6, true, {}, []]) {
              const input = {
                academicYear: '2026',
                schoolName: 'School',
                grade: '6',
                classSection,
                title: { en: 'Invalid section', ar: 'فصل غير صالح' },
              };
              assert.equal(
                (await runtime.schoolSupplyLists.createDraft(token, partner.id, input)).status,
                'invalid-input',
              );
              assert.equal(
                (await mutate({ action: 'create', input }, 400)).errorCode,
                'invalid-input',
              );
            }
          },
        );
        await t.test(
          'HTTP preserves optional class/section through publication and replacement',
          async () => {
            for (const classSection of ['  6 ب  ', undefined]) {
              const draft = await mutate(
                {
                  action: 'create',
                  input: {
                    academicYear: '2026',
                    schoolName: 'School',
                    grade: '6',
                    classSection,
                    title: { en: 'Section list', ar: 'قائمة الفصل' },
                  },
                },
                201,
              );
              const expectedSection = classSection === undefined ? undefined : '6 ب';
              assert.equal(draft.list.classSection, expectedSection);
              assert.equal(Object.hasOwn(draft.list, 'classSection'), classSection !== undefined);
              await mutate({ action: 'replace', listId: draft.list.id, items: [item] });
              // A different section (including no section) cannot replace this publication.
              assert.equal(
                (
                  await runtime.schoolSupplyLists.publish(
                    token,
                    partner.id,
                    draft.list.id,
                    published.list.id,
                  )
                ).status,
                'replacement-unavailable',
              );
              const mismatch = await mutate(
                {
                  action: 'publish',
                  listId: draft.list.id,
                  replacesListId: published.list.id,
                },
                409,
              );
              assert.equal(mismatch.errorCode, 'replacement-unavailable');
              const publication = await mutate({ action: 'publish', listId: draft.list.id });
              assert.equal(publication.list.classSection, expectedSection);
              const clone = await mutate({ action: 'clone', listId: draft.list.id }, 201);
              assert.equal(clone.list.classSection, expectedSection);
              assert.equal(clone.list.sourceListId, draft.list.id);
              const replacement = await mutate({
                action: 'publish',
                listId: clone.list.id,
                replacesListId: draft.list.id,
              });
              assert.equal(replacement.list.classSection, expectedSection);
              assert.equal(replacement.list.replacesListId, draft.list.id);
              for (const [list, status] of [
                [publication.list, 'archived'],
                [replacement.list, 'published'],
              ]) {
                const response = await fetch(
                  `${server.base}/api/v1/school-supply-lists/${list.publicCode}`,
                );
                const read = await assertContractResponse(
                  '/school-supply-lists/{code}',
                  'get',
                  response,
                );
                assert.equal(read.list.classSection, expectedSection);
                assert.equal(Object.hasOwn(read.list, 'classSection'), classSection !== undefined);
                assert.equal(read.list.status, status);
                await assert.rejects(
                  sql`UPDATE school_engine.school_supply_lists SET class_section = 'changed' WHERE id = ${list.id}`,
                  /immutable/,
                );
                assert.equal(
                  (await mutate({ action: 'replace', listId: list.id, items: [item] }, 409))
                    .errorCode,
                  'immutable',
                );
              }
            }
            assert.equal(
              (await runtime.schoolSupplyLists.readUnlisted(published.list.publicCode)).list.status,
              'published',
            );
          },
        );
        const direct = await runtime.schoolSupplyLists.replaceDraft(
          token,
          partner.id,
          created.list.id,
          [item],
        );
        const rejected = await fetch(endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify({ action: 'replace', listId: created.list.id, items: [item] }),
        });
        assert.equal(rejected.status, 409);
        assert.deepEqual(
          await assertContractResponse(
            '/partner/{partnerId}/school-supply-lists',
            'post',
            rejected,
          ),
          {
            errorCode: direct.status,
            message: direct.status,
          },
        );
        assert.equal(rejected.headers.get('set-cookie'), null);
        const invalid = await fetch(endpoint, { method: 'POST', headers, body: '{' });
        assert.equal(invalid.status, 400);
        const anonymous = await fetch(endpoint, {
          method: 'POST',
          headers: { origin: server.base, 'content-type': 'application/json' },
          body: JSON.stringify({ action: 'clone', listId: created.list.id }),
        });
        assert.equal(anonymous.status, 401);
        const unknown = await fetch(endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify({ action: 'clone', listId: 999999 }),
        });
        assert.equal(unknown.status, 404);
        // All mutation entry points resolve credentials in the same transaction as the write.
        const mutations = [
          {
            action: 'create',
            input: {
              academicYear: '2026',
              schoolName: 'School',
              grade: '7',
              classSection: '7 أ',
              title: { en: 'List', ar: 'قائمة' },
            },
          },
          { action: 'replace', listId: created.list.id, items: [item] },
          { action: 'publish', listId: created.list.id },
          { action: 'clone', listId: created.list.id },
        ];
        const directMutation = (credential, selected, mutation) => {
          if (mutation.action === 'create')
            return runtime.schoolSupplyLists.createDraft(credential, selected, mutation.input);
          if (mutation.action === 'replace')
            return runtime.schoolSupplyLists.replaceDraft(
              credential,
              selected,
              mutation.listId,
              mutation.items,
            );
          if (mutation.action === 'publish')
            return runtime.schoolSupplyLists.publish(credential, selected, mutation.listId);
          return runtime.schoolSupplyLists.clone(credential, selected, mutation.listId);
        };
        async function rejectedMutations(credential, selected, expected, httpStatus) {
          for (const mutation of mutations) {
            assert.equal((await directMutation(credential, selected, mutation)).status, expected);
            const response = await fetch(
              `${server.base}/api/v1/partner/${selected}/school-supply-lists`,
              {
                method: 'POST',
                headers: { ...headers, cookie: `findeg_session=${credential}` },
                body: JSON.stringify(mutation),
              },
            );
            assert.equal(response.status, httpStatus);
            assert.deepEqual(
              await assertContractResponse(
                '/partner/{partnerId}/school-supply-lists',
                'post',
                response,
              ),
              {
                errorCode: expected,
                message: expected,
              },
            );
            if (expected === 'authorization-denied')
              assert.equal(response.headers.get('set-cookie'), null);
          }
        }
        await rejectedMutations(token, partner.id + 1000, 'authorization-denied', 403);
        await sql`UPDATE identity.partner_memberships SET roles = ARRAY['report-viewer'] WHERE user_id = ${user.id}`;
        await rejectedMutations(token, partner.id, 'authorization-denied', 403);
        assert.equal((await runtime.currentSession(token, 'storefront')).status, 'authenticated');
        await sql`UPDATE identity.partner_memberships SET roles = ARRAY['list-manager'] WHERE user_id = ${user.id}`;
        await sql`UPDATE identity.partner_memberships SET status = 'suspended' WHERE user_id = ${user.id}`;
        await rejectedMutations(token, partner.id, 'authorization-denied', 403);
        assert.equal((await runtime.currentSession(token, 'storefront')).status, 'authenticated');
        await sql`UPDATE identity.partner_memberships SET status = 'active' WHERE user_id = ${user.id}`;
        await rejectedMutations('unknown-credential', partner.id, 'authentication-required', 401);
        const expiredToken = '1'.repeat(64);
        const expiredDigest = createHash('sha256').update(expiredToken).digest('hex');
        await sql`INSERT INTO identity.sessions(token_digest, user_id, authorization_version, expires_at) SELECT ${expiredDigest}, id, authorization_version, now() - interval '1 day' FROM identity.users WHERE id = ${user.id}`;
        await rejectedMutations(expiredToken, partner.id, 'authentication-required', 401);
        const revokedToken = '2'.repeat(64);
        const revokedDigest = createHash('sha256').update(revokedToken).digest('hex');
        await sql`INSERT INTO identity.sessions(token_digest, user_id, authorization_version, expires_at) SELECT ${revokedDigest}, id, authorization_version, now() + interval '1 day' FROM identity.users WHERE id = ${user.id}`;
        assert.equal(
          (await runtime.currentSession(revokedToken, 'storefront')).status,
          'authenticated',
        );
        await runtime.signOut(revokedToken);
        await rejectedMutations(revokedToken, partner.id, 'authentication-required', 401);
        await sql`UPDATE identity.users SET is_active = false WHERE id = ${user.id}`;
        await rejectedMutations(token, partner.id, 'authentication-required', 401);
        await sql`UPDATE identity.users SET is_active = true WHERE id = ${user.id}`;
        // Reactivation cannot resurrect the invalidated Current Session.
        await rejectedMutations(token, partner.id, 'authentication-required', 401);
        await sql`INSERT INTO identity.sessions(token_digest, user_id, authorization_version, expires_at) SELECT ${digest}, id, authorization_version, now() + interval '1 day' FROM identity.users WHERE id = ${user.id}`;
        const unlisted = await fetch(
          `${server.base}/api/v1/school-supply-lists/${published.list.publicCode}`,
        );
        assert.deepEqual(
          await assertContractResponse('/school-supply-lists/{code}', 'get', unlisted),
          JSON.parse(
            JSON.stringify(await runtime.schoolSupplyLists.readUnlisted(published.list.publicCode)),
          ),
        );
      } finally {
        await server.stop();
      }

      assert.deepEqual(published.list.items[0].specification, specification);
      assert.equal(
        (await runtime.schoolSupplyLists.replaceDraft(token, partner.id, created.list.id, [item]))
          .status,
        'immutable',
      );
      const cloned = await runtime.schoolSupplyLists.clone(token, partner.id, created.list.id);
      assert.equal(cloned.status, 'created');
      assert.equal(cloned.list.classSection, '6 أ');
      assert.deepEqual(cloned.list.items[0].specification, specification);
      const replacement = await runtime.schoolSupplyLists.publish(
        token,
        partner.id,
        cloned.list.id,
        created.list.id,
      );
      assert.equal(replacement.status, 'published');
      assert.equal(replacement.list.classSection, '6 أ');
      assert.notEqual(replacement.list.publicCode, published.list.publicCode);
      assert.equal(
        (await runtime.schoolSupplyLists.readUnlisted(published.list.publicCode)).list.status,
        'archived',
      );
      assert.equal(
        (await runtime.schoolSupplyLists.readUnlisted(published.list.publicCode)).list.classSection,
        '6 أ',
      );
    },
  );
  await t.test(
    'List checkout and ordinary Cart checkout compete safely for the same final stock',
    async () => {
      const firstBuyer = 'd'.repeat(64),
        secondBuyer = 'e'.repeat(64);
      const [balance] =
        await sql`SELECT reserved FROM inventory.inventory_balances WHERE variant_id = ${variant.id}`;
      await sql`UPDATE inventory.inventory_balances SET on_hand = ${balance.reserved + 1} WHERE variant_id = ${variant.id}`;
      await runtime.listCommerce.replace(firstBuyer, second.code, {
        setCount: 1,
        items: [{ listItemId: second.itemId, variantId: variant.id, quantity: 1 }],
      });
      await runtime.commerce.replaceCart(secondBuyer, {
        items: [{ variantId: variant.id, quantity: 1 }],
      });
      const listInput = checkoutInput(
        await runtime.listCommerce.quoteCheckout(firstBuyer, second.code, zone.id),
      );
      const cartInput = checkoutInput(await runtime.commerce.quoteCheckout(secondBuyer, zone.id));
      const other = createWebRuntime(environment);
      try {
        const outcomes = await Promise.all([
          runtime.listCommerce.acceptCheckout(firstBuyer, second.code, listInput),
          other.commerce.acceptCheckout(secondBuyer, cartInput),
        ]);
        assert.deepEqual(outcomes.map((value) => value.status).sort(), [
          'accepted',
          'insufficient-stock',
        ]);
      } finally {
        await other.close();
        await sql`UPDATE inventory.inventory_balances SET on_hand = 100 WHERE variant_id = ${variant.id}`;
      }
    },
  );

  await t.test(
    'HTTP List Selection contract preserves a separate browser identity and rejects foreign origins',
    async () => {
      const web = await launchWeb(t, { ...environment, LIST_SELECTION_INACTIVITY_DAYS: '60' });
      try {
        const endpoint = `${web.base}/api/v1/commerce/list-selections/${second.code}`;
        const opened = await fetch(endpoint);
        assert.equal(opened.status, 200);
        const cookie = opened.headers.get('set-cookie');
        assert.match(cookie, /findeg_list_selection=/);
        assert.match(cookie, /Max-Age=5184000/);
        const view = await opened.json();
        assert.equal(view.selection.items[0].quantity, 2);
        const denied = await fetch(endpoint, {
          method: 'PUT',
          headers: {
            origin: 'https://foreign.test',
            cookie: cookie.split(';')[0],
            'content-type': 'application/json',
          },
          body: JSON.stringify({ setCount: 1, items: [] }),
        });
        assert.equal(denied.status, 403);
        const saved = await fetch(endpoint, {
          method: 'PUT',
          headers: {
            origin: web.base,
            cookie: cookie.split(';')[0],
            'content-type': 'application/json',
          },
          body: JSON.stringify({ setCount: 1, items: [] }),
        });
        assert.equal(saved.status, 200);
        assert.deepEqual(
          (await (await fetch(endpoint, { headers: { cookie: cookie.split(';')[0] } })).json())
            .selection.items,
          [],
        );
        const bcrypt = createRequire(new URL('../db/package.json', import.meta.url))('bcryptjs');
        const passwordHash = await bcrypt.hash('list-test-password', 4);
        await sql`INSERT INTO identity.password_credentials(user_id, password_hash) VALUES (${user.id}, ${passwordHash})`;
        const firstDevice = await runtime.signIn('list@example.test', 'list-test-password');
        const secondDevice = await runtime.signIn('list@example.test', 'list-test-password');
        assert.equal(firstDevice.status, 'authenticated');
        const accountSelection = {
          setCount: 3,
          items: [{ listItemId: second.itemId, variantId: variant.id, quantity: 3 }],
        };
        const accountSave = await fetch(endpoint, {
          method: 'PUT',
          headers: {
            origin: web.base,
            cookie: `findeg_session=${firstDevice.token}`,
            'content-type': 'application/json',
          },
          body: JSON.stringify(accountSelection),
        });
        assert.equal(accountSave.status, 200);
        const resumed = await fetch(endpoint, {
          headers: { cookie: `findeg_session=${secondDevice.token}` },
        });
        assert.deepEqual((await resumed.json()).selection, accountSelection);
        assert.deepEqual(
          (await (await fetch(endpoint, { headers: { cookie: cookie.split(';')[0] } })).json())
            .selection.items,
          [],
        );
      } finally {
        await web.stop();
      }
    },
  );
});
