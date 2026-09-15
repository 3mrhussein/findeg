import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { test } from 'node:test';
import { parse } from 'yaml';
import { responseValidator } from './support/http-contract.mjs';

const document = parse(
  await readFile(new URL('../docs/contracts/openapi/v1.yaml', import.meta.url), 'utf8'),
  { merge: true },
);
const methods = ['get', 'post', 'put', 'delete', 'patch'];
const routes = new URL('../frontend/web/src/app/api/v1/', import.meta.url);

test('every released JSON route and method has an OpenAPI contract', async () => {
  const actual = [];
  for (const file of await readdir(routes, { recursive: true })) {
    if (!file.endsWith('route.ts')) continue;
    const source = await readFile(new URL(file, routes), 'utf8');
    const path = '/' + file.replace(/\/route.ts$/, '').replace(/\[([^\]]+)\]/g, '{$1}');
    for (const method of methods) {
      if (new RegExp(`export async function ${method.toUpperCase()}\\b`).test(source))
        actual.push(`${method} ${path}`);
    }
  }
  const documented = Object.entries(document.paths).flatMap(([path, item]) =>
    methods.filter((method) => item[method]).map((method) => `${method} ${path}`),
  );
  assert.deepEqual(documented.sort(), actual.sort());
});

test('JSON outcomes have schemas, operation IDs and explicit retry semantics', () => {
  const ids = new Set();
  for (const [path, item] of Object.entries(document.paths)) {
    for (const method of methods) {
      const operation = item[method];
      if (!operation) continue;
      assert.equal(typeof operation.operationId, 'string', `${method} ${path}`);
      assert.ok(!ids.has(operation.operationId));
      ids.add(operation.operationId);
      if (method !== 'get')
        assert.equal(typeof operation['x-idempotency'], 'string', `${method} ${path}`);
      for (const [code, response] of Object.entries(operation.responses)) {
        for (const key of Object.keys(response))
          assert.ok(
            ['description', 'headers', 'content', 'links', '$ref'].includes(key) ||
              key.startsWith('x-'),
            `${method} ${path} ${code}: invalid Response Object field ${key}`,
          );
        if (!response.$ref) assert.equal(typeof response.description, 'string');
        if (code !== '204')
          assert.ok(
            response.content?.['application/json']?.schema || response.$ref,
            `${method} ${path} ${code}`,
          );
        if (code !== '204') assert.equal(typeof responseValidator(path, method, code), 'function');
      }
    }
  }
});

test('all OpenAPI references resolve', () => {
  function visit(value) {
    if (!value || typeof value !== 'object') return;
    if (value.$ref) {
      assert.ok(value.$ref.startsWith('#/'));
      let target = document;
      for (const part of value.$ref.slice(2).split('/'))
        target = target?.[part.replaceAll('~1', '/').replaceAll('~0', '~')];
      assert.ok(target, value.$ref);
    }
    Object.values(value).forEach(visit);
  }
  visit(document);
});
