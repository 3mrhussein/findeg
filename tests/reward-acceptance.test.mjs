import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { createHash, randomUUID } from 'node:crypto';
import { runMigrations } from '../db/dist/runtime/migrations.js';
import { createWebRuntime } from '../runtime/dist/index.js';
const postgres = createRequire(new URL('../db/package.json', import.meta.url))('postgres');

test('accepted list rewards use exact configured snapshots and share the acceptance transaction', async (t) => {
  const admin = postgres(process.env.MIGRATION_TEST_DATABASE_URL, { max: 1 });
  const name = `findeg_rewards_${randomUUID().replaceAll('-', '')}`;
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
  await runMigrations({ url: url.toString(), ssl: false });
  sql = postgres(url.toString(), { max: 3 });
  const environment = { RELEASE_REVISION: 'a'.repeat(40), DATABASE_URL: url.toString() };
  runtime = createWebRuntime(environment);
  const [user] =
    await sql`INSERT INTO identity.users(email) VALUES ('finance@example.test') RETURNING id`;
  await sql`INSERT INTO identity.staff_role_grants(user_id, role) VALUES (${user.id}, 'finance-manager')`;
  const token = 'a'.repeat(64);
  await sql`INSERT INTO identity.sessions(token_digest, user_id, authorization_version, expires_at) VALUES (${createHash('sha256').update(token).digest('hex')}, ${user.id}, 1, now() + interval '1 day')`;
  const [partner] =
    await sql`INSERT INTO identity.business_partners(code,name_en,name_ar,status) VALUES ('reward','Reward','مكافأة','active') RETURNING id`;
  const [product] =
    await sql`INSERT INTO catalog.products(localized_name,localized_description,localized_long_description) VALUES ('{"en":"Notebook","ar":"دفتر"}','{}','{}') RETURNING id`;
  const [variant] =
    await sql`INSERT INTO catalog.product_variants(product_id,sku,variant_key,base_price,is_default) VALUES (${product.id},'REWARD','default','12.50',true) RETURNING id`;
  const [warehouse] =
    await sql`INSERT INTO inventory.warehouses(code,name) VALUES ('MAIN','Main') RETURNING id`;
  await sql`INSERT INTO inventory.inventory_balances(variant_id,warehouse_id,on_hand) VALUES (${variant.id},${warehouse.id},100)`;
  const [zone] =
    await sql`INSERT INTO sales.delivery_zones(name,fee) VALUES ('{"en":"Cairo","ar":"القاهرة"}','20.00') RETURNING id`;
  const code = 'a'.repeat(32),
    owner = 'b'.repeat(64);
  const [list] =
    await sql`INSERT INTO school_engine.school_supply_lists(business_partner_id,created_by,academic_year,school_name,grade,title_en,title_ar,public_code) VALUES (${partner.id},${user.id},'2026','School','1','List','قائمة',${code}) RETURNING id`;
  const [item] =
    await sql`INSERT INTO school_engine.school_supply_list_items(list_id,variant_id,quantity,label_en,label_ar) VALUES (${list.id},${variant.id},1,'Notebook','دفتر') RETURNING id`;
  await sql`UPDATE school_engine.school_supply_lists SET status='published' WHERE id=${list.id}`;
  await sql`INSERT INTO sales.list_offers(list_id,basis_points) VALUES (${list.id},2000)`;
  const selection = {
    setCount: 1,
    items: [{ listItemId: item.id, variantId: variant.id, quantity: 1 }],
  };
  const configure = (key, pointsPerEgp = '1.25') =>
    runtime.rewardRates.configure(token, partner.id, { key, pointsPerEgp, egpPerPoint: '0.0125' });
  assert.deepEqual(await runtime.listCommerce.quoteCheckout(owner, code, zone.id), {
    status: 'reward-rate-unavailable',
  });
  assert.equal(
    (
      await runtime.rewardRates.configure(undefined, partner.id, {
        key: 'initial',
        pointsPerEgp: '1',
        egpPerPoint: '1',
      })
    ).status,
    'authentication-required',
  );
  assert.equal(
    (
      await runtime.rewardRates.configure(token, 999999, {
        key: 'missing',
        pointsPerEgp: '1',
        egpPerPoint: '1',
      })
    ).status,
    'partner-unavailable',
  );
  const configured = await configure('initial');
  assert.equal(configured.status, 'configured');
  assert.deepEqual(await configure('initial'), configured);
  assert.deepEqual(await configure('initial', '2'), { status: 'idempotency-conflict' });
  const quote = await runtime.listCommerce.quoteCheckout(owner, code, zone.id);
  assert.equal(quote.status, 'quoted');
  assert.equal(quote.total, '30.00');
  assert.deepEqual(quote.items[0].reward, {
    rateId: configured.rate.id,
    pointsPerEgp: '1.250000',
    egpPerPoint: '0.0125',
    points: 12,
    rewardValue: '0.15',
  });
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
  await configure('changed', '2');
  assert.deepEqual(await runtime.listCommerce.acceptCheckout(owner, code, input), {
    status: 'reconfirmation-required',
  });
  const current = await runtime.listCommerce.quoteCheckout(owner, code, zone.id);
  input.confirmation = current.confirmation;
  const [accepted, replay] = await Promise.all([
    runtime.listCommerce.acceptCheckout(owner, code, input),
    runtime.listCommerce.acceptCheckout(owner, code, input),
  ]);
  assert.equal(accepted.status, 'accepted');
  assert.deepEqual(replay, accepted);
  const [entitlement] =
    await sql`SELECT * FROM identity.partner_reward_entitlements WHERE order_reference=${accepted.reference}`;
  assert.equal(entitlement.points, 20);
  assert.equal(entitlement.eligible_subtotal, '10.00');
  assert.equal(entitlement.reward_value, '0.25');
  const events =
    await sql`SELECT * FROM identity.partner_reward_events WHERE order_reference=${accepted.reference}`;
  assert.equal(events.length, 1);
  assert.equal(events[0].event_type, 'accepted');
  assert.equal(events[0].pending_points, 20);
  assert.equal(events[0].entitlement_id, entitlement.id);
  await configure('future', '3');
  assert.deepEqual(await runtime.listCommerce.acceptCheckout(owner, code, input), accepted);
  assert.deepEqual(
    await runtime.listCommerce.acceptCheckout(owner, code, {
      ...input,
      address: { ...input.address, street: 'Changed' },
    }),
    { status: 'idempotency-conflict' },
  );
  const [stored] =
    await sql`SELECT snapshot FROM sales.accepted_orders WHERE reference=${accepted.reference}`;
  assert.deepEqual(stored.snapshot.items[0].reward, current.items[0].reward);
  await assert.rejects(
    sql`UPDATE identity.partner_reward_entitlements SET points=99 WHERE id=${entitlement.id}`,
    /append-only/,
  );
  await assert.rejects(
    sql`DELETE FROM identity.partner_reward_events WHERE entitlement_id=${entitlement.id}`,
    /append-only/,
  );
  await assert.rejects(
    sql`UPDATE identity.partner_reward_rates SET points_per_egp=99 WHERE id=${configured.rate.id}`,
    /append-only/,
  );
  await assert.rejects(
    sql`INSERT INTO identity.partner_reward_events(entitlement_id,business_partner_id,order_reference,event_type,points) VALUES (${entitlement.id},${partner.id},${accepted.reference},'accepted',20)`,
    /duplicate key/,
  );

  // A required reward write fails after Order, reservation and outbox writes: all must roll back.
  await sql`CREATE FUNCTION identity.fail_reward_insert() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'reward write failed'; END $$`;
  await sql`CREATE TRIGGER fail_reward BEFORE INSERT ON identity.partner_reward_events FOR EACH ROW EXECUTE FUNCTION identity.fail_reward_insert()`;
  await runtime.listCommerce.replace(owner, code, selection);
  const failureQuote = await runtime.listCommerce.quoteCheckout(owner, code, zone.id);
  const [before] =
    await sql`SELECT (SELECT count(*) FROM sales.accepted_orders)::int orders, (SELECT count(*) FROM sales.checkout_outcomes)::int outcomes, (SELECT count(*) FROM inventory.order_reservations)::int reservations, (SELECT count(*) FROM system.checkout_outbox)::int outbox, (SELECT count(*) FROM identity.partner_reward_entitlements)::int entitlements`;
  const failureInput = { ...input, key: randomUUID(), confirmation: failureQuote.confirmation };
  await assert.rejects(
    runtime.listCommerce.acceptCheckout(owner, code, failureInput),
    (error) => error.cause?.message === 'reward write failed',
  );
  const [after] =
    await sql`SELECT (SELECT count(*) FROM sales.accepted_orders)::int orders, (SELECT count(*) FROM sales.checkout_outcomes)::int outcomes, (SELECT count(*) FROM inventory.order_reservations)::int reservations, (SELECT count(*) FROM system.checkout_outbox)::int outbox, (SELECT count(*) FROM identity.partner_reward_entitlements)::int entitlements`;
  assert.deepEqual(after, before);
  assert.deepEqual((await runtime.listCommerce.read(owner, code)).selection, selection);
  await sql`DROP TRIGGER fail_reward ON identity.partner_reward_events`;
  assert.equal(
    (await runtime.listCommerce.acceptCheckout(owner, code, failureInput)).status,
    'accepted',
  );

  await runtime.commerce.replaceCart(owner, { items: [{ variantId: variant.id, quantity: 1 }] });
  const cart = await runtime.commerce.quoteCheckout(owner, zone.id);
  const ordinary = await runtime.commerce.acceptCheckout(owner, {
    ...input,
    key: randomUUID(),
    confirmation: cart.confirmation,
  });
  assert.equal(ordinary.status, 'accepted');
  assert.equal(
    (
      await sql`SELECT * FROM identity.partner_reward_entitlements WHERE order_reference=${ordinary.reference}`
    ).length,
    0,
  );
  // Fulfillment and payment use staff credentials, accepted totals and snapshotted rewards.
  assert.equal(
    (
      await runtime.orderLifecycle.pay(token, accepted.reference, {
        key: 'pay-before-delivery',
        amount: '30.00',
      })
    ).status,
    'delivery-required',
  );
  assert.equal(
    (await runtime.orderLifecycle.deliver(token, accepted.reference, { key: 'delivery' })).status,
    'authorization-denied',
  );
  await sql`INSERT INTO identity.staff_role_grants(user_id,role) VALUES (${user.id},'fulfillment-operator')`;
  const delivered = await runtime.orderLifecycle.deliver(token, accepted.reference, {
    key: 'delivery',
  });
  assert.equal(delivered.status, 'delivered');
  assert.deepEqual(
    await runtime.orderLifecycle.deliver(token, accepted.reference, { key: 'delivery' }),
    delivered,
  );
  assert.equal(
    (await runtime.orderLifecycle.deliver(token, accepted.reference, { key: 'other-delivery' }))
      .status,
    'already-delivered',
  );
  assert.equal(
    (
      await runtime.orderLifecycle.pay(token, accepted.reference, {
        key: 'payment',
        amount: '29.99',
      })
    ).status,
    'amount-mismatch',
  );
  const [paid, paidReplay] = await Promise.all([
    runtime.orderLifecycle.pay(token, accepted.reference, { key: 'payment', amount: '30.00' }),
    runtime.orderLifecycle.pay(token, accepted.reference, { key: 'payment', amount: '30.00' }),
  ]);
  assert.equal(paid.status, 'paid');
  assert.deepEqual(paidReplay, paid);
  assert.equal(
    (
      await runtime.orderLifecycle.pay(token, accepted.reference, {
        key: 'payment',
        amount: '31.00',
      })
    ).status,
    'idempotency-conflict',
  );
  assert.equal(
    (
      await runtime.orderLifecycle.pay(token, accepted.reference, {
        key: 'other-payment',
        amount: '30.00',
      })
    ).status,
    'already-paid',
  );
  const earned =
    await sql`SELECT * FROM identity.partner_reward_events WHERE order_reference=${accepted.reference} AND event_type='paid'`;
  assert.equal(earned.length, 1);
  assert.equal(earned[0].earned_points, 20);
  assert.equal(earned[0].conversion_rate, '0.0125');
  assert.equal(earned[0].actor_id, user.id);
  const [balance] =
    await sql`SELECT on_hand,reserved FROM inventory.inventory_balances WHERE variant_id=${variant.id}`;
  assert.equal(balance.on_hand, 99);
  assert.equal(balance.reserved, 2);
  assert.equal(
    (
      await sql`SELECT * FROM inventory.order_fulfillments WHERE order_reference=${accepted.reference}`
    ).length,
    1,
  );
  assert.equal(
    (await runtime.orderLifecycle.read(token, accepted.reference)).state.paymentStatus,
    'paid',
  );
  const [unchanged] =
    await sql`SELECT snapshot FROM sales.accepted_orders WHERE reference=${accepted.reference}`;
  assert.deepEqual(unchanged.snapshot, stored.snapshot);
  const recovered = await runtime.listCommerce.acceptCheckout(owner, code, failureInput);
  await sql`CREATE FUNCTION sales.fail_lifecycle_insert() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'lifecycle write failed'; END $$`;
  await sql`CREATE TRIGGER fail_lifecycle BEFORE INSERT ON sales.order_lifecycle_events FOR EACH ROW EXECUTE FUNCTION sales.fail_lifecycle_insert()`;
  const [stockBefore] =
    await sql`SELECT on_hand,reserved FROM inventory.inventory_balances WHERE variant_id=${variant.id}`;
  await assert.rejects(
    runtime.orderLifecycle.deliver(token, recovered.reference, { key: 'recover-delivery' }),
    (error) => error.cause?.message === 'lifecycle write failed',
  );
  assert.deepEqual(
    (
      await sql`SELECT on_hand,reserved FROM inventory.inventory_balances WHERE variant_id=${variant.id}`
    )[0],
    stockBefore,
  );
  assert.equal(
    (
      await sql`SELECT * FROM inventory.order_fulfillments WHERE order_reference=${recovered.reference}`
    ).length,
    0,
  );
  await sql`DROP TRIGGER fail_lifecycle ON sales.order_lifecycle_events`;
  await runtime.orderLifecycle.deliver(token, recovered.reference, { key: 'recover-delivery' });
  await sql`CREATE TRIGGER fail_reward BEFORE INSERT ON identity.partner_reward_events FOR EACH ROW EXECUTE FUNCTION identity.fail_reward_insert()`;
  await assert.rejects(
    runtime.orderLifecycle.pay(token, recovered.reference, {
      key: 'recover-payment',
      amount: '30.00',
    }),
    (error) => error.cause?.message === 'reward write failed',
  );
  assert.equal(
    (await runtime.orderLifecycle.read(token, recovered.reference)).state.paymentStatus,
    'unpaid',
  );
  assert.equal(
    (await sql`SELECT * FROM sales.order_lifecycle_outcomes WHERE key='recover-payment'`).length,
    0,
  );
  await sql`DROP TRIGGER fail_reward ON identity.partner_reward_events`;
  const competing = await Promise.all([
    runtime.orderLifecycle.pay(token, recovered.reference, {
      key: 'recover-payment',
      amount: '30.00',
    }),
    runtime.orderLifecycle.pay(token, recovered.reference, {
      key: 'competing-payment',
      amount: '30.00',
    }),
  ]);
  assert.deepEqual(competing.map((result) => result.status).sort(), ['already-paid', 'paid']);
  await assert.rejects(
    sql`UPDATE sales.order_lifecycle_events SET amount=1 WHERE order_reference=${accepted.reference}`,
    /append-only/,
  );
  assert.equal(
    (await runtime.orderLifecycle.deliver(token, ordinary.reference, { key: 'delivery' })).status,
    'idempotency-conflict',
  );
  // Reports resolve the current Workspace and read only scoped commercial facts.
  await sql`UPDATE identity.users SET email_verified=now() WHERE id=${user.id}`;
  const [invitation] =
    await sql`INSERT INTO identity.partner_invitations(business_partner_id,email,roles,token_digest,inviter_id,expires_at,status) VALUES (${partner.id},'finance@example.test',ARRAY['report-viewer'],${randomUUID()},${user.id},now()+interval '1 day','accepted') RETURNING id`;
  const [membership] =
    await sql`INSERT INTO identity.partner_memberships(business_partner_id,user_id,invitation_id,roles) VALUES (${partner.id},${user.id},${invitation.id},ARRAY['report-viewer']) RETURNING id`;
  const [otherPartner] =
    await sql`INSERT INTO identity.business_partners(code,name_en,name_ar,status) VALUES ('other','Other','آخر','active') RETURNING id`;
  await sql`INSERT INTO identity.partner_reward_events(business_partner_id,order_reference,event_type,points,pending_points,conversion_rate) VALUES (${otherPartner.id},'private-other-order','accepted',999,999,1)`;
  const period = new Date().toISOString().slice(0, 7);
  const report = await runtime.partnerReports.read(token, partner.id, period);
  assert.equal(report.status, 'found');
  assert.deepEqual(report.report.statement, {
    points: { pending: '0', earned: '50', reversed: '0', settled: '0', available: '50' },
    value: {
      pending: '0.00',
      earned: '0.63',
      reversed: '0.00',
      settled: '0.00',
      available: '0.63',
    },
  });
  assert.deepEqual(report.report.sales, []);
  assert.equal(report.report.suppressed, true);
  assert.equal(
    (await runtime.partnerReports.read(token, otherPartner.id, period)).status,
    'authorization-denied',
  );
  assert.equal(
    (await runtime.partnerReports.read(undefined, partner.id, period)).status,
    'authentication-required',
  );
  assert.equal(JSON.stringify(report).includes('customer@example.test'), false);
  assert.equal(JSON.stringify(report).includes(accepted.reference), false);
  await runtime.listCommerce.replace(owner, code, selection);
  const thirdQuote = await runtime.listCommerce.quoteCheckout(owner, code, zone.id);
  const third = await runtime.listCommerce.acceptCheckout(owner, code, {
    ...input,
    key: randomUUID(),
    confirmation: thirdQuote.confirmation,
  });
  await runtime.orderLifecycle.deliver(token, third.reference, { key: 'third-delivery' });
  await runtime.orderLifecycle.pay(token, third.reference, {
    key: 'third-payment',
    amount: '30.00',
  });
  const visible = await runtime.partnerReports.read(token, partner.id, period);
  assert.equal(visible.report.statement.points.earned, '80');
  assert.equal(visible.report.statement.value.earned, '1.01');
  assert.equal(visible.report.sales.length, 1);
  assert.equal(visible.report.sales[0].count, 3);
  assert.equal(visible.report.sales[0].subtotal, '30.00');
  assert.equal(visible.report.sales[0].listId, list.id);
  assert.equal(visible.report.suppressed, false);
  assert.deepEqual(Object.keys(visible.report.sales[0]).sort(), [
    'count',
    'day',
    'listId',
    'listItemId',
    'subtotal',
    'variantId',
  ]);
  await sql`UPDATE identity.partner_memberships SET status='ended' WHERE id=${membership.id}`;
  assert.equal(
    (await runtime.partnerReports.read(token, partner.id, period)).status,
    'authorization-denied',
  );
  await sql`UPDATE identity.partner_memberships SET status='active',roles=ARRAY['list-manager'] WHERE id=${membership.id}`;
  assert.equal(
    (await runtime.partnerReports.read(token, partner.id, period)).status,
    'authorization-denied',
  );
  await sql`DELETE FROM identity.staff_role_grants WHERE user_id=${user.id}`;
  assert.equal((await configure('initial')).status, 'authorization-denied');
  assert.equal(
    (
      await runtime.orderLifecycle.pay(token, accepted.reference, {
        key: 'payment',
        amount: '30.00',
      })
    ).status,
    'authorization-denied',
  );
});
