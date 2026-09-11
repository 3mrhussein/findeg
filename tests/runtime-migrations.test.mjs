import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { randomUUID } from 'node:crypto';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const postgres = createRequire(new URL('../db/package.json', import.meta.url))('postgres');
const exec = promisify(execFile);
const entry = fileURLToPath(new URL('../runtime/dist/migrate-main.js', import.meta.url));

test(
  'the migration executable applies one ordered history and can be rerun from any directory',
  { timeout: 30000 },
  async () => {
    assert.ok(
      process.env.MIGRATION_TEST_DATABASE_URL,
      'MIGRATION_TEST_DATABASE_URL must explicitly select a test PostgreSQL server',
    );
    const url = new URL(process.env.MIGRATION_TEST_DATABASE_URL);
    const admin = postgres(url.toString(), { max: 1 });
    const name = `findeg_runtime_${randomUUID().replaceAll('-', '')}`;
    let created = false;
    let database;
    try {
      await admin`CREATE DATABASE ${admin(name)}`;
      created = true;
      url.pathname = `/${name}`;
      const environment = {
        PATH: process.env.PATH,
        RELEASE_REVISION: 'a'.repeat(40),
        DATABASE_URL: url.toString(),
        DB_SSL: 'false',
      };
      for (let attempt = 0; attempt < 2; attempt++) {
        await exec(process.execPath, [entry], { cwd: tmpdir(), env: environment, timeout: 10000 });
      }
      database = postgres(url.toString(), { max: 1 });
      const [history] =
        await database`SELECT count(*)::int AS count FROM drizzle.__drizzle_migrations`;
      assert.equal(history.count, 2);
      const [column] =
        await database`SELECT column_default FROM information_schema.columns WHERE table_schema = 'identity' AND table_name = 'users' AND column_name = 'authorization_version'`;
      assert.equal(column.column_default, '1');
    } finally {
      await database?.end();
      if (created) await admin`DROP DATABASE ${admin(name)}`;
      await admin.end();
    }
  },
);
