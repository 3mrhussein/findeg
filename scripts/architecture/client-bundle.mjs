import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

// Inspect module identities, not words in minified code or rendered HTML.
const serverPackage =
  /\/node_modules\/(?:postgres|drizzle-orm|bcryptjs|jsonwebtoken|nodemailer|sharp)(?:\/|$)/;
const serverSource = /\/(?:db\/src\/(?!types\/)|backend\/src\/features\/[^/]+\/infrastructure\/)/;
const ordersServer =
  /\/packages\/orders\/src\/(?:index|orders|mapper|validation|errors|OrderStaffActor|orderWritePermission)(?:\.|\/)/;
const environmentSource = /\/packages\/env\/src\//;
const nodeModule = /(?:^|\/)node:[a-z_]+(?:\/|$)/;

function sources(map) {
  if (Array.isArray(map.sections) && map.sections.length > 0) {
    return map.sections.flatMap((section) => sources(section.map));
  }
  if (!Array.isArray(map.sources) || map.sources.length === 0) {
    throw new Error('Client source map has no module sources');
  }
  return map.sources.map((source) => `${map.sourceRoot ?? ''}/${source}`.replaceAll('\\', '/'));
}

export async function verifyClientBundle(buildDirectory, { frameworkPolyfill } = {}) {
  const chunks = join(buildDirectory, 'static/chunks');
  const entries = await readdir(chunks, { recursive: true, withFileTypes: true });
  const scripts = entries.filter((entry) => entry.isFile() && entry.name.endsWith('.js'));
  if (scripts.length === 0) throw new Error('No emitted client JavaScript chunks found');

  for (const script of scripts) {
    const path = join(script.parentPath, script.name);
    const code = await readFile(path, 'utf8');
    // Next copies this prebuilt browser polyfill without generating a map.
    // Compare the entire artifact instead of exempting a filename or directory.
    if (code === frameworkPolyfill) continue;
    // Turbopack hashes maps independently from their JavaScript chunks.
    const mapName = code.match(/\/\/# sourceMappingURL=([^\s]+)\s*$/)?.[1];
    if (!mapName || !/^[\w.-]+\.map$/.test(mapName)) {
      throw new Error(
        `Missing local source map reference in client chunk ${relative(buildDirectory, path)}`,
      );
    }
    const map = JSON.parse(await readFile(join(script.parentPath, mapName), 'utf8'));
    const forbidden = sources(map).filter(
      (source) =>
        serverPackage.test(source) ||
        serverSource.test(source) ||
        ordersServer.test(source) ||
        environmentSource.test(source) ||
        nodeModule.test(source),
    );
    if (forbidden.length) {
      throw new Error(
        `Server modules in client chunk ${relative(buildDirectory, path)}:\n${forbidden.join('\n')}`,
      );
    }
  }
  return scripts.length;
}
