import { describe, expect, it } from 'vitest';
import { z, ZodError } from 'zod';
import { validateEnv } from '../core';

describe('validateEnv', () => {
  it('reports invalid variables and preserves the validation error as the cause', () => {
    const schema = z.object({ FINDEG_ENV_TEST_REQUIRED: z.string() });

    let thrown: unknown;
    try {
      validateEnv(schema);
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(Error);
    expect((thrown as Error).message).toContain('FINDEG_ENV_TEST_REQUIRED');
    expect((thrown as Error).cause).toBeInstanceOf(ZodError);
  });
});
