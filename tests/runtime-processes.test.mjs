import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createServer } from 'node:net';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const revision = 'a'.repeat(40);
async function freePort() {
  const server = createServer();
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const { port } = server.address();
  await new Promise((resolve) => server.close(resolve));
  return port;
}
async function launch(t, command, args, port) {
  const child = spawn(command, args, {
    cwd: root,
    env: {
      ...process.env,
      NODE_ENV: 'production',
      RELEASE_REVISION: revision,
      WORKER_PORT: String(port),
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  child.stdout.on('data', (data) => {
    output += data;
  });
  child.stderr.on('data', (data) => {
    output += data;
  });
  const stop = async () => {
    if (child.exitCode !== null || child.signalCode !== null) return;
    const exited = once(child, 'exit');
    child.kill('SIGTERM');
    const timeout = setTimeout(() => child.kill('SIGKILL'), 5000);
    try {
      await exited;
    } finally {
      clearTimeout(timeout);
    }
  };
  t.after(stop);
  const base = `http://127.0.0.1:${port}`;
  for (let attempt = 0; attempt < 150; attempt++) {
    if (child.exitCode !== null) throw new Error(`Process exited: ${output}`);
    try {
      const response = await fetch(`${base}/health/live`);
      if (response.ok) return { base, stop, child };
    } catch {}
    await delay(100);
  }
  throw new Error(`Process failed to start: ${output}`);
}

test(
  'one web host serves distinct portal layouts and rejects legacy-cookie access to protected pages',
  { timeout: 30000 },
  async (t) => {
    const port = await freePort();
    const web = await launch(
      t,
      process.execPath,
      [
        'frontend/web/node_modules/next/dist/bin/next',
        'start',
        'frontend/web',
        '--hostname',
        '127.0.0.1',
        '--port',
        String(port),
      ],
      port,
    );
    const storefront = await fetch(`${web.base}/en`);
    assert.equal(storefront.status, 200);
    assert.match(await storefront.text(), /Customer Storefront/);
    for (const [portal, label] of [
      ['partner', 'Partner Workspace'],
      ['back-office', 'FindEg Back Office'],
    ]) {
      const response = await fetch(`${web.base}/en/${portal}`, {
        redirect: 'manual',
        headers: {
          cookie: 'admin_session=legacy; session=forged',
          'x-portal-role': 'system_admin',
        },
      });
      assert.equal(response.status, 307);
      assert.equal(response.headers.get('location'), `/en/${portal}/sign-in`);
      assert.equal(response.headers.get('set-cookie'), null);
      const signIn = await fetch(`${web.base}/en/${portal}/sign-in`);
      assert.equal(signIn.status, 200);
      assert.match(await signIn.text(), new RegExp(label));
    }
    const arabic = await fetch(`${web.base}/ar`);
    assert.match(await arabic.text(), /dir="rtl"/);
    assert.equal((await fetch(`${web.base}/fr`)).status, 404);
  },
);

test(
  'the worker restarts independently while the same web revision continues serving',
  { timeout: 45000 },
  async (t) => {
    const webPort = await freePort();
    const workerPort = await freePort();
    const web = await launch(
      t,
      process.execPath,
      [
        'frontend/web/node_modules/next/dist/bin/next',
        'start',
        'frontend/web',
        '--hostname',
        '127.0.0.1',
        '--port',
        String(webPort),
      ],
      webPort,
    );
    const worker = await launch(t, process.execPath, ['runtime/dist/worker-main.js'], workerPort);
    const webBefore = await (await fetch(`${web.base}/health/live`)).json();
    assert.equal(
      (await (await fetch(`${worker.base}/health/live`)).json()).revision,
      webBefore.revision,
    );
    assert.equal((await fetch(`${worker.base}/health/ready`)).status, 503);
    await worker.stop();
    assert.deepEqual(await (await fetch(`${web.base}/health/live`)).json(), webBefore);
    const restarted = await launch(
      t,
      process.execPath,
      ['runtime/dist/worker-main.js'],
      workerPort,
    );
    assert.equal(
      (await (await fetch(`${restarted.base}/health/live`)).json()).revision,
      webBefore.revision,
    );
    assert.equal(web.child.exitCode, null);
  },
);

test(
  'executables reject missing configuration before becoming available',
  { timeout: 20000 },
  async () => {
    for (const entry of ['worker-main.js', 'migrate-main.js']) {
      const child = spawn(process.execPath, [`runtime/dist/${entry}`], {
        cwd: root,
        env: { PATH: process.env.PATH },
        stdio: ['ignore', 'pipe', 'pipe'],
      });
      let stderr = '';
      child.stderr.on('data', (data) => {
        stderr += data;
      });
      const [code] = await once(child, 'exit');
      assert.equal(code, 1);
      assert.match(stderr, /RELEASE_REVISION/);
    }
  },
);
