import { createServer } from 'node:http';
import { once } from 'node:events';
import { readWorkerConfig } from './config.js';
import { createOutboxDelivery, type NotificationAdapter } from './outbox-delivery.js';

export async function startWorker(
  environment: Readonly<Record<string, string | undefined>>,
  adapter?: NotificationAdapter,
) {
  const config = readWorkerConfig(environment);
  const delivery = createOutboxDelivery(environment, adapter);

  let stopping = false;
  let activeDelivery: Promise<unknown> | null = null;
  let pollTimeout: NodeJS.Timeout | null = null;
  const abortController = new AbortController();

  const server = createServer(async (request, response) => {
    const live = request.url === '/health/live';
    const ready = request.url === '/health/ready';

    if (live) {
      response.writeHead(200, {
        'content-type': 'application/json',
        'cache-control': 'no-store',
      });
      response.end(
        JSON.stringify({
          process: 'worker',
          revision: config.RELEASE_REVISION,
          status: 'alive',
        }),
      );
      return;
    }

    if (ready) {
      try {
        const queueStatus = await delivery.status();
        const isReady = queueStatus.exhausted === 0;
        response.writeHead(isReady ? 200 : 503, {
          'content-type': 'application/json',
          'cache-control': 'no-store',
        });
        response.end(
          JSON.stringify({
            process: 'worker',
            revision: config.RELEASE_REVISION,
            status: isReady ? 'ready' : 'exhausted-failures',
            ...queueStatus,
          }),
        );
      } catch {
        response.writeHead(503, {
          'content-type': 'application/json',
          'cache-control': 'no-store',
        });
        response.end(
          JSON.stringify({
            process: 'worker',
            revision: config.RELEASE_REVISION,
            status: 'database-unavailable',
          }),
        );
      }
      return;
    }

    response.writeHead(404, {
      'content-type': 'application/json',
      'cache-control': 'no-store',
    });
    response.end(
      JSON.stringify({
        process: 'worker',
        revision: config.RELEASE_REVISION,
        status: 'not-found',
      }),
    );
  });

  server.listen(config.WORKER_PORT, config.WORKER_HOST);
  await once(server, 'listening');

  async function poll() {
    if (stopping) return;
    try {
      activeDelivery = delivery.deliverNext(abortController.signal);
      const outcome = await activeDelivery;
      activeDelivery = null;
      if (stopping) return;
      if (outcome === 'delivered') {
        setImmediate(poll);
        return;
      }
    } catch {
      activeDelivery = null;
    }
    if (stopping) return;
    pollTimeout = setTimeout(poll, config.OUTBOX_POLL_MS);
  }

  poll();

  return {
    revision: config.RELEASE_REVISION,
    close: async () => {
      stopping = true;
      if (pollTimeout) clearTimeout(pollTimeout);
      abortController.abort();
      if (activeDelivery) {
        try {
          await activeDelivery;
        } catch {
          // Delivery failure is retained in the outbox; shutdown must still close resources.
        }
      }
      await new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
        server.closeIdleConnections();
      });
      await delivery.close();
    },
  };
}
