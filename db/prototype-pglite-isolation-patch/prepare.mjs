// DISPOSABLE: mechanically port only the selected commit onto released source.
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';

if (process.env.NODE_ENV !== 'development') process.exit(2);
const { default: ts } = await import('typescript');
const root = new URL('./', import.meta.url);
const hashes = {};
// This private workspace package is not published to npm. Build its exact pinned
// source, erasing types and adding Node ESM extensions, without semantic changes.
const parser = new URL('upstream/pg-protocol/', root);
await mkdir(new URL('dist/', parser), { recursive: true });
for (const file of await readdir(new URL('src/', parser))) {
  const source = await readFile(new URL(`src/${file}`, parser), 'utf8');
  const compiled = ts
    .transpileModule(source, {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
    })
    .outputText.replace(/(from |export \* as \w+ from )(['"])(\.\/[^'"]+)(['"])/g, '$1$2$3.js$4');
  await writeFile(new URL(`dist/${file.replace(/\.ts$/, '.js')}`, parser), compiled);
  hashes[`upstream/pg-protocol/src/${file}`] = createHash('sha256').update(source).digest('hex');
}
const released = await readFile(new URL('upstream/released-index.ts', root));
const patch = await readFile(new URL('upstream/isolation.patch', root), 'utf8');
const implementation = patch
  .slice(patch.indexOf('diff --git '))
  .split('diff --git a/packages/pglite-socket/tests/')[0];
await mkdir(new URL('.scratch/', root), { recursive: true });
const target = new URL('.scratch/ported.ts', root);
await writeFile(target, released);
const result = spawnSync('patch', ['--fuzz=0', target.pathname], {
  input: implementation,
  encoding: 'utf8',
});
if (result.status !== 0) throw new Error(result.stdout + result.stderr);
const ported = await readFile(target, 'utf8');
const archived = await readFile(new URL('upstream/patched-index.ts', root), 'utf8');
if (ported !== archived) throw new Error('Port differs from archived source');
const built = ts.transpileModule(ported, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
}).outputText;
await writeFile(new URL('candidate.mjs', root), built);
for (const file of [
  'upstream/released-index.ts',
  'upstream/isolation.patch',
  'upstream/pinned-index.ts',
  'upstream/patched-index.ts',
  'candidate.mjs',
]) {
  hashes[file] = createHash('sha256')
    .update(await readFile(new URL(file, root)))
    .digest('hex');
}
await writeFile(new URL('evidence/hashes.json', root), JSON.stringify(hashes, null, 2) + '\n');
await writeFile(
  new URL('evidence/environment.json', root),
  JSON.stringify(
    {
      node: process.version,
      platform: process.platform,
      arch: process.arch,
      compilerPackage: '@typescript/typescript6@6.0.2',
      compilerVersion: ts.version,
    },
    null,
    2,
  ) + '\n',
);
console.log('Exact selected implementation diff applied with fuzz=0; candidate hashes archived.');
