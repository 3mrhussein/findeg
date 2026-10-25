// DISPOSABLE external process deadlines; this is not the required recovery supervisor.
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
if (process.env.NODE_ENV !== 'development') {
  console.error('Requires NODE_ENV=development before candidate loading.');
  process.exit(2);
}
const targets = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ['released', 'patched', 'postgres'];
const scenarios = ['drizzle', 'reverse', 'pool', 'named', 'settings', 'transactions'];
await mkdir(new URL('evidence/', import.meta.url), { recursive: true });
const results = [];
for (const target of targets) {
  for (const scenario of scenarios) {
    const start = performance.now();
    const result = await new Promise((resolve) => {
      const child = spawn(
        process.execPath,
        [new URL('worker.mjs', import.meta.url).pathname, target, scenario],
        { env: process.env, stdio: ['ignore', 'pipe', 'pipe'] },
      );
      let stdout = '',
        stderr = '',
        timedOut = false;
      child.stdout.on('data', (data) => (stdout += data));
      child.stderr.on('data', (data) => (stderr += data));
      const timer = setTimeout(() => {
        timedOut = true;
        child.kill('SIGKILL');
      }, 15_000);
      child.on('exit', (code, signal) => {
        clearTimeout(timer);
        resolve({
          target,
          scenario,
          code,
          signal,
          timedOut,
          elapsedMs: Math.round(performance.now() - start),
          stdout,
          stderr,
        });
      });
    });
    results.push(result);
    console.log(JSON.stringify(result));
    await writeFile(
      new URL(`evidence/${target}-${scenario}.json`, import.meta.url),
      JSON.stringify(result, null, 2) + '\n',
    );
  }
}
if (results.some((r) => r.code !== 0)) process.exitCode = 1;
