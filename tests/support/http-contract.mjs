import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import Ajv from 'ajv';
import { parse } from 'yaml';

const document = parse(
  readFileSync(new URL('../../docs/contracts/openapi/v1.yaml', import.meta.url), 'utf8'),
  { merge: true },
);
// The contract uses the JSON Schema keywords supported by this validator.
const validator = new Ajv({ allErrors: true });
validator.addSchema(document, 'findeg-v1');
export function responseValidator(path, method, status) {
  const escaped = path.replaceAll('~', '~0').replaceAll('/', '~1');
  const response = document.paths[path][method].responses[status];
  const pointer = response.$ref?.slice(1) ?? `/paths/${escaped}/${method}/responses/${status}`;
  return validator.compile({
    $ref: `findeg-v1#${pointer}/content/application~1json/schema`,
  });
}
export async function assertContractResponse(path, method, response) {
  assert.match(response.headers.get('content-type'), /application\/json/);
  const value = await response.json();
  const validate = responseValidator(path, method, response.status);
  assert.ok(validate(value), JSON.stringify(validate.errors));
  return value;
}
