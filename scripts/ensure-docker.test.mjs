import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

for (const available of [true, false]) {
  test(
    available ? 'reuses a running engine in CI' : 'fails without installing Docker in CI',
    {
      skip: process.platform === 'win32',
    },
    async () => {
      const directory = await mkdtemp(join(tmpdir(), 'findeg-docker-check-'));
      try {
        await writeFile(join(directory, 'docker'), `#!/bin/sh\nexit ${available ? 0 : 1}\n`, {
          mode: 0o755,
        });
        const result = spawnSync(process.execPath, ['scripts/ensure-docker.mjs'], {
          env: { ...process.env, PATH: directory, CI: 'true' },
          encoding: 'utf8',
          timeout: 5_000,
        });
        assert.equal(result.status, available ? 0 : 1);
        assert.match(
          result.stdout + result.stderr,
          available ? /Docker is ready/ : /Docker is unavailable in CI/,
        );
      } finally {
        await rm(directory, { recursive: true, force: true });
      }
    },
  );
}
