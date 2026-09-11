import { createServer } from 'node:http';
import { once } from 'node:events';
import { readWorkerConfig } from './config.js';

export async function startWorker(environment: Readonly<Record<string, string | undefined>>) {
  const config = readWorkerConfig(environment);
  const server = createServer((request, response) => {
    const live = request.url === '/health/live';
    const ready = request.url === '/health/ready';
    response.writeHead(live ? 200 : ready ? 503 : 404, {
      'content-type': 'application/json',
      'cache-control': 'no-store',
    });
    response.end(
      JSON.stringify({
        process: 'worker',
        revision: config.RELEASE_REVISION,
        status: live ? 'alive' : ready ? 'delivery-not-configured' : 'not-found',
      }),
    );
  });
  server.listen(config.WORKER_PORT, config.WORKER_HOST);
  await once(server, 'listening');
  return {
    revision: config.RELEASE_REVISION,
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
        server.closeIdleConnections();
      }),
  };
}
